/**
 * Idempotent date calculation and scheduler for recurring payments and bills.
 * Handles month-end boundaries and leap years correctly.
 */

const getNextOccurrenceDate = (currentDate, frequency) => {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly': {
      const currentDay = next.getDate();
      next.setMonth(next.getMonth() + 1);
      // If the month rolled over extra days (e.g., Jan 31 -> March 3), snap to last day of target month
      if (next.getDate() !== currentDay) {
        next.setDate(0); // Last day of previous month
      }
      break;
    }
    case 'quarterly': {
      const currentDay = next.getDate();
      next.setMonth(next.getMonth() + 3);
      if (next.getDate() !== currentDay) {
        next.setDate(0);
      }
      break;
    }
    case 'yearly': {
      const isFeb29 = next.getMonth() === 1 && next.getDate() === 29;
      next.setFullYear(next.getFullYear() + 1);
      // If original was Feb 29 and next year rolled into March, snap back to Feb 28
      if (isFeb29 && next.getMonth() !== 1) {
        next.setMonth(1, 28);
      }
      break;
    }
    default:
      next.setMonth(next.getMonth() + 1);
  }

  return next;
};

module.exports = {
  getNextOccurrenceDate
};
