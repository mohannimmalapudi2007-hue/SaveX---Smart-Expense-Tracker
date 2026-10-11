const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer', 'refund'],
      required: [true, 'Transaction type is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [255, 'Description cannot exceed 255 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account is required'],
      index: true
    },
    destinationAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'bank_transfer',
      trim: true
    },
    merchant: {
      type: String,
      trim: true,
      default: ''
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    receiptUrl: {
      type: String,
      default: null
    },
    recurringTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction',
      default: null
    },
    originalTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user's transactions by date range and type
transactionSchema.index({ owner: 1, date: -1 });
transactionSchema.index({ owner: 1, account: 1, date: -1 });
transactionSchema.index({ owner: 1, category: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
