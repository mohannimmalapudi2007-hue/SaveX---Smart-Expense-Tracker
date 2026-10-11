const Notification = require('../models/Notification');
const { NotFoundError } = require('../utils/errors');

const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { owner: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ owner: req.user._id, isRead: false });

    res.status(200).json({
      status: 'success',
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, owner: req.user._id });
    if (!notification) {
      throw new NotFoundError('Notification not found.');
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      notification
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ owner: req.user._id, isRead: false }, { isRead: true });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, owner: req.user._id });
    if (!notification) {
      throw new NotFoundError('Notification not found.');
    }

    await Notification.deleteOne({ _id: notification._id });

    res.status(200).json({
      status: 'success',
      message: 'Notification removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
