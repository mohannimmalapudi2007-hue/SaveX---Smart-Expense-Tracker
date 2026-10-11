const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: 'Food and Dining', type: 'expense', icon: 'utensils', color: '#3978D4' },
  { name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#27845B' },
  { name: 'Transport', type: 'expense', icon: 'car', color: '#EA580C' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#D97706' },
  { name: 'Housing and Rent', type: 'expense', icon: 'home', color: '#2563EB' },
  { name: 'Utilities', type: 'expense', icon: 'zap', color: '#F59E0B' },
  { name: 'Healthcare', type: 'expense', icon: 'heart-pulse', color: '#DC2626' },
  { name: 'Education', type: 'expense', icon: 'book-open', color: '#7C3AED' },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#8B5CF6' },
  { name: 'Travel', type: 'expense', icon: 'plane', color: '#06B6D4' },
  { name: 'Subscriptions', type: 'expense', icon: 'repeat', color: '#6366F1' },
  { name: 'Personal Care', type: 'expense', icon: 'smile', color: '#EC4899' },
  { name: 'Family', type: 'expense', icon: 'users', color: '#10B981' },
  { name: 'Gifts and Donations', type: 'expense', icon: 'gift', color: '#F43F5E' },
  { name: 'Taxes and Fees', type: 'expense', icon: 'receipt', color: '#64748B' },
  { name: 'Other', type: 'expense', icon: 'more-horizontal', color: '#94A3B8' },

  // Income Categories
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#27845B' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#059669' },
  { name: 'Business', type: 'income', icon: 'trending-up', color: '#10B981' },
  { name: 'Interest', type: 'income', icon: 'percent', color: '#3B82F6' },
  { name: 'Investments', type: 'income', icon: 'line-chart', color: '#6366F1' },
  { name: 'Gifts', type: 'income', icon: 'gift', color: '#EC4899' },
  { name: 'Allowance', type: 'income', icon: 'wallet', color: '#8B5CF6' },
  { name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#14B8A6' }
];

const seedDefaultCategoriesForUser = async (userId) => {
  const existingCount = await Category.countDocuments({ owner: userId });
  if (existingCount > 0) {
    return;
  }

  const categoryDocs = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    owner: userId,
    isDefault: true
  }));

  await Category.insertMany(categoryDocs);
};

module.exports = {
  DEFAULT_CATEGORIES,
  seedDefaultCategoriesForUser
};
