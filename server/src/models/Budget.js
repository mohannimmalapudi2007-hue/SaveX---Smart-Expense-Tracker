const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      maxlength: [100, 'Budget name cannot exceed 100 characters']
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly', 'custom'],
      default: 'monthly',
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0.01, 'Limit must be positive']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
      }
    },
    endDate: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    },
    alertThresholds: {
      type: [Number],
      default: [50, 75, 90, 100]
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index({ owner: 1, status: 1, startDate: 1, endDate: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
