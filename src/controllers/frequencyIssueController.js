const FrequencyIssue = require('../models/FrequencyIssue');
const { User } = require('../models/User');
const notificationService = require('../services/notificationService');

// Create a new frequency issue
exports.createFrequencyIssue = async (req, res) => {
  try {
    const { 
      frequency, 
      issueType, 
      severity, 
      description, 
      assignedTo, 
      createdBy 
    } = req.body;

    console.log('Creating frequency issue with data:', { 
      frequency, 
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

    const newIssue = await FrequencyIssue.create({
      frequency,
      issueType,
      severity,
      description,
      assignedTo: parsedAssignedTo || [],
      createdBy,
      status: 'Open'
    });

    console.log('Created new frequency issue:', newIssue.id);

    // Create notifications for assigned users
    if (parsedAssignedTo && Array.isArray(parsedAssignedTo) && parsedAssignedTo.length > 0) {
      console.log('Calling notification service for assigned users:', parsedAssignedTo);
      await notificationService.createAssignmentNotifications(
        parsedAssignedTo, 
        newIssue, 
        'frequency_issue',
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
    console.error('Error creating frequency issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create frequency issue', 
      error: error.message 
    });
  }
};

// Get all frequency issues with optional filtering
exports.getAllFrequencyIssues = async (req, res) => {
  try {
    const { status, frequency, severity } = req.query;
    
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (frequency) whereClause.frequency = frequency;
    if (severity) whereClause.severity = severity;
    
    const issues = await FrequencyIssue.findAll({
      where: whereClause,
      order: [['dateReported', 'DESC']]
    });
    
    res.status(200).json({ 
      success: true, 
      count: issues.length, 
      data: issues 
    });
  } catch (error) {
    console.error('Error fetching frequency issues:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve frequency issues', 
      error: error.message 
    });
  }
};

// Get a single frequency issue by ID
exports.getFrequencyIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await FrequencyIssue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Frequency issue not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: issue 
    });
  } catch (error) {
    console.error('Error fetching frequency issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve frequency issue', 
      error: error.message 
    });
  }
};

// Update a frequency issue
exports.updateFrequencyIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      frequency,
      issueType,
      severity,
      description,
      assignedTo,
      status
    } = req.body;
    
    const issue = await FrequencyIssue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Frequency issue not found' 
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
      ...(frequency && { frequency }),
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
        'frequency_issue',
        req.user?.id || updatedIssue.createdBy
      );
    }
    
    res.status(200).json({ 
      success: true, 
      data: updatedIssue 
    });
  } catch (error) {
    console.error('Error updating frequency issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update frequency issue', 
      error: error.message 
    });
  }
};

// Delete a frequency issue
exports.deleteFrequencyIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await FrequencyIssue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Frequency issue not found' 
      });
    }
    
    await issue.destroy();
    
    res.status(200).json({ 
      success: true, 
      message: 'Frequency issue deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting frequency issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete frequency issue', 
      error: error.message 
    });
  }
};

// Get metadata for dropdowns
exports.getMetadata = async (req, res) => {
  try {
    const frequencyOptions = [
      'Frequency 1',
      'Frequency 2',
      'Frequency 3',
      'Frequency 4',
      'Frequency 5',
      'Frequency 6',
      'All Frequencies'
    ];
    
    const issueTypes = [
      'Jajab waaye',
      'Mugdi waaye',
      'Dhagax dhigay',
      'Lacag la\'aan waaye'
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
      attributes: ['id', 'firstName', 'lastName']
    });
    
    res.status(200).json({
      success: true,
      data: {
        frequencyOptions,
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