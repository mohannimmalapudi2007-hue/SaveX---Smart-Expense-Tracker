const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const RecurringTransaction = require('../models/RecurringTransaction');
const {
  toMinorUnits,
  toMajorUnits,
  calculateNetCashFlow,
  calculateSavingsRate,
  calculateBudgetUtilization
} = require('../utils/currency');

/**
 * Computes consolidated financial summary for a given period.
 */
const getFinancialSummary = async (userId, { startDate, endDate } = {}) => {
  const match = { owner: userId };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  // 1. Transaction aggregations for income, expenses, refunds (Transfers explicitly ignored)
  const [incomeAgg, expenseAgg, refundAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { ...match, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { ...match, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { ...match, type: 'refund' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const rawIncome = incomeAgg[0]?.total || 0;
  const rawExpense = expenseAgg[0]?.total || 0;
  const rawRefund = refundAgg[0]?.total || 0;

  const totalIncome = toMajorUnits(toMinorUnits(rawIncome));
  // Net recognized expense = total expense minus refunds
  const netExpenseMinor = Math.max(0, toMinorUnits(rawExpense) - toMinorUnits(rawRefund));
  const totalExpenses = toMajorUnits(netExpenseMinor);

  const netCashFlow = calculateNetCashFlow(totalIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  // 2. Net Available Balance across active accounts
  const accounts = await Account.find({ owner: userId, isArchived: false });
  let totalBalanceMinor = 0;
  accounts.forEach(acc => {
    totalBalanceMinor += toMinorUnits(acc.currentBalance);
  });
  const totalAvailableBalance = toMajorUnits(totalBalanceMinor);

  // 3. Budgets overview
  const budgets = await Budget.find({ owner: userId, status: 'active' });
  let totalBudgetLimitMinor = 0;
  budgets.forEach(b => {
    totalBudgetLimitMinor += toMinorUnits(b.limit);
  });
  const totalBudgetLimit = toMajorUnits(totalBudgetLimitMinor);
  const budgetUtilization = totalBudgetLimit > 0
    ? calculateBudgetUtilization(totalExpenses, totalBudgetLimit)
    : 0;

  // 4. Savings goals
  const goals = await SavingsGoal.find({ owner: userId, status: { $in: ['in_progress', 'completed'] } });
  let totalSavedMinor = 0;
  let totalGoalTargetMinor = 0;
  goals.forEach(g => {
    totalSavedMinor += toMinorUnits(g.currentAmount);
    totalGoalTargetMinor += toMinorUnits(g.targetAmount);
  });

  // 5. Upcoming recurring expenses
  const now = new Date();
  const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingBills = await RecurringTransaction.find({
    owner: userId,
    status: 'active',
    type: 'expense',
    nextDueDate: { $gte: now, $lte: next30 }
  });
  let upcomingBillsMinor = 0;
  upcomingBills.forEach(b => {
    upcomingBillsMinor += toMinorUnits(b.amount);
  });

  return {
    period: {
      startDate: startDate || null,
      endDate: endDate || null
    },
    totalAvailableBalance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    budgetSummary: {
      activeBudgetsCount: budgets.length,
      totalLimit: totalBudgetLimit,
      overallUtilization: budgetUtilization
    },
    savingsSummary: {
      activeGoalsCount: goals.length,
      totalSaved: toMajorUnits(totalSavedMinor),
      totalTarget: toMajorUnits(totalGoalTargetMinor),
      overallProgress: totalGoalTargetMinor > 0 ? Number(((totalSavedMinor / totalGoalTargetMinor) * 100).toFixed(1)) : 0
    },
    upcomingBillsTotal: toMajorUnits(upcomingBillsMinor)
  };
};

/**
 * Computes monthly cash flow over the last N months.
 */
const getMonthlyCashFlow = async (userId, monthsCount = 6) => {
  const result = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const monthLabel = start.toLocaleString('en-US', { month: 'short', year: '2-digit' });

    const [incomeAgg, expenseAgg, refundAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { owner: userId, type: 'income', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { owner: userId, type: 'expense', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { owner: userId, type: 'refund', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const income = toMajorUnits(toMinorUnits(incomeAgg[0]?.total || 0));
    const netExpenseMinor = Math.max(0, toMinorUnits(expenseAgg[0]?.total || 0) - toMinorUnits(refundAgg[0]?.total || 0));
    const expenses = toMajorUnits(netExpenseMinor);
    const net = calculateNetCashFlow(income, expenses);

    result.push({
      month: monthLabel,
      startDate: start.toISOString().split('T')[0],
      income,
      expenses,
      net
    });
  }

  return result;
};

/**
 * Breakdown of expenses or income by category.
 */
const getCategoryBreakdown = async (userId, { startDate, endDate, type = 'expense' }) => {
  const match = { owner: userId, type };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  const breakdown = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Populate category info
  const populated = await Transaction.populate(breakdown, {
    path: '_id',
    model: 'Category',
    select: 'name icon color'
  });

  let grandTotalMinor = 0;
  populated.forEach(item => {
    grandTotalMinor += toMinorUnits(item.totalAmount);
  });

  const categories = populated.map(item => {
    const itemMinor = toMinorUnits(item.totalAmount);
    const percentage = grandTotalMinor > 0 ? Number(((itemMinor / grandTotalMinor) * 100).toFixed(1)) : 0;
    return {
      categoryId: item._id?._id || 'uncategorized',
      name: item._id?.name || 'Uncategorized',
      icon: item._id?.icon || 'tag',
      color: item._id?.color || '#94A3B8',
      amount: toMajorUnits(itemMinor),
      percentage,
      transactionCount: item.count
    };
  });

  return {
    type,
    total: toMajorUnits(grandTotalMinor),
    categories
  };
};

/**
 * Daily spending trend for a date range.
 */
const getDailyTrends = async (userId, { startDate, endDate }) => {
  const match = { owner: userId, type: 'expense' };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  const dailyAgg = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return dailyAgg.map(day => ({
    date: day._id,
    amount: toMajorUnits(toMinorUnits(day.amount)),
    count: day.count
  }));
};

module.exports = {
  getFinancialSummary,
  getMonthlyCashFlow,
  getCategoryBreakdown,
  getDailyTrends
};
