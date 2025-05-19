const notificationService = require('../services/notificationService');

/**
 * Get all unread notifications for the authenticated user
 */
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    const notifications = await notificationService.getUnreadNotifications(userId);
    
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
};

/**
 * Mark notification(s) as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    const { notificationId } = req.params; // 'all' or specific ID
    
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
}; 