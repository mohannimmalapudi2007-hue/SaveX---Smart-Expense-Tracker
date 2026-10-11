const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const savingsGoalSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0.01, 'Target amount must be positive']
    },
    currentAmount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    targetDate: {
      type: Date,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    icon: {
      type: String,
      default: 'target',
      trim: true
    },
    color: {
      type: String,
      default: '#3978D4',
      trim: true
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused', 'archived'],
      default: 'in_progress',
      index: true
    },
    contributions: [contributionSchema]
  },
  {
    timestamps: true
  }
);

savingsGoalSchema.index({ owner: 1, status: 1 });

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

module.exports = SavingsGoal;
