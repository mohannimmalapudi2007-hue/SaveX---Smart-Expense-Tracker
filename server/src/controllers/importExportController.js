const multer = require('multer');
const { parseCsvBuffer, generateTransactionsCsv } = require('../services/csvService');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const { BadRequestError } = require('../utils/errors');
const { toMinorUnits, toMajorUnits } = require('../utils/currency');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const previewCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Please upload a valid CSV file.');
    }

    const rows = await parseCsvBuffer(req.file.buffer);
    if (!rows.length) {
      throw new BadRequestError('The uploaded CSV file is empty.');
    }

    // Inspect first 5 rows for preview
    const preview = rows.slice(0, 10);
    const headers = Object.keys(rows[0]);

    // Check potential duplicates against existing transactions
    const sampleDates = rows.map(r => r.date ? new Date(r.date) : null).filter(Boolean);
    const minDate = sampleDates.length ? new Date(Math.min(...sampleDates)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const maxDate = sampleDates.length ? new Date(Math.max(...sampleDates)) : new Date();

    const existing = await Transaction.find({
      owner: req.user._id,
      date: { $gte: minDate, $lte: maxDate }
    }).select('date amount description');

    const duplicateCandidates = [];
    rows.forEach((r, idx) => {
      const match = existing.find(e =>
        Math.abs(e.amount - Number(r.amount)) < 0.01 &&
        e.description.toLowerCase().trim() === (r.description || '').toLowerCase().trim()
      );
      if (match) {
        duplicateCandidates.push({ rowIndex: idx, row: r, existingMatch: match });
      }
    });

    res.status(200).json({
      status: 'success',
      totalRows: rows.length,
      headers,
      preview,
      duplicateCount: duplicateCandidates.length,
      duplicates: duplicateCandidates.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

const confirmImport = async (req, res, next) => {
  try {
    const { transactions, accountId } = req.body;

    if (!Array.isArray(transactions) || !transactions.length) {
      throw new BadRequestError('No transactions provided to import.');
    }

    if (!accountId) {
      throw new BadRequestError('Target account must be selected.');
    }

    const account = await Account.findOne({ _id: accountId, owner: req.user._id });
    if (!account) {
      throw new BadRequestError('Target account not found.');
    }

    // Cache categories
    const categories = await Category.find({
      $or: [{ owner: req.user._id }, { owner: null }]
    });

    const categoryMap = new Map();
    categories.forEach(c => categoryMap.set(c.name.toLowerCase().trim(), c._id));

    let importedCount = 0;
    let netBalanceDeltaMinor = 0;
    const toInsert = [];

    for (const item of transactions) {
      const numAmount = Number(item.amount);
      if (isNaN(numAmount) || numAmount <= 0) continue;

      const type = ['income', 'expense', 'transfer', 'refund'].includes(item.type)
        ? item.type
        : 'expense';

      let catId = null;
      if (item.category) {
        catId = categoryMap.get(item.category.toLowerCase().trim()) || null;
      }

      toInsert.push({
        owner: req.user._id,
        type,
        amount: numAmount,
        currency: account.currency,
        description: item.description || 'Imported Transaction',
        category: catId,
        account: account._id,
        date: item.date ? new Date(item.date) : new Date(),
        merchant: item.merchant || '',
        notes: item.notes || 'Imported via CSV'
      });

      const amountMinor = toMinorUnits(numAmount);
      if (type === 'income' || type === 'refund') {
        netBalanceDeltaMinor += amountMinor;
      } else if (type === 'expense') {
        netBalanceDeltaMinor -= amountMinor;
      }
      importedCount++;
    }

    if (toInsert.length > 0) {
      await Transaction.insertMany(toInsert);

      // Update account balance
      const currentMinor = toMinorUnits(account.currentBalance);
      account.currentBalance = toMajorUnits(currentMinor + netBalanceDeltaMinor);
      await account.save();
    }

    res.status(200).json({
      status: 'success',
      message: `Successfully imported ${importedCount} transactions.`,
      importedCount,
      updatedAccountBalance: account.currentBalance
    });
  } catch (error) {
    next(error);
  }
};

const exportTransactionsCsv = async (req, res, next) => {
  try {
    const { startDate, endDate, type, account } = req.query;
    const filter = { owner: req.user._id };

    if (type) filter.type = type;
    if (account) filter.account = account;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('category', 'name')
      .populate('account', 'name');

    const csvContent = generateTransactionsCsv(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=savex-transactions-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  previewCsv,
  confirmImport,
  exportTransactionsCsv
};
