const config = require('../config/env');
const logger = require('../utils/logger');
const { getFinancialSummary, getCategoryBreakdown, getMonthlyCashFlow } = require('./calculationService');
const { generateFinancialInsights } = require('./insightsEngine');
const Budget = require('../models/Budget');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

/**
 * Fallback natural language generator using structured financial context.
 */
const generateLocalAssistantResponse = async (userId, prompt) => {
  const query = (prompt || '').toLowerCase();
  const summary = await getFinancialSummary(userId);

  if (query.includes('where did most of my money go') || query.includes('top spend') || query.includes('most money')) {
    const categories = await getCategoryBreakdown(userId, { type: 'expense' });
    if (!categories.categories.length) {
      return "You haven't recorded any expenses yet for this period. As soon as you add transactions, I will analyze your top spending areas.";
    }
    const top = categories.categories[0];
    const top3 = categories.categories.slice(0, 3).map(c => `${c.name} (${c.percentage}%, totaling ${c.amount})`).join(', ');
    return `Most of your spending went toward **${top.name}**, which accounts for **${top.percentage}%** of your total expenses (${top.amount}). Your top spending categories are: ${top3}.`;
  }

  if (query.includes('food') || query.includes('dining') || query.includes('groceries')) {
    const categories = await getCategoryBreakdown(userId, { type: 'expense' });
    const foodCat = categories.categories.find(c => c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('grocer'));
    if (foodCat) {
      return `You have spent **${foodCat.amount}** on **${foodCat.name}**, which is ${foodCat.percentage}% of your expenses across ${foodCat.transactionCount} transactions.`;
    }
    return `I checked your transactions and couldn't find any recorded expenses categorized under Food or Groceries for this period.`;
  }

  if (query.includes('compare') || query.includes('last month')) {
    const cashFlow = await getMonthlyCashFlow(userId, 2);
    if (cashFlow.length < 2) {
      return `You currently have recorded data for ${cashFlow.length} month(s). Once you have two months of transactions, I can generate a complete side-by-side comparison for you.`;
    }
    const current = cashFlow[cashFlow.length - 1];
    const previous = cashFlow[cashFlow.length - 2];
    const expDiff = current.expenses - previous.expenses;
    const expDiffPercent = previous.expenses > 0 ? ((expDiff / previous.expenses) * 100).toFixed(1) : 0;

    return `### Month-over-Month Comparison
- **${current.month} (Current):** Income: ${current.income} | Expenses: ${current.expenses} | Net: ${current.net}
- **${previous.month} (Previous):** Income: ${previous.income} | Expenses: ${previous.expenses} | Net: ${previous.net}

Your spending has ${expDiff >= 0 ? `increased by ${expDiff.toFixed(2)} (${expDiffPercent}%)` : `decreased by ${Math.abs(expDiff).toFixed(2)} (${Math.abs(expDiffPercent)}%)`}.`;
  }

  if (query.includes('budget') || query.includes('limit')) {
    const budgets = await Budget.find({ owner: userId, status: 'active' }).populate('category');
    if (!budgets.length) {
      return "You don't have any active budgets set up yet. You can create a monthly or category budget from the Budgets page to start receiving automatic utilization tracking!";
    }
    return `You have **${budgets.length} active budget(s)**. Your overall budget utilization is currently **${summary.budgetSummary.overallUtilization}%**. Check the Budgets section for individual thresholds and limits.`;
  }

  if (query.includes('recurring') || query.includes('bill') || query.includes('subscription')) {
    const upcoming = await RecurringTransaction.find({ owner: userId, status: 'active' }).populate('category');
    if (!upcoming.length) {
      return "You do not currently have any active recurring bills or subscriptions registered. You can set them up in the Recurring Payments section to track upcoming due dates!";
    }
    const list = upcoming.map(b => `- **${b.title}**: ${b.currency} ${b.amount} (${b.frequency}, next due ${new Date(b.nextDueDate).toLocaleDateString()})`).join('\n');
    return `### Your Active Recurring Payments (${upcoming.length})
${list}

Total upcoming bills over the next 30 days: **${summary.upcomingBillsTotal}**.`;
  }

  // General summary response
  return `### Financial Overview
- **Available Balance:** ${summary.totalAvailableBalance}
- **Total Income:** ${summary.totalIncome}
- **Total Expenses:** ${summary.totalExpenses}
- **Net Cash Flow:** ${summary.netCashFlow}
- **Savings Rate:** ${summary.savingsRate}%

Ask me anything about your categories, upcoming bills, budget limits, or monthly comparisons!`;
};

/**
 * Handle AI query using Gemini or graceful rule-based engine.
 */
const askAssistant = async (userId, userMessage) => {
  if (config.geminiApiKey) {
    try {
      // In production with GEMINI_API_KEY, we could call Google GenAI API endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      }
    } catch (err) {
      logger.warn('Gemini API call failed, switching to local financial intelligence engine:', err.message);
    }
  }

  // Graceful rule-based engine
  return generateLocalAssistantResponse(userId, userMessage);
};

module.exports = {
  askAssistant
};
