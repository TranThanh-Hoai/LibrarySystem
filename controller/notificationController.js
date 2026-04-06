const Notification = require('../schemas/Notification');
const { getIO } = require('../config/socketConfig');

const notificationTypes = Notification.schema.path('type').enumValues || [];
const defaultNotificationType = notificationTypes[notificationTypes.length - 1] || undefined;

const resolveNotificationType = (type) => {
  if (type && notificationTypes.includes(type)) {
    return type;
  }

  const normalized = String(type || '').toLowerCase();
  const matched = notificationTypes.find((value) => value.toLowerCase() === normalized);
  return matched || defaultNotificationType;
};

const createAndSendNotification = async (user_id, message, type) => {
  try {
    const notification = new Notification({
      user_id,
      message,
      type: resolveNotificationType(type)
    });

    const savedNotification = await notification.save();
    const io = getIO();

    if (user_id) {
      io.to(user_id.toString()).emit('notification', savedNotification);
      console.log(`âœ‰ï¸ Notification sent to user: ${user_id}`);
    } else {
      io.emit('notification', savedNotification);
      console.log('âœ‰ï¸ Broadcast notification sent to all users.');
    }

    return savedNotification;
  } catch (error) {
    console.error('âŒ Error creating/sending notification:', error.message);
    return null;
  }
};

const getUserNotifications = async (user_id) => {
  return await Notification.find({
    $or: [
      { user_id: user_id },
      { user_id: { $exists: false } },
      { user_id: null }
    ]
  }).sort({ _id: -1 }).limit(20);
};

const markAsRead = async (notification_id) => {
  return await Notification.findByIdAndUpdate(
    notification_id,
    { is_read: true },
    { new: true }
  );
};

module.exports = {
  createAndSendNotification,
  getUserNotifications,
  markAsRead
};
