const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { toMinorUnits, toMajorUnits } = require('../utils/currency');

// Helper to update account balance in minor units
const applyBalanceDelta = async (accountId, deltaMinor) => {
  if (!accountId || deltaMinor === 0) return;
  const account = await Account.findById(accountId);
  if (!account) return;

  const currentMinor = toMinorUnits(account.currentBalance);
  account.currentBalance = toMajorUnits(currentMinor + deltaMinor);
  await account.save();
};

const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      account,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { owner: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (account) {
      filter.$or = [{ account }, { destinationAccount: account }];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { description: searchRegex },
        { merchant: searchRegex },
        { notes: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name icon color type')
        .populate('account', 'name type color currency')
        .populate('destinationAccount', 'name type color currency'),
      Transaction.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 'success',
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      currency,
      description,
      category,
      account,
      destinationAccount,
      date,
      paymentMethod,
      merchant,
      tags,
      notes,
      receiptUrl,
      recurringTransaction
    } = req.body;

    if (!type || !amount || !description || !account) {
      throw new BadRequestError('Type, amount, description, and account are required.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestError('Amount must be a positive number.');
    }

    // Verify source account ownership
    const srcAccount = await Account.findOne({ _id: account, owner: req.user._id });
    if (!srcAccount) {
      throw new BadRequestError('Selected account does not exist or you do not have permission.');
    }

    if (type === 'transfer') {
      if (!destinationAccount) {
        throw new BadRequestError('Destination account is required for transfers.');
      }
      if (account.toString() === destinationAccount.toString()) {
        throw new BadRequestError('Source and destination accounts must be different.');
      }
      const destAccount = await Account.findOne({ _id: destinationAccount, owner: req.user._id });
      if (!destAccount) {
        throw new BadRequestError('Destination account does not exist or you do not have permission.');
      }
    }

    const transaction = await Transaction.create({
      owner: req.user._id,
      type,
      amount: numAmount,
      currency: currency || srcAccount.currency || req.user.preferredCurrency,
      description: description.trim(),
      category: type === 'transfer' ? null : category || null,
      account,
      destinationAccount: type === 'transfer' ? destinationAccount : null,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'bank_transfer',
      merchant: merchant ? merchant.trim() : '',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes ? notes.trim() : '',
      receiptUrl: receiptUrl || null,
      recurringTransaction: recurringTransaction || null
    });

    // Update balances atomically in minor units
    const amountMinor = toMinorUnits(numAmount);
    if (type === 'income') {
      await applyBalanceDelta(account, amountMinor);
    } else if (type === 'expense') {
      await applyBalanceDelta(account, -amountMinor);
    } else if (type === 'refund') {
      await applyBalanceDelta(account, amountMinor);
    } else if (type === 'transfer') {
      await applyBalanceDelta(account, -amountMinor);
      await applyBalanceDelta(destinationAccount, amountMinor);
    }

    const populated = await Transaction.findById(transaction._id)
      .populate('category', 'name icon color type')
      .populate('account', 'name type color currency')
      .populate('destinationAccount', 'name type color currency');

    res.status(201).json({
      status: 'success',
      message: 'Transaction recorded successfully.',
      transaction: populated
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('category', 'name icon color type')
      .populate('account', 'name type color currency')
      .populate('destinationAccount', 'name type color currency');

    if (!transaction) {
      throw new NotFoundError('Transaction not found.');
    }

    res.status(200).json({
      status: 'success',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, owner: req.user._id });
    if (!transaction) {
      throw new NotFoundError('Transaction not found.');
    }

    // First revert the previous balance impact
    const oldMinor = toMinorUnits(transaction.amount);
    if (transaction.type === 'income') {
      await applyBalanceDelta(transaction.account, -oldMinor);
    } else if (transaction.type === 'expense') {
      await applyBalanceDelta(transaction.account, oldMinor);
    } else if (transaction.type === 'refund') {
      await applyBalanceDelta(transaction.account, -oldMinor);
    } else if (transaction.type === 'transfer') {
      await applyBalanceDelta(transaction.account, oldMinor);
      await applyBalanceDelta(transaction.destinationAccount, -oldMinor);
    }

    // Apply updates
    const {
      type,
      amount,
      description,
      category,
      account,
      destinationAccount,
      date,
      paymentMethod,
      merchant,
      tags,
      notes,
      receiptUrl
    } = req.body;

    if (type) transaction.type = type;
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new BadRequestError('Amount must be positive.');
      }
      transaction.amount = numAmount;
    }
    if (description) transaction.description = description.trim();
    if (category !== undefined) transaction.category = category || null;
    if (account) transaction.account = account;
    if (destinationAccount !== undefined) transaction.destinationAccount = destinationAccount || null;
    if (date) transaction.date = new Date(date);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (merchant !== undefined) transaction.merchant = merchant.trim();
    if (tags) transaction.tags = tags;
    if (notes !== undefined) transaction.notes = notes.trim();
    if (receiptUrl !== undefined) transaction.receiptUrl = receiptUrl;

    await transaction.save();

    // Now apply the new balance impact
    const newMinor = toMinorUnits(transaction.amount);
    if (transaction.type === 'income') {
      await applyBalanceDelta(transaction.account, newMinor);
    } else if (transaction.type === 'expense') {
      await applyBalanceDelta(transaction.account, -newMinor);
    } else if (transaction.type === 'refund') {
      await applyBalanceDelta(transaction.account, newMinor);
    } else if (transaction.type === 'transfer') {
      await applyBalanceDelta(transaction.account, -newMinor);
      await applyBalanceDelta(transaction.destinationAccount, newMinor);
    }

    const populated = await Transaction.findById(transaction._id)
      .populate('category', 'name icon color type')
      .populate('account', 'name type color currency')
      .populate('destinationAccount', 'name type color currency');

    res.status(200).json({
      status: 'success',
      message: 'Transaction updated successfully.',
      transaction: populated
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, owner: req.user._id });
    if (!transaction) {
      throw new NotFoundError('Transaction not found.');
    }

    // Revert balance impact
    const amountMinor = toMinorUnits(transaction.amount);
    if (transaction.type === 'income') {
      await applyBalanceDelta(transaction.account, -amountMinor);
    } else if (transaction.type === 'expense') {
      await applyBalanceDelta(transaction.account, amountMinor);
    } else if (transaction.type === 'refund') {
      await applyBalanceDelta(transaction.account, -amountMinor);
    } else if (transaction.type === 'transfer') {
      await applyBalanceDelta(transaction.account, amountMinor);
      await applyBalanceDelta(transaction.destinationAccount, -amountMinor);
    }

    await Transaction.deleteOne({ _id: transaction._id });

    res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const duplicateTransaction = async (req, res, next) => {
  try {
    const existing = await Transaction.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) {
      throw new NotFoundError('Transaction to duplicate not found.');
    }

    const dup = await Transaction.create({
      owner: req.user._id,
      type: existing.type,
      amount: existing.amount,
      currency: existing.currency,
      description: `${existing.description} (Copy)`,
      category: existing.category,
      account: existing.account,
      destinationAccount: existing.destinationAccount,
      date: new Date(),
      paymentMethod: existing.paymentMethod,
      merchant: existing.merchant,
      tags: existing.tags,
      notes: existing.notes
    });

    const amountMinor = toMinorUnits(dup.amount);
    if (dup.type === 'income') {
      await applyBalanceDelta(dup.account, amountMinor);
    } else if (dup.type === 'expense') {
      await applyBalanceDelta(dup.account, -amountMinor);
    } else if (dup.type === 'refund') {
      await applyBalanceDelta(dup.account, amountMinor);
    } else if (dup.type === 'transfer') {
      await applyBalanceDelta(dup.account, -amountMinor);
      await applyBalanceDelta(dup.destinationAccount, amountMinor);
    }

    const populated = await Transaction.findById(dup._id)
      .populate('category', 'name icon color type')
      .populate('account', 'name type color currency')
      .populate('destinationAccount', 'name type color currency');

    res.status(201).json({
      status: 'success',
      message: 'Transaction duplicated successfully.',
      transaction: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  duplicateTransaction
};
