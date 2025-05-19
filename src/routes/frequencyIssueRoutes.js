const express = require('express');
const router = express.Router();
const frequencyIssueController = require('../controllers/frequencyIssueController');

// Get metadata for dropdowns
router.get('/metadata', frequencyIssueController.getMetadata);

// Get all frequency issues with optional filtering
router.get('/', frequencyIssueController.getAllFrequencyIssues);

// Get a single frequency issue by ID
router.get('/:id', frequencyIssueController.getFrequencyIssueById);

// Create a new frequency issue
router.post('/', frequencyIssueController.createFrequencyIssue);

// Update a frequency issue
router.put('/:id', frequencyIssueController.updateFrequencyIssue);

// Delete a frequency issue
router.delete('/:id', frequencyIssueController.deleteFrequencyIssue);

module.exports = router; 