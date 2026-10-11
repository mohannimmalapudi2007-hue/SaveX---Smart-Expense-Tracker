const calculationService = require('../services/calculationService');

const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, timeframe } = req.query;
    let start = startDate;
    let end = endDate;

    if (!startDate && !endDate && timeframe) {
      const now = new Date();
      if (timeframe === 'this_week') {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(d.setDate(diff)).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
      } else if (timeframe === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      } else {
        // default this_month
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      }
    }

    const summary = await calculationService.getFinancialSummary(req.user._id, {
      startDate: start,
      endDate: end
    });

    res.status(200).json({
      status: 'success',
      summary
    });
  } catch (error) {
    next(error);
  }
};

const getCashFlow = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const cashFlow = await calculationService.getMonthlyCashFlow(req.user._id, parseInt(months, 10));

    res.status(200).json({
      status: 'success',
      cashFlow
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;
    const categories = await calculationService.getCategoryBreakdown(req.user._id, {
      startDate,
      endDate,
      type
    });

    res.status(200).json({
      status: 'success',
      ...categories
    });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const trends = await calculationService.getDailyTrends(req.user._id, {
      startDate,
      endDate
    });

    res.status(200).json({
      status: 'success',
      trends
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCashFlow,
  getCategories,
  getTrends
};
