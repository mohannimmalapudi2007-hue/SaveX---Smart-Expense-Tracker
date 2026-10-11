const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const RecurringTransaction = require('../models/RecurringTransaction');
const { toMinorUnits, toMajorUnits, calculateNetCashFlow, calculateSavingsRate } = require('../utils/currency');

/**
 * Deterministic, explainable financial insights engine.
 * Generates verified alerts, category trends, budget status, and cash flow commentary.
 */
const generateFinancialInsights = async (userId) => {
  const insights = [];
  const now = new Date();

  // Current month vs Previous month ranges
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // 1. Fetch current month and last month expenses
  const [thisMonthAgg, prevMonthAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { owner: userId, type: 'expense', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { owner: userId, type: 'expense', date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const thisMonthExp = thisMonthAgg[0]?.total || 0;
  const prevMonthExp = prevMonthAgg[0]?.total || 0;

  if (prevMonthExp > 0 && thisMonthExp > 0) {
    const diffMinor = toMinorUnits(thisMonthExp) - toMinorUnits(prevMonthExp);
    const pctChange = Number(((diffMinor / toMinorUnits(prevMonthExp)) * 100).toFixed(1));

    if (pctChange > 15) {
      insights.push({
        id: 'spending-increase',
        type: 'warning',
        title: 'Spending Increased',
        message: `Your spending this month is up by ${pctChange}% compared to last month.`,
        explanation: `Calculated from recognized expenses this month (${thisMonthExp.toFixed(2)}) compared to last month (${prevMonthExp.toFixed(2)}).`,
        priority: 'high'
      });
    } else if (pctChange < -15) {
      insights.push({
        id: 'spending-decrease',
        type: 'positive',
        title: 'Great Expense Control',
        message: `You've spent ${Math.abs(pctChange)}% less this month compared to last month!`,
        explanation: `Calculated from recognized expenses this month (${thisMonthExp.toFixed(2)}) compared to last month (${prevMonthExp.toFixed(2)}).`,
        priority: 'medium'
      });
    }
  }

  // 2. Category concentration check (Does one category take >35% of total expenses?)
  if (thisMonthExp > 0) {
    const categoryAgg = await Transaction.aggregate([
      { $match: { owner: userId, type: 'expense', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    if (categoryAgg.length > 0 && categoryAgg[0]._id) {
      const topCatExpense = categoryAgg[0].total;
      const sharePct = Number(((toMinorUnits(topCatExpense) / toMinorUnits(thisMonthExp)) * 100).toFixed(1));

      if (sharePct >= 35) {
        const Category = require('../models/Category');
        const catDoc = await Category.findById(categoryAgg[0]._id);
        const catName = catDoc ? catDoc.name : 'Unknown';

        insights.push({
          id: 'category-concentration',
          type: 'info',
          title: `High Spending in ${catName}`,
          message: `${catName} accounts for ${sharePct}% of your total spending this month.`,
          explanation: `This single category comprises ${topCatExpense.toFixed(2)} of your total ${thisMonthExp.toFixed(2)} monthly expenses.`,
          priority: 'medium'
        });
      }
    }
  }

  // 3. Upcoming bills within next 7 days
  const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const urgentBills = await RecurringTransaction.find({
    owner: userId,
    status: 'active',
    type: 'expense',
    nextDueDate: { $gte: now, $lte: sevenDaysAhead }
  }).populate('category');

  if (urgentBills.length > 0) {
    let totalBillMinor = 0;
    urgentBills.forEach(b => totalBillMinor += toMinorUnits(b.amount));
    insights.push({
      id: 'upcoming-bills',
      type: 'warning',
      title: 'Upcoming Payments Due Soon',
      message: `You have ${urgentBills.length} recurring bill(s) totaling ${toMajorUnits(totalBillMinor).toFixed(2)} due within the next 7 days.`,
      explanation: `Bills include: ${urgentBills.map(b => `${b.title} (${b.amount})`).join(', ')}.`,
      priority: 'high'
    });
  }

  // 4. Budget threshold warnings (>80% used)
  const activeBudgets = await Budget.find({ owner: userId, status: 'active' }).populate('category');
  for (const b of activeBudgets) {
    const exp = await Transaction.aggregate([
      {
        $match: {
          owner: userId,
          type: 'expense',
          date: { $gte: b.startDate, $lte: b.endDate },
          ...(b.category ? { category: b.category._id } : {})
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const spent = exp[0]?.total || 0;
    const spentMinor = toMinorUnits(spent);
    const limitMinor = toMinorUnits(b.limit);
    const util = limitMinor > 0 ? (spentMinor / limitMinor) * 100 : 0;

    if (util >= 85) {
      insights.push({
        id: `budget-warning-${b._id}`,
        type: util >= 100 ? 'error' : 'warning',
        title: util >= 100 ? `Budget Exceeded: ${b.name}` : `Budget Near Limit: ${b.name}`,
        message: `You've used ${util.toFixed(1)}% of your ${b.name} limit (${spent.toFixed(2)} / ${b.limit.toFixed(2)}).`,
        explanation: `Period: ${b.startDate.toISOString().split('T')[0]} to ${b.endDate.toISOString().split('T')[0]}.`,
        priority: 'high'
      });
    }
  }

  // Default encouraging insight if no alerts triggered
  if (insights.length === 0) {
    insights.push({
      id: 'healthy-finances',
      type: 'positive',
      title: 'Finances On Track',
      message: 'All your budgets and recurring bills are currently within normal operating limits.',
      explanation: 'No abnormal spending spikes or imminent over-budget events detected.',
      priority: 'low'
    });
  }

  return insights;
};

module.exports = {
  generateFinancialInsights
};
