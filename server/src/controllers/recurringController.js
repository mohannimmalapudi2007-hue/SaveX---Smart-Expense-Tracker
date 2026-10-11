const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { getNextOccurrenceDate } = require('../services/recurringService');
const { toMinorUnits, toMajorUnits } = require('../utils/currency');

const applyBalanceDelta = async (accountId, deltaMinor) => {
  if (!accountId || deltaMinor === 0) return;
  const account = await Account.findById(accountId);
  if (!account) return;

  const currentMinor = toMinorUnits(account.currentBalance);
  account.currentBalance = toMajorUnits(currentMinor + deltaMinor);
  await account.save();
};

const getRecurringTransactions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const recurrings = await RecurringTransaction.find(filter)
      .populate('category', 'name icon color type')
      .populate('account', 'name type currency')
      .populate('destinationAccount', 'name type currency')
      .sort({ nextDueDate: 1 });

    res.status(200).json({
      status: 'success',
      count: recurrings.length,
      recurringTransactions: recurrings
    });
  } catch (error) {
    next(error);
  }
};

const createRecurringTransaction = async (req, res, next) => {
  try {
    const {
      title,
      type,
      amount,
      currency,
      frequency,
      category,
      account,
      destinationAccount,
      startDate,
      endDate,
      merchant,
      notes
    } = req.body;

    if (!title || !type || !amount || !account || !frequency) {
      throw new BadRequestError('Title, type, amount, account, and frequency are required.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestError('Amount must be positive.');
    }

    const srcAccount = await Account.findOne({ _id: account, owner: req.user._id });
    if (!srcAccount) {
      throw new BadRequestError('Account not found.');
    }

    const start = startDate ? new Date(startDate) : new Date();

    const recurring = await RecurringTransaction.create({
      owner: req.user._id,
      title: title.trim(),
      type,
      amount: numAmount,
      currency: currency || srcAccount.currency || req.user.preferredCurrency,
      frequency,
      category: category || null,
      account,
      destinationAccount: type === 'transfer' ? destinationAccount : null,
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
      nextDueDate: start,
      status: 'active',
      merchant: merchant ? merchant.trim() : '',
      notes: notes ? notes.trim() : ''
    });

    const populated = await RecurringTransaction.findById(recurring._id)
      .populate('category', 'name icon color type')
      .populate('account', 'name type currency')
      .populate('destinationAccount', 'name type currency');

    res.status(201).json({
      status: 'success',
      message: 'Recurring schedule created successfully.',
      recurringTransaction: populated
    });
  } catch (error) {
    next(error);
  }
};

const updateRecurringTransaction = async (req, res, next) => {
  try {
    const { title, amount, frequency, category, account, destinationAccount, nextDueDate, endDate, merchant, notes, status } = req.body;
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, owner: req.user._id });

    if (!recurring) {
      throw new NotFoundError('Recurring schedule not found.');
    }

    if (title) recurring.title = title.trim();
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) throw new BadRequestError('Amount must be positive.');
      recurring.amount = numAmount;
    }
    if (frequency) recurring.frequency = frequency;
    if (category !== undefined) recurring.category = category || null;
    if (account) recurring.account = account;
    if (destinationAccount !== undefined) recurring.destinationAccount = destinationAccount || null;
    if (nextDueDate) recurring.nextDueDate = new Date(nextDueDate);
    if (endDate !== undefined) recurring.endDate = endDate ? new Date(endDate) : null;
    if (merchant !== undefined) recurring.merchant = merchant.trim();
    if (notes !== undefined) recurring.notes = notes.trim();
    if (status) recurring.status = status;

    await recurring.save();

    const populated = await RecurringTransaction.findById(recurring._id)
      .populate('category', 'name icon color type')
      .populate('account', 'name type currency')
      .populate('destinationAccount', 'name type currency');

    res.status(200).json({
      status: 'success',
      message: 'Recurring schedule updated.',
      recurringTransaction: populated
    });
  } catch (error) {
    next(error);
  }
};

const togglePauseRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, owner: req.user._id });
    if (!recurring) {
      throw new NotFoundError('Recurring schedule not found.');
    }

    recurring.status = recurring.status === 'paused' ? 'active' : 'paused';
    await recurring.save();

    res.status(200).json({
      status: 'success',
      message: `Recurring schedule ${recurring.status}.`,
      recurringTransaction: recurring
    });
  } catch (error) {
    next(error);
  }
};

const processOccurrence = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, owner: req.user._id });
    if (!recurring) {
      throw new NotFoundError('Recurring schedule not found.');
    }

    if (recurring.status !== 'active') {
      throw new BadRequestError(`Cannot process a recurring schedule with status "${recurring.status}".`);
    }

    // Create the actual transaction record
    const transaction = await Transaction.create({
      owner: req.user._id,
      type: recurring.type,
      amount: recurring.amount,
      currency: recurring.currency,
      description: recurring.title,
      category: recurring.category,
      account: recurring.account,
      destinationAccount: recurring.destinationAccount,
      date: new Date(),
      merchant: recurring.merchant,
      notes: `Recurring payment for ${recurring.title}`,
      recurringTransaction: recurring._id
    });

    // Update account balances
    const amountMinor = toMinorUnits(recurring.amount);
    if (recurring.type === 'income') {
      await applyBalanceDelta(recurring.account, amountMinor);
    } else if (recurring.type === 'expense') {
      await applyBalanceDelta(recurring.account, -amountMinor);
    } else if (recurring.type === 'transfer') {
      await applyBalanceDelta(recurring.account, -amountMinor);
      await applyBalanceDelta(recurring.destinationAccount, amountMinor);
    }

    // Advance next due date idempotently
    const nextDate = getNextOccurrenceDate(recurring.nextDueDate, recurring.frequency);
    recurring.lastProcessedDate = new Date();
    recurring.nextDueDate = nextDate;

    // Check if end date reached
    if (recurring.endDate && nextDate > recurring.endDate) {
      recurring.status = 'completed';
    }

    await recurring.save();

    // Create in-app notification
    await Notification.create({
      owner: req.user._id,
      title: 'Recurring Payment Recorded',
      message: `Successfully posted ${recurring.title} (${recurring.currency} ${recurring.amount}).`,
      type: 'bill_reminder',
      data: { transactionId: transaction._id }
    });

    res.status(200).json({
      status: 'success',
      message: `Processed ${recurring.title} successfully. Next due date: ${nextDate.toISOString().split('T')[0]}`,
      transaction,
      nextDueDate: nextDate
    });
  } catch (error) {
    next(error);
  }
};

const getUpcomingBills = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    const upcoming = await RecurringTransaction.find({
      owner: req.user._id,
      status: 'active',
      nextDueDate: { $gte: now, $lte: thirtyDaysAhead }
    })
      .populate('category', 'name icon color type')
      .populate('account', 'name type currency')
      .sort({ nextDueDate: 1 });

    let totalUpcomingMinor = 0;
    upcoming.forEach(item => {
      if (item.type === 'expense') {
        totalUpcomingMinor += toMinorUnits(item.amount);
      }
    });

    res.status(200).json({
      status: 'success',
      count: upcoming.length,
      totalUpcomingExpenses: toMajorUnits(totalUpcomingMinor),
      upcoming
    });
  } catch (error) {
    next(error);
  }
};

const deleteRecurringTransaction = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, owner: req.user._id });
    if (!recurring) {
      throw new NotFoundError('Recurring schedule not found.');
    }

    await RecurringTransaction.deleteOne({ _id: recurring._id });

    res.status(200).json({
      status: 'success',
      message: 'Recurring schedule cancelled and removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  togglePauseRecurring,
  processOccurrence,
  getUpcomingBills,
  deleteRecurringTransaction
};
