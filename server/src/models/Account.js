const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['checking', 'savings', 'credit_card', 'cash', 'digital_wallet', 'investment', 'other'],
      default: 'checking',
      required: true
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3
    },
    openingBalance: {
      type: Number,
      default: 0
    },
    currentBalance: {
      type: Number,
      default: 0
    },
    institutionName: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      default: '#3978D4',
      trim: true
    },
    icon: {
      type: String,
      default: 'wallet',
      trim: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

accountSchema.index({ owner: 1, isArchived: 1 });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
