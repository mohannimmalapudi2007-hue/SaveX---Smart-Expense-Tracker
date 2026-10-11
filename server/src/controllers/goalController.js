const SavingsGoal = require('../models/SavingsGoal');
const Account = require('../models/Account');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { toMinorUnits, toMajorUnits } = require('../utils/currency');

const calculateGoalProgress = (goal) => {
  const currentMinor = toMinorUnits(goal.currentAmount);
  const targetMinor = toMinorUnits(goal.targetAmount);

  const percentage = targetMinor > 0 ? Number(((currentMinor / targetMinor) * 100).toFixed(1)) : 0;
  const remainingMinor = Math.max(0, targetMinor - currentMinor);

  return {
    progressPercentage: Math.min(100, percentage),
    remainingAmount: toMajorUnits(remainingMinor),
    isCompleted: currentMinor >= targetMinor
  };
};

const getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const goals = await SavingsGoal.find(filter).sort({ createdAt: -1 });

    const goalsWithProgress = goals.map(g => {
      const stats = calculateGoalProgress(g);
      return {
        ...g.toObject(),
        progressPercentage: stats.progressPercentage,
        remainingAmount: stats.remainingAmount,
        isCompleted: stats.isCompleted
      };
    });

    res.status(200).json({
      status: 'success',
      count: goalsWithProgress.length,
      goals: goalsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currency, targetDate, priority, description, icon, color } = req.body;

    if (!name || !targetAmount || !targetDate) {
      throw new BadRequestError('Goal name, target amount, and target date are required.');
    }

    const numTarget = Number(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      throw new BadRequestError('Target amount must be a positive number.');
    }

    const goal = await SavingsGoal.create({
      owner: req.user._id,
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: 0,
      currency: currency ? currency.toUpperCase().trim() : req.user.preferredCurrency,
      targetDate: new Date(targetDate),
      priority: priority || 'medium',
      description: description ? description.trim() : '',
      icon: icon || 'target',
      color: color || '#3978D4',
      status: 'in_progress',
      contributions: []
    });

    res.status(201).json({
      status: 'success',
      message: 'Savings goal created successfully.',
      goal
    });
  } catch (error) {
    next(error);
  }
};

const getGoalById = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('contributions.account', 'name type currency');

    if (!goal) {
      throw new NotFoundError('Savings goal not found.');
    }

    const stats = calculateGoalProgress(goal);

    res.status(200).json({
      status: 'success',
      goal: {
        ...goal.toObject(),
        progressPercentage: stats.progressPercentage,
        remainingAmount: stats.remainingAmount,
        isCompleted: stats.isCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate, priority, description, icon, color, status } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, owner: req.user._id });

    if (!goal) {
      throw new NotFoundError('Savings goal not found.');
    }

    if (name) goal.name = name.trim();
    if (targetAmount !== undefined) {
      const numTarget = Number(targetAmount);
      if (isNaN(numTarget) || numTarget <= 0) {
        throw new BadRequestError('Target amount must be positive.');
      }
      goal.targetAmount = numTarget;
    }
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (priority) goal.priority = priority;
    if (description !== undefined) goal.description = description.trim();
    if (icon) goal.icon = icon;
    if (color) goal.color = color;
    if (status) goal.status = status;

    await goal.save();

    res.status(200).json({
      status: 'success',
      message: 'Savings goal updated successfully.',
      goal
    });
  } catch (error) {
    next(error);
  }
};

const addContribution = async (req, res, next) => {
  try {
    const { amount, note, accountId, deductFromAccount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, owner: req.user._id });

    if (!goal) {
      throw new NotFoundError('Savings goal not found.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestError('Contribution amount must be positive.');
    }

    // If deduction from account is requested, verify account and deduct
    if (deductFromAccount && accountId) {
      const account = await Account.findOne({ _id: accountId, owner: req.user._id });
      if (!account) {
        throw new BadRequestError('Selected funding account not found.');
      }

      const accMinor = toMinorUnits(account.currentBalance);
      const contMinor = toMinorUnits(numAmount);
      account.currentBalance = toMajorUnits(accMinor - contMinor);
      await account.save();
    }

    const currentMinor = toMinorUnits(goal.currentAmount);
    const addedMinor = toMinorUnits(numAmount);
    goal.currentAmount = toMajorUnits(currentMinor + addedMinor);

    goal.contributions.push({
      amount: numAmount,
      date: new Date(),
      note: note ? note.trim() : 'Contribution added',
      account: accountId || null
    });

    if (toMinorUnits(goal.currentAmount) >= toMinorUnits(goal.targetAmount)) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      status: 'success',
      message: 'Contribution recorded successfully.',
      goal
    });
  } catch (error) {
    next(error);
  }
};

const withdrawFromGoal = async (req, res, next) => {
  try {
    const { amount, note, accountId, refundToAccount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, owner: req.user._id });

    if (!goal) {
      throw new NotFoundError('Savings goal not found.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestError('Withdrawal amount must be positive.');
    }

    const currentMinor = toMinorUnits(goal.currentAmount);
    const withdrawMinor = toMinorUnits(numAmount);

    if (withdrawMinor > currentMinor) {
      throw new BadRequestError(`Cannot withdraw more than current saved amount (${goal.currentAmount} ${goal.currency}).`);
    }

    goal.currentAmount = toMajorUnits(currentMinor - withdrawMinor);

    if (refundToAccount && accountId) {
      const account = await Account.findOne({ _id: accountId, owner: req.user._id });
      if (account) {
        const accMinor = toMinorUnits(account.currentBalance);
        account.currentBalance = toMajorUnits(accMinor + withdrawMinor);
        await account.save();
      }
    }

    goal.contributions.push({
      amount: -numAmount,
      date: new Date(),
      note: note ? note.trim() : 'Withdrawal from savings goal',
      account: accountId || null
    });

    if (goal.status === 'completed' && toMinorUnits(goal.currentAmount) < toMinorUnits(goal.targetAmount)) {
      goal.status = 'in_progress';
    }

    await goal.save();

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal recorded successfully.',
      goal
    });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, owner: req.user._id });
    if (!goal) {
      throw new NotFoundError('Savings goal not found.');
    }

    await SavingsGoal.deleteOne({ _id: goal._id });

    res.status(200).json({
      status: 'success',
      message: 'Savings goal deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  addContribution,
  withdrawFromGoal,
  deleteGoal
};
