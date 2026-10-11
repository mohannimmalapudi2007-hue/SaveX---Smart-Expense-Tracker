const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    preferredCurrency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true
    },
    locale: {
      type: String,
      default: 'en-US',
      trim: true
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    accessibilityPreferences: {
      fontSize: { type: String, enum: ['normal', 'large', 'xlarge'], default: 'normal' },
      highContrast: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false }
    },
    notificationPreferences: {
      budgetAlerts: { type: Boolean, default: true },
      billReminders: { type: Boolean, default: true },
      savingsMilestones: { type: Boolean, default: true }
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// Safe JSON serialization excluding sensitive fields
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
