const express = require('express');
const router = express.Router();
const channelIssueController = require('../controllers/channelIssueController');

// Get metadata for dropdowns
router.get('/metadata', channelIssueController.getMetadata);

// Get all channel issues with optional filtering
router.get('/', channelIssueController.getAllChannelIssues);

// Get a single channel issue by ID
router.get('/:id', channelIssueController.getChannelIssueById);

// Create a new channel issue
router.post('/', channelIssueController.createChannelIssue);

// Update a channel issue
router.put('/:id', channelIssueController.updateChannelIssue);

// Delete a channel issue
router.delete('/:id', channelIssueController.deleteChannelIssue);

module.exports = router; 