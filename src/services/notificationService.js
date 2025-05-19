const Notification = require('../models/Notification');
const { User } = require('../models/User');

/**
 * Create notifications for assigned users
 * @param {Array} assignedUserIds - Array of user IDs who were assigned
 * @param {Object} issue - The issue object
 * @param {String} issueType - Type of issue (frequency_issue, channel_issue, cas_issue, etc.)
 * @param {Number} createdBy - User ID of the creator
 * @returns {Promise<Array>} - Array of created notifications
 */
exports.createAssignmentNotifications = async (assignedUserIds, issue, issueType, createdBy) => {
  try {
    console.log('Creating notifications with params:', {
      assignedUserIds,
      issueId: issue?.id,
      issueType,
      createdBy
    });
    
    if (!assignedUserIds || !Array.isArray(assignedUserIds) || assignedUserIds.length === 0) {
      console.log('No valid assignedUserIds provided, skipping notification creation');
      return [];
    }

    // Get creator name
    const creator = await User.findByPk(createdBy);
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Someone';
    console.log('Creator found:', creatorName);

    // Create notification for each assigned user
    console.log('Creating notifications for users:', assignedUserIds);
    const notifications = await Promise.all(
      assignedUserIds.map(async (userId) => {
        let message = '';
        
        if (issueType === 'frequency_issue') {
          message = `${creatorName} assigned you to a frequency issue: "${issue.frequency} - ${issue.issueType}"`;
        } else if (issueType === 'channel_issue') {
          message = `${creatorName} assigned you to a channel issue: "${issue.channel} - ${issue.issueType}"`;
        } else if (issueType === 'cas_issue') {
          message = `${creatorName} assigned you to a CAS issue: "${issue.issueType} - ${issue.severity}"`;
        } else {
          message = `${creatorName} assigned you to an issue: "${issue.issueType}"`;
        }

        console.log(`Creating notification for user ${userId}:`, message);
        return await Notification.create({
          userId,
          message,
          type: 'issue_assigned',
          entityId: issue.id,
          entityType: issueType
        });
      })
    );

    console.log(`Successfully created ${notifications.length} notifications`);
    return notifications;
  } catch (error) {
    console.error('Error creating notifications:', error);
    return [];
  }
};

/**
 * Get all notifications (without filters)
 * @returns {Promise<Array>} - Array of all notifications
 */
exports.getAllNotifications = async () => {
  try {
    console.log('Getting all notifications from the database');
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${notifications.length} total notifications`);
    return notifications;
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    return [];
  }
};

/**
 * Get unread notifications for a user
 * @param {Number} userId - User ID
 * @returns {Promise<Array>} - Array of unread notifications
 */
exports.getUnreadNotifications = async (userId) => {
  try {
    console.log(`Getting unread notifications for user ID: ${userId}`);
    
    // Verify the userId
    if (!userId || isNaN(parseInt(userId))) {
      console.log(`Invalid userId: ${userId}`);
      return [];
    }
    
    // Get unread notifications
    const notifications = await Notification.findAll({
      where: {
        userId: parseInt(userId),
        isRead: false
      },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${notifications.length} unread notifications for user ${userId}`);
    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
};

/**
 * Mark notifications as read
 * @param {Number} notificationId - Notification ID (or 'all' for all user's notifications)
 * @param {Number} userId - User ID
 * @returns {Promise<Boolean>} - Success status
 */
exports.markAsRead = async (notificationId, userId) => {
  try {
    if (notificationId === 'all') {
      await Notification.update(
        { isRead: true },
        { where: { userId } }
      );
    } else {
      await Notification.update(
        { isRead: true },
        { where: { id: notificationId, userId } }
      );
    }
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
}; 