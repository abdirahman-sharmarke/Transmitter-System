const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// TEMPORARILY COMMENTED OUT FOR TESTING
// router.use(isAuthenticated);

// Test endpoint to create a notification (for testing only)
router.post('/test-create', async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.body.userId || 1,
      message: req.body.message || 'Test notification message',
      type: req.body.type || 'test',
      entityId: req.body.entityId || 1,
      entityType: req.body.entityType || 'test_entity',
      isRead: false
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
});

// Get all notifications (temporarily removed userId filter for testing)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all notifications for testing');
    
    // Get all notifications for testing
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${notifications.length} notifications`);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
});

// Get user notifications (with the userId from query parameter for testing)
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`Fetching notifications for user ID: ${userId}`);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const notificationService = require('../services/notificationService');
    const notifications = await notificationService.getUnreadNotifications(userId);
    
    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
});

// Mark notification(s) as read
router.patch('/:notificationId/read', async (req, res) => {
  // Temporary testing function that doesn't require auth
  try {
    // Get userId from query parameter or default to 1
    const userId = parseInt(req.query.userId || 1);
    const { notificationId } = req.params;
    
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
    
    const notificationService = require('../services/notificationService');
    const success = await notificationService.markAsRead(notificationId, userId);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Notification(s) marked as read'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to mark notification(s) as read'
      });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

module.exports = router; 