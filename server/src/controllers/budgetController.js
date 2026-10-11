const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { toMinorUnits, toMajorUnits, calculateBudgetUtilization } = require('../utils/currency');

const calculateBudgetActualSpending = async (userId, budget) => {
  const matchFilter = {
    owner: userId,
    date: { $gte: budget.startDate, $lte: budget.endDate }
  };

  if (budget.category) {
    matchFilter.category = budget.category._id || budget.category;
  }

  // Calculate total expenses and subtract any refunds in the period
  const [expenseAgg, refundAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { ...matchFilter, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { ...matchFilter, type: 'refund' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const rawExpense = expenseAgg[0]?.total || 0;
  const rawRefund = refundAgg[0]?.total || 0;

  const expenseMinor = toMinorUnits(rawExpense);
  const refundMinor = toMinorUnits(rawRefund);
  const netSpentMinor = Math.max(0, expenseMinor - refundMinor);

  const spent = toMajorUnits(netSpentMinor);
  const limit = budget.limit;
  const remaining = toMajorUnits(toMinorUnits(limit) - netSpentMinor);
  const utilization = calculateBudgetUtilization(spent, limit);

  return {
    spent,
    remaining,
    utilization,
    isOverBudget: spent > limit
  };
};

const getBudgets = async (req, res, next) => {
  try {
    const { status = 'active' } = req.query;
    const filter = { owner: req.user._id };
    if (status !== 'all') {
      filter.status = status;
    }

    const budgets = await Budget.find(filter)
      .populate('category', 'name icon color type')
      .sort({ createdAt: -1 });

    const budgetsWithPerformance = await Promise.all(
      budgets.map(async (budget) => {
        const perf = await calculateBudgetActualSpending(req.user._id, budget);
        return {
          ...budget.toObject(),
          spent: perf.spent,
          remaining: perf.remaining,
          utilization: perf.utilization,
          isOverBudget: perf.isOverBudget
        };
      })
    );

    res.status(200).json({
      status: 'success',
      count: budgetsWithPerformance.length,
      budgets: budgetsWithPerformance
    });
  } catch (error) {
    next(error);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const { name, period, category, limit, currency, startDate, endDate, alertThresholds } = req.body;

    if (!name || !limit) {
      throw new BadRequestError('Budget name and spending limit are required.');
    }

    const numLimit = Number(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      throw new BadRequestError('Budget limit must be a positive number.');
    }

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate || !endDate) {
      const now = new Date();
      if (period === 'weekly') {
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        start = firstDayOfWeek;
        end = lastDayOfWeek;
      } else if (period === 'yearly') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else {
        // default monthly
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    }

    const budget = await Budget.create({
      owner: req.user._id,
      name: name.trim(),
      period: period || 'monthly',
      category: category || null,
      limit: numLimit,
      currency: currency ? currency.toUpperCase().trim() : req.user.preferredCurrency,
      startDate: start,
      endDate: end,
      alertThresholds: alertThresholds || [50, 75, 90, 100]
    });

    const populated = await Budget.findById(budget._id).populate('category', 'name icon color type');

    res.status(201).json({
      status: 'success',
      message: 'Budget created successfully.',
      budget: populated
    });
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const { name, limit, period, category, startDate, endDate, alertThresholds, status } = req.body;
    const budget = await Budget.findOne({ _id: req.params.id, owner: req.user._id });

    if (!budget) {
      throw new NotFoundError('Budget not found.');
    }

    if (name) budget.name = name.trim();
    if (limit !== undefined) {
      const numLimit = Number(limit);
      if (isNaN(numLimit) || numLimit <= 0) {
        throw new BadRequestError('Limit must be a positive number.');
      }
      budget.limit = numLimit;
    }
    if (period) budget.period = period;
    if (category !== undefined) budget.category = category || null;
    if (startDate) budget.startDate = new Date(startDate);
    if (endDate) budget.endDate = new Date(endDate);
    if (alertThresholds) budget.alertThresholds = alertThresholds;
    if (status) budget.status = status;

    await budget.save();

    const populated = await Budget.findById(budget._id).populate('category', 'name icon color type');

    res.status(200).json({
      status: 'success',
      message: 'Budget updated successfully.',
      budget: populated
    });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, owner: req.user._id });
    if (!budget) {
      throw new NotFoundError('Budget not found.');
    }

    await Budget.deleteOne({ _id: budget._id });

    res.status(200).json({
      status: 'success',
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const checkBudgetAlerts = async (req, res, next) => {
  try {
    const activeBudgets = await Budget.find({ owner: req.user._id, status: 'active' }).populate('category');
    const alerts = [];

    for (const budget of activeBudgets) {
      const perf = await calculateBudgetActualSpending(req.user._id, budget);
      for (const threshold of budget.alertThresholds.sort((a, b) => b - a)) {
        if (perf.utilization >= threshold) {
          const categoryName = budget.category ? budget.category.name : 'Overall Spending';
          const alertMsg = `Your ${budget.name} (${categoryName}) is ${perf.utilization}% used (${perf.spent} / ${budget.limit} ${budget.currency}).`;
          
          alerts.push({
            budgetId: budget._id,
            budgetName: budget.name,
            threshold,
            utilization: perf.utilization,
            message: alertMsg,
            remaining: perf.remaining
          });
          break; // Report the highest breached threshold
        }
      }
    }

    res.status(200).json({
      status: 'success',
      alerts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  checkBudgetAlerts
};
