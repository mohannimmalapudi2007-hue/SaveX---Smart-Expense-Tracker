const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Account = require('../models/Account');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const AuditEvent = require('../models/AuditEvent');
const config = require('../config/env');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const { seedDefaultCategoriesForUser } = require('../utils/seedCategories');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, preferredCurrency } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError('Please provide name, email, and password.');
    }

    if (password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new BadRequestError('An account with this email address already exists.');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      preferredCurrency: preferredCurrency ? preferredCurrency.toUpperCase().trim() : 'USD'
    });

    // Automatically seed default expense and income categories
    await seedDefaultCategoriesForUser(user._id);

    // Create Audit Event
    await AuditEvent.create({
      owner: user._id,
      action: 'USER_REGISTERED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide both email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Intentionally generic error message to prevent enumeration
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Ensure categories are seeded (in case registered earlier)
    await seedDefaultCategoriesForUser(user._id);

    await AuditEvent.create({
      owner: user._id,
      action: 'USER_LOGIN',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await AuditEvent.create({
        owner: req.user._id,
        action: 'USER_LOGOUT',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError('Please provide an email address.');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Always return success response to prevent account enumeration
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with that email, a password reset token has been issued.'
      });
    }

    // Generate single-use reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await AuditEvent.create({
      owner: user._id,
      action: 'FORGOT_PASSWORD_REQUEST',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    // In a production environment with email SMTP, this would send an email.
    // In dev, we also return the token for testing convenience.
    res.status(200).json({
      status: 'success',
      message: 'If an account exists with that email, a password reset token has been issued.',
      ...(config.isProduction ? {} : { devResetToken: resetToken })
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new BadRequestError('Token and new password are required.');
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired.');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await AuditEvent.create({
      owner: user._id,
      action: 'PASSWORD_RESET_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, preferredCurrency, timezone, locale, accessibilityPreferences, notificationPreferences } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (preferredCurrency) user.preferredCurrency = preferredCurrency.toUpperCase().trim();
    if (timezone) user.timezone = timezone.trim();
    if (locale) user.locale = locale.trim();
    if (accessibilityPreferences) {
      user.accessibilityPreferences = {
        ...user.accessibilityPreferences,
        ...accessibilityPreferences
      };
    }
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current password and new password are required.');
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long.');
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match.');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    await AuditEvent.create({
      owner: user._id,
      action: 'PASSWORD_CHANGED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const {
      displayName,
      preferredCurrency,
      initialAccountName,
      initialAccountBalance,
      initialAccountType,
      monthlyBudgetLimit,
      savingsGoalName,
      savingsGoalTarget,
      savingsGoalDate
    } = req.body;

    const user = req.user;
    if (displayName) user.name = displayName.trim();
    if (preferredCurrency) user.preferredCurrency = preferredCurrency.toUpperCase().trim();
    user.onboardingCompleted = true;
    await user.save();

    // Optionally create starting account if supplied
    if (initialAccountName && initialAccountBalance !== undefined) {
      const balance = Number(initialAccountBalance) || 0;
      await Account.create({
        owner: user._id,
        name: initialAccountName.trim(),
        type: initialAccountType || 'checking',
        currency: user.preferredCurrency,
        openingBalance: balance,
        currentBalance: balance,
        color: '#3978D4'
      });
    }

    // Optionally create starting monthly budget if supplied
    if (monthlyBudgetLimit && Number(monthlyBudgetLimit) > 0) {
      await Budget.create({
        owner: user._id,
        name: 'Monthly Overall Budget',
        period: 'monthly',
        limit: Number(monthlyBudgetLimit),
        currency: user.preferredCurrency
      });
    }

    // Optionally create starting savings goal if supplied
    if (savingsGoalName && savingsGoalTarget && Number(savingsGoalTarget) > 0) {
      await SavingsGoal.create({
        owner: user._id,
        name: savingsGoalName.trim(),
        targetAmount: Number(savingsGoalTarget),
        currency: user.preferredCurrency,
        targetDate: savingsGoalDate ? new Date(savingsGoalDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Onboarding completed successfully.',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  completeOnboarding
};
