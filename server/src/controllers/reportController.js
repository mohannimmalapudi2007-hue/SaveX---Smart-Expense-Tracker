const { getFinancialSummary, getMonthlyCashFlow, getCategoryBreakdown } = require('../services/calculationService');
const Account = require('../models/Account');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

const getReportData = async (req, res, next) => {
  try {
    const { startDate, endDate, reportType = 'overview', accountId, categoryId } = req.query;

    const summary = await getFinancialSummary(req.user._id, { startDate, endDate });
    const cashFlow = await getMonthlyCashFlow(req.user._id, 6);
    const categoryExpenses = await getCategoryBreakdown(req.user._id, { startDate, endDate, type: 'expense' });
    const categoryIncome = await getCategoryBreakdown(req.user._id, { startDate, endDate, type: 'income' });

    const accounts = await Account.find({ owner: req.user._id });
    const budgets = await Budget.find({ owner: req.user._id }).populate('category', 'name icon color');
    const goals = await SavingsGoal.find({ owner: req.user._id });
    const recurring = await RecurringTransaction.find({ owner: req.user._id }).populate('category', 'name');

    res.status(200).json({
      status: 'success',
      reportType,
      period: { startDate, endDate },
      summary,
      cashFlow,
      categoryExpenses,
      categoryIncome,
      accounts,
      budgets,
      goals,
      recurring
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportData
};
