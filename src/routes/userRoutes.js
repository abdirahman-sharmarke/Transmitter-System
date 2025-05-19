const express = require('express');
const userController = require('../controllers/userController');
const { ROLES } = require('../models/User');
const { uploadAvatar, processAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (in a real app, would have authorization middleware)
 */
router.get('/', userController.getAllUsers);

/**
 * @route GET /api/users/roles
 * @desc Get available user roles
 * @access Public
 */
router.get('/roles', (req, res) => {
  res.status(200).json({ 
    roles: Object.values(ROLES),
    message: 'Available user roles' 
  });
});

/**
 * @route GET /api/users/role/:role
 * @desc Get users by role
 * @access Private
 */
router.get('/role/:role', userController.getUsersByRole);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', userController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user (register)
 * @access Public
 */
router.post('/', uploadAvatar, processAvatar, userController.createUser);

/**
 * @route POST /api/users/login
 * @desc User login
 * @access Public
 */
router.post('/login', userController.loginUser);

/**
 * @route PUT /api/users/:id
 * @desc Update user information
 * @access Private
 */
router.put('/:id', uploadAvatar, processAvatar, userController.updateUser);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role
 * @access Private
 */
router.patch('/:id/role', userController.updateUserRole);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private
 */
router.delete('/:id', userController.deleteUser);

module.exports = router; 