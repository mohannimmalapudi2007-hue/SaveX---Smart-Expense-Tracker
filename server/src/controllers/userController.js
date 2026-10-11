const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const RecurringTransaction = require('../models/RecurringTransaction');
const Notification = require('../models/Notification');
const AuditEvent = require('../models/AuditEvent');
const { BadRequestError } = require('../utils/errors');

const exportAllUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, accounts, transactions, budgets, goals, recurring] = await Promise.all([
      User.findById(userId).select('-passwordHash -resetPasswordToken'),
      Account.find({ owner: userId }),
      Transaction.find({ owner: userId }),
      Budget.find({ owner: userId }),
      SavingsGoal.find({ owner: userId }),
      RecurringTransaction.find({ owner: userId })
    ]);

    await AuditEvent.create({
      owner: userId,
      action: 'DATA_EXPORT_REQUESTED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.status(200).json({
      status: 'success',
      exportedAt: new Date(),
      data: {
        profile: user,
        accounts,
        transactions,
        budgets,
        goals,
        recurring
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { confirmationPassword } = req.body;
    if (!confirmationPassword) {
      throw new BadRequestError('Password is required to confirm account deletion.');
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(confirmationPassword);
    if (!isMatch) {
      throw new BadRequestError('Incorrect password. Account deletion aborted.');
    }

    const userId = user._id;

    // Remove user and associated financial documents
    await Promise.all([
      User.deleteOne({ _id: userId }),
      Account.deleteMany({ owner: userId }),
      Transaction.deleteMany({ owner: userId }),
      Budget.deleteMany({ owner: userId }),
      SavingsGoal.deleteMany({ owner: userId }),
      RecurringTransaction.deleteMany({ owner: userId }),
      Notification.deleteMany({ owner: userId }),
      AuditEvent.deleteMany({ owner: userId })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Your SaveX account and all associated financial records have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportAllUserData,
  deleteAccount
};
