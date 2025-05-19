const ChannelIssue = require('../models/ChannelIssue');
const { User } = require('../models/User');
const notificationService = require('../services/notificationService');

// Create a new channel issue
exports.createChannelIssue = async (req, res) => {
  try {
    const { 
      channel, 
      issueType, 
      severity, 
      description, 
      assignedTo, 
      createdBy 
    } = req.body;

    console.log('Creating channel issue with data:', { 
      channel, 
      issueType, 
      severity, 
      description, 
      assignedTo, 
      createdBy 
    });

    // Parse assignedTo if it's a string (e.g., from form-data)
    let parsedAssignedTo = assignedTo;
    if (typeof assignedTo === 'string') {
      try {
        parsedAssignedTo = JSON.parse(assignedTo);
      } catch (e) {
        console.log('Failed to parse assignedTo string, using as is');
      }
    }

    const newIssue = await ChannelIssue.create({
      channel,
      issueType,
      severity,
      description,
      assignedTo: parsedAssignedTo || [],
      createdBy,
      status: 'Open'
    });

    console.log('Created new channel issue:', newIssue.id);

    // Create notifications for assigned users
    if (parsedAssignedTo && Array.isArray(parsedAssignedTo) && parsedAssignedTo.length > 0) {
      console.log('Calling notification service for assigned users:', parsedAssignedTo);
      await notificationService.createAssignmentNotifications(
        parsedAssignedTo, 
        newIssue, 
        'channel_issue',
        createdBy
      );
    } else {
      console.log('No users assigned, skipping notifications');
    }

    res.status(201).json({ 
      success: true, 
      data: newIssue 
    });
  } catch (error) {
    console.error('Error creating channel issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create channel issue', 
      error: error.message 
    });
  }
};

// Get all channel issues with optional filtering
exports.getAllChannelIssues = async (req, res) => {
  try {
    const { status, channel, severity } = req.query;
    
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (channel) whereClause.channel = channel;
    if (severity) whereClause.severity = severity;
    
    const issues = await ChannelIssue.findAll({
      where: whereClause,
      order: [['dateReported', 'DESC']]
    });
    
    res.status(200).json({ 
      success: true, 
      count: issues.length, 
      data: issues 
    });
  } catch (error) {
    console.error('Error fetching channel issues:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve channel issues', 
      error: error.message 
    });
  }
};

// Get a single channel issue by ID
exports.getChannelIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await ChannelIssue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel issue not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: issue 
    });
  } catch (error) {
    console.error('Error fetching channel issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve channel issue', 
      error: error.message 
    });
  }
};

// Update a channel issue
exports.updateChannelIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      channel,
      issueType,
      severity,
      description,
      assignedTo,
      status
    } = req.body;
    
    const issue = await ChannelIssue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel issue not found' 
      });
    }
    
    // Parse assignedTo if it's a string (e.g., from form-data)
    let parsedAssignedTo = assignedTo;
    if (typeof assignedTo === 'string') {
      try {
        parsedAssignedTo = JSON.parse(assignedTo);
      } catch (e) {
        console.log('Failed to parse assignedTo string, using as is');
      }
    }
    
    // Check if assignedTo has changed
    const oldAssignedTo = issue.assignedTo || [];
    const newAssignedTo = parsedAssignedTo || oldAssignedTo;
    
    // Find newly assigned users
    const newlyAssigned = Array.isArray(newAssignedTo) ? 
      newAssignedTo.filter(userId => !oldAssignedTo.includes(userId)) :
      [];
    
    const updatedIssue = await issue.update({
      ...(channel && { channel }),
      ...(issueType && { issueType }),
      ...(severity && { severity }),
      ...(description && { description }),
      ...(parsedAssignedTo && { assignedTo: parsedAssignedTo }),
      ...(status && { status })
    });
    
    // Create notifications for newly assigned users
    if (newlyAssigned.length > 0) {
      console.log('Creating notifications for newly assigned users:', newlyAssigned);
      await notificationService.createAssignmentNotifications(
        newlyAssigned, 
        updatedIssue, 
        'channel_issue',
        req.user?.id || updatedIssue.createdBy
      );
    }
    
    res.status(200).json({ 
      success: true, 
      data: updatedIssue 
    });
  } catch (error) {
    console.error('Error updating channel issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update channel issue', 
      error: error.message 
    });
  }
};

// Delete a channel issue
exports.deleteChannelIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await ChannelIssue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel issue not found' 
      });
    }
    
    await issue.destroy();
    
    res.status(200).json({ 
      success: true, 
      message: 'Channel issue deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting channel issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete channel issue', 
      error: error.message 
    });
  }
};

// Get metadata for dropdowns
exports.getMetadata = async (req, res) => {
  try {
    const channelOptions = [
      'Channel 15',
      'Channel 27',
      'Channel 42',
      'Channel 78',
      'Channel 103'
    ];
    
    const issueTypes = [
      'Mugdi waaye',
      'Lacag la\'aan waaye',
      'Jajabaa soo qalaayo',
      'Channalkiisa saxda ma saarno'
    ];
    
    const severityLevels = [
      'Low',
      'Medium',
      'High'
    ];
    
    const statusOptions = [
      'Open',
      'In Progress',
      'Resolved'
    ];
    
    // Get users for assignee options
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName']
    });
    
    res.status(200).json({
      success: true,
      data: {
        channelOptions,
        issueTypes,
        severityLevels,
        statusOptions,
        users
      }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve metadata', 
      error: error.message 
    });
  }
}; 