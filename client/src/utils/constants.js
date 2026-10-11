export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar' }
];

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash Wallet' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'investment', label: 'Investment Portfolio' },
  { value: 'other', label: 'Other Account' }
];

export const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense', badgeClass: 'badge-expense' },
  { value: 'income', label: 'Income', badgeClass: 'badge-income' },
  { value: 'transfer', label: 'Transfer', badgeClass: 'badge-transfer' },
  { value: 'refund', label: 'Refund', badgeClass: 'badge-refund' }
];

export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];
