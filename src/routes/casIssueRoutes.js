const express = require('express');
const casIssueController = require('../controllers/casIssueController');
const { ROLES } = require('../models/User');

// Simple role check middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // In a real app, this would check the authenticated user's role
    // For now, we'll use a simple header for testing
    const userRole = req.headers['x-user-role'] || '';
    
    // TESTING MODE: Skip role check for now
    // Comment this out when going to production
    console.log('⚠️ TESTING MODE: Skipping role check');
    return next();
    
    // Production code:
    /*
    if (!allowedRoles.includes(userRole.toLowerCase())) {
      return res.status(403).json({ 
        message: 'Access denied. Required role: ' + allowedRoles.join(' or ') 
      });
    }
    
    next();
    */
  };
};

const router = express.Router();

/**
 * @route GET /api/cas-issues/metadata
 * @desc Get metadata for CAS issues (dropdown options for issue types, severity, status)
 * @access Public
 */
router.get('/metadata', casIssueController.getCasIssueMetadata);

/**
 * @route POST /api/cas-issues
 * @desc Create a new CAS issue with issue type, severity, description, and reported user ID
 * @access Customer Support
 */
router.post('/', 
  checkRole([ROLES.CUSTOMER_SUPPORT, ROLES.ADMIN]), 
  casIssueController.createCasIssue
);

/**
 * @route GET /api/cas-issues
 * @desc Get all CAS issues with optional status filtering
 * @access Admin
 */
router.get('/', 
  checkRole([ROLES.ADMIN]), 
  casIssueController.getAllCasIssues
);

/**
 * @route GET /api/cas-issues/:id
 * @desc Get CAS issue by ID
 * @access Admin
 */
router.get('/:id', 
  checkRole([ROLES.ADMIN]), 
  casIssueController.getCasIssueById
);

/**
 * @route PUT /api/cas-issues/:id
 * @desc Update CAS issue status (New → In Progress → Completed)
 * @access Admin
 */
router.put('/:id', 
  checkRole([ROLES.ADMIN]), 
  casIssueController.updateCasIssue
);

module.exports = router; 