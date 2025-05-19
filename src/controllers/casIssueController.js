const { CasIssue, STATUS } = require('../models/CasIssue');
const { User } = require('../models/User');
const notificationService = require('../services/notificationService');

/**
 * Create a new CAS issue
 * @access Customer Support role
 */
exports.createCasIssue = async (req, res) => {
  try {
    const { 
      issueType, 
      severity, 
      description, 
      assignedTo,
      reportedById 
    } = req.body;
    
    console.log('Creating CAS issue with data:', {
      issueType,
      severity,
      description,
      assignedTo,
      reportedById
    });
    
    // Initialize variables
    let reportedByEmail = null;
    let reportedByFullName = null;
    let assignedToFullName = null;
    
    // Validate required fields
    if (!issueType || !severity || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['issueType', 'severity', 'description'] 
      });
    }
    
    // Check if the reported user exists if ID provided
    if (reportedById) {
      const reportingUser = await User.findByPk(reportedById);
      if (!reportingUser) {
        return res.status(400).json({ message: 'Reporting user not found' });
      }
      // Set email and full name from user if available
      reportedByEmail = reportingUser.email;
      reportedByFullName = `${reportingUser.firstName || ''} ${reportingUser.lastName || ''}`.trim() || 'Unknown';
    }
    
    // Check if assignedTo user exists if provided
    if (assignedTo) {
      const assignedUser = await User.findByPk(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      assignedToFullName = `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() || 'Unknown';
    }
    
    // Create new CAS issue
    const newIssue = await CasIssue.create({
      issueType,
      severity,
      description,
      assignedTo: assignedTo || null,
      reportedById,
      reportedByEmail: reportedByEmail || null,
      status: STATUS.NEW
    });
    
    console.log('Created new CAS issue:', newIssue.id);
    
    // Create notification for assigned user
    if (assignedTo) {
      console.log('Creating notification for assigned user:', assignedTo);
      await notificationService.createAssignmentNotifications(
        [assignedTo], // Send as array for the notification service
        newIssue,
        'cas_issue',
        reportedById
      );
    }
    
    // Get the created issue (simple approach without eager loading)
    const createdIssue = await CasIssue.findByPk(newIssue.id);
    
    // Enhance the response with user details manually
    const responseData = createdIssue.toJSON();
    
    // Add full name information to the response
    if (reportedByFullName) {
      responseData.reportedByFullName = reportedByFullName;
    }
    
    if (assignedToFullName) {
      responseData.assignedToFullName = assignedToFullName;
    }
    
    return res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating CAS issue:', error.message, error.stack);
    
    // Handle validation errors specifically
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get all CAS issues
 * @access Admin role
 */
exports.getAllCasIssues = async (req, res) => {
  try {
    // Optional filtering by status
    const { status } = req.query;
    const whereClause = status ? { status } : {};
    
    // Fetch issues (without eager loading)
    const issues = await CasIssue.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    // Fetch associated user details for better display
    const enhancedIssues = await Promise.all(issues.map(async (issue) => {
      const issueData = issue.toJSON();
      
      // Get assigned user data if available
      if (issueData.assignedTo) {
        const assignedUser = await User.findByPk(issueData.assignedTo);
        if (assignedUser) {
          // Add full name directly to the main response
          issueData.assignedToFullName = `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() || 'Unknown';
          
          // Keep the detailed user info in a nested object
          issueData.assignedToUser = {
            id: assignedUser.id,
            name: issueData.assignedToFullName,
            email: assignedUser.email
          };
        }
      }
      
      // Get reporter user data if available
      if (issueData.reportedById) {
        const reporterUser = await User.findByPk(issueData.reportedById);
        if (reporterUser) {
          // Add full name directly to the main response
          issueData.reportedByFullName = `${reporterUser.firstName || ''} ${reporterUser.lastName || ''}`.trim() || 'Unknown';
          
          // Keep the detailed user info in a nested object
          issueData.reportedByUser = {
            id: reporterUser.id,
            name: issueData.reportedByFullName,
            email: reporterUser.email
          };
        }
      }
      
      // Get completer user data if available
      if (issueData.completedById) {
        const completerUser = await User.findByPk(issueData.completedById);
        if (completerUser) {
          // Add full name directly to the main response
          issueData.completedByFullName = `${completerUser.firstName || ''} ${completerUser.lastName || ''}`.trim() || 'Unknown';
          
          // Keep the detailed user info in a nested object
          issueData.completedByUser = {
            id: completerUser.id,
            name: issueData.completedByFullName,
            email: completerUser.email
          };
        }
      }
      
      return issueData;
    }));
    
    return res.status(200).json(enhancedIssues);
  } catch (error) {
    console.error('Error fetching CAS issues:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get CAS issue by ID
 * @access Admin role
 */
exports.getCasIssueById = async (req, res) => {
  try {
    const issueId = req.params.id;
    
    // Get issue without eager loading
    const issue = await CasIssue.findByPk(issueId);
    
    if (!issue) {
      return res.status(404).json({ message: 'CAS issue not found' });
    }
    
    // Enhance with user information
    const issueData = issue.toJSON();
    
    // Get assigned user data if available
    if (issueData.assignedTo) {
      const assignedUser = await User.findByPk(issueData.assignedTo);
      if (assignedUser) {
        // Add full name directly to the main response
        issueData.assignedToFullName = `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() || 'Unknown';
        
        // Keep the detailed user info in a nested object
        issueData.assignedToUser = {
          id: assignedUser.id,
          name: issueData.assignedToFullName,
          email: assignedUser.email
        };
      }
    }
    
    // Get reporter user data if available
    if (issueData.reportedById) {
      const reporterUser = await User.findByPk(issueData.reportedById);
      if (reporterUser) {
        // Add full name directly to the main response
        issueData.reportedByFullName = `${reporterUser.firstName || ''} ${reporterUser.lastName || ''}`.trim() || 'Unknown';
        
        // Keep the detailed user info in a nested object
        issueData.reportedByUser = {
          id: reporterUser.id,
          name: issueData.reportedByFullName,
          email: reporterUser.email
        };
      }
    }
    
    // Get completer user data if available
    if (issueData.completedById) {
      const completerUser = await User.findByPk(issueData.completedById);
      if (completerUser) {
        // Add full name directly to the main response
        issueData.completedByFullName = `${completerUser.firstName || ''} ${completerUser.lastName || ''}`.trim() || 'Unknown';
        
        // Keep the detailed user info in a nested object
        issueData.completedByUser = {
          id: completerUser.id,
          name: issueData.completedByFullName,
          email: completerUser.email
        };
      }
    }
    
    return res.status(200).json(issueData);
  } catch (error) {
    console.error('Error fetching CAS issue:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Update CAS issue status
 * @access Admin role
 */
exports.updateCasIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status, assignedTo, completedById } = req.body;
    
    const issue = await CasIssue.findByPk(issueId);
    
    if (!issue) {
      return res.status(404).json({ message: 'CAS issue not found' });
    }
    
    const updateData = {};
    let assignedToFullName = null;
    let completedByFullName = null;
    
    // Check if assignedTo is changing
    const oldAssignedTo = issue.assignedTo;
    let newlyAssignedUser = null;
    
    // Update assignedTo if provided
    if (assignedTo !== undefined) {
      // Check if the user exists
      if (assignedTo) {
        const assignedUser = await User.findByPk(assignedTo);
        if (!assignedUser) {
          return res.status(400).json({ message: 'Assigned user not found' });
        }
        assignedToFullName = `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() || 'Unknown';
        
        // Check if this is a new assignment
        if (oldAssignedTo !== assignedTo) {
          newlyAssignedUser = assignedTo;
        }
      }
      updateData.assignedTo = assignedTo;
    }
    
    // Update status if provided
    if (status) {
      updateData.status = status;
      
      // If status is being set to completed, add completed timestamp
      if (status === STATUS.COMPLETED) {
        updateData.completedAt = new Date();
        
        // If completedById is not provided when completing, return error
        if (!completedById) {
          return res.status(400).json({ 
            message: 'completedById is required when setting status to Completed' 
          });
        }
        
        // Check if the completing user exists
        const completingUser = await User.findByPk(completedById);
        if (!completingUser) {
          return res.status(400).json({ message: 'Completing user not found' });
        }
        
        completedByFullName = `${completingUser.firstName || ''} ${completingUser.lastName || ''}`.trim() || 'Unknown';
        updateData.completedById = completedById;
      }
    }
    
    await issue.update(updateData);
    
    // Create notification for newly assigned user
    if (newlyAssignedUser) {
      console.log('Creating notification for newly assigned user:', newlyAssignedUser);
      
      // Get updated issue to pass to notification service
      const updatedIssue = await CasIssue.findByPk(issueId);
      
      await notificationService.createAssignmentNotifications(
        [newlyAssignedUser], // Send as array for the notification service
        updatedIssue,
        'cas_issue',
        req.user?.id || completedById || issue.reportedById
      );
    }
    
    // Get the updated issue
    const updatedIssue = await CasIssue.findByPk(issueId);
    const responseData = updatedIssue.toJSON();
    
    // Add full name information to the response
    if (responseData.reportedById) {
      const reporterUser = await User.findByPk(responseData.reportedById);
      if (reporterUser) {
        responseData.reportedByFullName = `${reporterUser.firstName || ''} ${reporterUser.lastName || ''}`.trim() || 'Unknown';
        responseData.reportedByUser = {
          id: reporterUser.id,
          name: responseData.reportedByFullName,
          email: reporterUser.email
        };
      }
    }
    
    if (responseData.assignedTo) {
      if (assignedToFullName) {
        responseData.assignedToFullName = assignedToFullName;
      } else {
        const assignedUser = await User.findByPk(responseData.assignedTo);
        if (assignedUser) {
          responseData.assignedToFullName = `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() || 'Unknown';
          responseData.assignedToUser = {
            id: assignedUser.id,
            name: responseData.assignedToFullName,
            email: assignedUser.email
          };
        }
      }
    }
    
    if (responseData.completedById) {
      if (completedByFullName) {
        responseData.completedByFullName = completedByFullName;
      } else {
        const completedUser = await User.findByPk(responseData.completedById);
        if (completedUser) {
          responseData.completedByFullName = `${completedUser.firstName || ''} ${completedUser.lastName || ''}`.trim() || 'Unknown';
          responseData.completedByUser = {
            id: completedUser.id,
            name: responseData.completedByFullName,
            email: completedUser.email
          };
        }
      }
    }
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error updating CAS issue:', error.message, error.stack);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get available metadata for CAS issues (dropdown options)
 * @access All roles
 */
exports.getCasIssueMetadata = async (req, res) => {
  try {
    const { ISSUE_TYPES, SEVERITY, STATUS } = require('../models/CasIssue');
    
    return res.status(200).json({
      issueTypes: Object.values(ISSUE_TYPES),
      severityLevels: Object.values(SEVERITY),
      statusOptions: Object.values(STATUS)
    });
  } catch (error) {
    console.error('Error fetching CAS issue metadata:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}; 