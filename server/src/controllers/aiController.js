const aiService = require('../services/aiService');
const { generateFinancialInsights } = require('../services/insightsEngine');
const { BadRequestError } = require('../utils/errors');

const askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      throw new BadRequestError('Message is required.');
    }

    const answer = await aiService.askAssistant(req.user._id, message.trim());

    res.status(200).json({
      status: 'success',
      answer
    });
  } catch (error) {
    next(error);
  }
};

const getInsights = async (req, res, next) => {
  try {
    const insights = await generateFinancialInsights(req.user._id);

    res.status(200).json({
      status: 'success',
      count: insights.length,
      insights
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askAssistant,
  getInsights
};
