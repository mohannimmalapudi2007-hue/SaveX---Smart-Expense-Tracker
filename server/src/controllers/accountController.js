const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { toMajorUnits, toMinorUnits } = require('../utils/currency');

const getAccounts = async (req, res, next) => {
  try {
    const { includeArchived } = req.query;
    const filter = { owner: req.user._id };
    if (includeArchived !== 'true') {
      filter.isArchived = false;
    }

    const accounts = await Account.find(filter).sort({ createdAt: 1 });

    // Calculate total net balance across all accounts
    let totalBalanceMinor = 0;
    accounts.forEach(acc => {
      totalBalanceMinor += toMinorUnits(acc.currentBalance);
    });

    res.status(200).json({
      status: 'success',
      count: accounts.length,
      totalNetWorth: toMajorUnits(totalBalanceMinor),
      accounts
    });
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { name, type, currency, openingBalance, institutionName, color, icon } = req.body;

    if (!name) {
      throw new BadRequestError('Account name is required.');
    }

    const balance = openingBalance !== undefined ? Number(openingBalance) : 0;

    const account = await Account.create({
      owner: req.user._id,
      name: name.trim(),
      type: type || 'checking',
      currency: currency ? currency.toUpperCase().trim() : req.user.preferredCurrency,
      openingBalance: balance,
      currentBalance: balance,
      institutionName: institutionName ? institutionName.trim() : '',
      color: color || '#3978D4',
      icon: icon || 'wallet'
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      account
    });
  } catch (error) {
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, owner: req.user._id });
    if (!account) {
      throw new NotFoundError('Account not found.');
    }

    const recentTransactions = await Transaction.find({
      owner: req.user._id,
      $or: [{ account: account._id }, { destinationAccount: account._id }]
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('category', 'name icon color type');

    res.status(200).json({
      status: 'success',
      account,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const { name, type, institutionName, color, icon } = req.body;
    const account = await Account.findOne({ _id: req.params.id, owner: req.user._id });

    if (!account) {
      throw new NotFoundError('Account not found.');
    }

    if (name) account.name = name.trim();
    if (type) account.type = type;
    if (institutionName !== undefined) account.institutionName = institutionName.trim();
    if (color) account.color = color;
    if (icon) account.icon = icon;

    await account.save();

    res.status(200).json({
      status: 'success',
      message: 'Account updated successfully.',
      account
    });
  } catch (error) {
    next(error);
  }
};

const archiveAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, owner: req.user._id });
    if (!account) {
      throw new NotFoundError('Account not found.');
    }

    account.isArchived = !account.isArchived;
    await account.save();

    res.status(200).json({
      status: 'success',
      message: account.isArchived ? 'Account archived.' : 'Account restored.',
      account
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, owner: req.user._id });
    if (!account) {
      throw new NotFoundError('Account not found.');
    }

    const transactionCount = await Transaction.countDocuments({
      owner: req.user._id,
      $or: [{ account: account._id }, { destinationAccount: account._id }]
    });

    if (transactionCount > 0) {
      // Do not silently delete or corrupt transaction history; recommend archiving
      throw new BadRequestError(
        `This account is linked to ${transactionCount} transactions. Please archive it instead to preserve financial history.`
      );
    }

    await Account.deleteOne({ _id: account._id });

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  createAccount,
  getAccountById,
  updateAccount,
  archiveAccount,
  deleteAccount
};
