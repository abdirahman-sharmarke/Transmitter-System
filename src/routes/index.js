const express = require('express');
const userRoutes = require('./userRoutes');
const casIssueRoutes = require('./casIssueRoutes');
const channelIssueRoutes = require('./channelIssueRoutes');
const frequencyIssueRoutes = require('./frequencyIssueRoutes');
const notificationRoutes = require('./notificationRoutes');
const { isAuthenticated, hasRole, isAdmin } = require('../middleware/authMiddleware');
const { ROLES } = require('../models/User');

const router = express.Router();

// Public routes
router.use('/users', userRoutes);

// CAS issue routes 
// Note: casIssueRoutes has its own role checking for now
router.use('/cas-issues', casIssueRoutes);

// Channel issue routes
router.use('/channel-issues', channelIssueRoutes);

// Frequency issue routes
router.use('/frequency-issues', frequencyIssueRoutes);

// Notification routes (requires authentication in its own router)
router.use('/notifications', notificationRoutes);

// Protected routes examples
router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin access granted', user: req.user });
});

router.get('/technical', isAuthenticated, hasRole(ROLES.TECHNICAL), (req, res) => {
  res.status(200).json({ message: 'Technical access granted', user: req.user });
});

router.get('/support', isAuthenticated, hasRole(ROLES.CUSTOMER_SUPPORT), (req, res) => {
  res.status(200).json({ message: 'Customer support access granted', user: req.user });
});

// Role-specific API routes could be added here
// For example: router.use('/admin', isAuthenticated, isAdmin, adminRoutes);

module.exports = router; 