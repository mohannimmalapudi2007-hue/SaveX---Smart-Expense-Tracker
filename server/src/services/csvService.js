const { Readable } = require('stream');
const csvParser = require('csv-parser');
const Transaction = require('../models/Transaction');
const { toMinorUnits, toMajorUnits } = require('../utils/currency');

/**
 * Escapes values for CSV to prevent spreadsheet formula injection.
 * (Mitigates CSV injection when cell starts with =, +, -, @, or tab)
 */
const sanitizeCsvField = (value) => {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`; // prefix with apostrophe
  }
  // If string contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const generateTransactionsCsv = (transactions) => {
  const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Description', 'Category', 'Account', 'Merchant', 'Notes'];
  const rows = transactions.map(t => [
    sanitizeCsvField(t._id),
    sanitizeCsvField(new Date(t.date).toISOString().split('T')[0]),
    sanitizeCsvField(t.type),
    sanitizeCsvField(t.amount),
    sanitizeCsvField(t.currency),
    sanitizeCsvField(t.description),
    sanitizeCsvField(t.category?.name || 'Uncategorized'),
    sanitizeCsvField(t.account?.name || 'N/A'),
    sanitizeCsvField(t.merchant || ''),
    sanitizeCsvField(t.notes || '')
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
};

module.exports = {
  sanitizeCsvField,
  parseCsvBuffer,
  generateTransactionsCsv
};
