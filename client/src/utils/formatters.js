export const formatCurrency = (amount, currency = 'USD') => {
  const num = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (error) {
    return `${currency} ${num.toFixed(2)}`;
  }
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  });
};

export const formatPercentage = (val) => {
  const num = Number(val) || 0;
  return `${num.toFixed(1)}%`;
};
