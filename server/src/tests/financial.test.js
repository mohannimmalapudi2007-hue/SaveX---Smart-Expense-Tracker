const {
  toMinorUnits,
  toMajorUnits,
  addMoney,
  subtractMoney,
  multiplyMoney,
  calculateNetCashFlow,
  calculateSavingsRate,
  calculateBudgetUtilization
} = require('../utils/currency');
const { getNextOccurrenceDate } = require('../services/recurringService');

describe('SaveX Financial Calculation Engine', () => {
  describe('Minor Unit Conversion & Arithmetic', () => {
    test('converts decimal amounts to integer minor units without float loss', () => {
      expect(toMinorUnits(10.55)).toBe(1055);
      expect(toMinorUnits(0.1 + 0.2)).toBe(30); // 0.1 + 0.2 = 0.30000000000000004 -> exactly 30 cents
      expect(toMinorUnits(0)).toBe(0);
      expect(toMinorUnits(99.99)).toBe(9999);
    });

    test('converts minor units back to major units', () => {
      expect(toMajorUnits(1055)).toBe(10.55);
      expect(toMajorUnits(30)).toBe(0.3);
      expect(toMajorUnits(0)).toBe(0);
    });

    test('addMoney performs exact addition', () => {
      expect(addMoney(0.1, 0.2)).toBe(0.3);
      expect(addMoney(123.45, 67.89)).toBe(191.34);
    });

    test('subtractMoney performs exact subtraction', () => {
      expect(subtractMoney(100.50, 50.25)).toBe(50.25);
      expect(subtractMoney(10.00, 10.05)).toBe(-0.05);
    });
  });

  describe('Net Cash Flow & Savings Rate Calculations', () => {
    test('calculates positive net cash flow', () => {
      expect(calculateNetCashFlow(5000, 3200)).toBe(1800);
    });

    test('calculates negative net cash flow correctly', () => {
      expect(calculateNetCashFlow(2000, 2500)).toBe(-500);
    });

    test('calculates zero income and zero expense scenarios', () => {
      expect(calculateNetCashFlow(0, 500)).toBe(-500);
      expect(calculateNetCashFlow(1000, 0)).toBe(1000);
      expect(calculateNetCashFlow(0, 0)).toBe(0);
    });

    test('calculates savings rate correctly as percentage of recognized income', () => {
      // Income: 5000, Expenses: 3000 -> Saved: 2000 -> 2000/5000 * 100 = 40.0%
      expect(calculateSavingsRate(5000, 3000)).toBe(40.0);
    });

    test('savings rate returns 0% when expenses exceed income or income is 0', () => {
      expect(calculateSavingsRate(0, 500)).toBe(0);
      expect(calculateSavingsRate(1000, 1500)).toBe(0);
      expect(calculateSavingsRate(0, 0)).toBe(0);
    });
  });

  describe('Budget Utilization', () => {
    test('calculates standard budget utilization percentage', () => {
      // Spent: 750, Limit: 1000 -> 75%
      expect(calculateBudgetUtilization(750, 1000)).toBe(75.0);
    });

    test('handles zero spending and over-budget correctly', () => {
      expect(calculateBudgetUtilization(0, 1000)).toBe(0);
      expect(calculateBudgetUtilization(1200, 1000)).toBe(120.0);
      expect(calculateBudgetUtilization(500, 0)).toBe(0);
    });
  });

  describe('Recurring Schedule Date Logic (Month-End & Leap Years)', () => {
    test('handles standard daily and weekly recurrence', () => {
      const d1 = new Date('2026-05-01');
      const nextDay = getNextOccurrenceDate(d1, 'daily');
      expect(nextDay.getDate()).toBe(2);

      const nextWeek = getNextOccurrenceDate(d1, 'weekly');
      expect(nextWeek.getDate()).toBe(8);
    });

    test('handles month-end snapping correctly (e.g. Jan 31 -> Feb 28)', () => {
      const jan31 = new Date(2026, 0, 31); // Jan 31, 2026
      const nextMonth = getNextOccurrenceDate(jan31, 'monthly');
      expect(nextMonth.getMonth()).toBe(1); // February
      expect(nextMonth.getDate()).toBe(28); // 2026 is non-leap year, last day of Feb is 28
    });

    test('handles leap year correctly for Feb 29 to next year', () => {
      const leapFeb29 = new Date(2024, 1, 29); // 2024 is leap year
      const nextYear = getNextOccurrenceDate(leapFeb29, 'yearly');
      expect(nextYear.getFullYear()).toBe(2025);
      expect(nextYear.getMonth()).toBe(1); // February
      expect(nextYear.getDate()).toBe(28); // Snaps to Feb 28 in non-leap year
    });
  });
});
