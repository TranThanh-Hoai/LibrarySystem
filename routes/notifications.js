const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const { authenticateToken } = require('../utils/auth');

// Get current user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await notificationController.getUserNotifications(req.user._id);
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await notificationController.markAsRead(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
