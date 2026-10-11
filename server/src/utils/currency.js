/**
 * Financial calculation and currency utilities for SaveX.
 * All monetary amounts in calculations are maintained in integer minor units (paise/cents)
 * to avoid floating-point inaccuracies (e.g., 0.1 + 0.2 !== 0.3).
 */

const toMinorUnits = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 0;
  return Math.round(Number(amount) * 100);
};

const toMajorUnits = (minorUnits) => {
  if (minorUnits === undefined || minorUnits === null || isNaN(minorUnits)) return 0;
  return Number((minorUnits / 100).toFixed(2));
};

const addMoney = (a, b) => {
  return (toMinorUnits(a) + toMinorUnits(b)) / 100;
};

const subtractMoney = (a, b) => {
  return (toMinorUnits(a) - toMinorUnits(b)) / 100;
};

const multiplyMoney = (a, factor) => {
  return Math.round(toMinorUnits(a) * Number(factor)) / 100;
};

const calculateNetCashFlow = (income, expenses) => {
  const incMinor = toMinorUnits(income);
  const expMinor = toMinorUnits(expenses);
  return toMajorUnits(incMinor - expMinor);
};

const calculateSavingsRate = (income, expenses) => {
  const incMinor = toMinorUnits(income);
  const expMinor = toMinorUnits(expenses);

  if (incMinor <= 0) return 0;
  const netSavingsMinor = incMinor - expMinor;
  if (netSavingsMinor <= 0) return 0;

  const rate = (netSavingsMinor / incMinor) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1));
};

const calculateBudgetUtilization = (spent, limit) => {
  const limitMinor = toMinorUnits(limit);
  const spentMinor = toMinorUnits(spent);

  if (limitMinor <= 0) return 0;
  const percentage = (spentMinor / limitMinor) * 100;
  return Number(percentage.toFixed(1));
};

const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  } catch (error) {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  addMoney,
  subtractMoney,
  multiplyMoney,
  calculateNetCashFlow,
  calculateSavingsRate,
  calculateBudgetUtilization,
  formatCurrency
};
