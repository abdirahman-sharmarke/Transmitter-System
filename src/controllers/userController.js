const { User, ROLES } = require('../models/User');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Salt rounds for bcrypt
const SALT_ROUNDS = 10;

// For testing only - set to false in production!
const USE_PLAIN_PASSWORDS = true;

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      // Don't exclude password
      order: [['createdAt', 'DESC']]
    });
    
    // Explicitly map all fields to ensure all columns are returned
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        id: userData.id,
        email: userData.email,
        employeeId: userData.employeeId || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        phoneNumber: userData.phoneNumber || null,
        avatar: userData.avatar || null,
        workExperience: userData.workExperience || null,
        role: userData.role,
        active: userData.active !== undefined ? userData.active : true,
        lastLogin: userData.lastLogin || null,
        password: userData.password, // Explicitly include password
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    });
    
    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the user data to include all fields
    const userData = user.toJSON();
    const formattedUser = {
      id: userData.id,
      email: userData.email,
      employeeId: userData.employeeId || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      phoneNumber: userData.phoneNumber || null,
      avatar: userData.avatar || null,
      workExperience: userData.workExperience || null,
      role: userData.role,
      active: userData.active !== undefined ? userData.active : true,
      lastLogin: userData.lastLogin || null,
      password: userData.password, // Explicitly include password
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
    
    return res.status(200).json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create a new user (register)
exports.createUser = async (req, res) => {
  try {
    console.log('Received raw body:', req.body);
    
    // Fix potential spelling variations
    if (req.body.employeeId && !req.body.employeeId) {
      req.body.employeeId = req.body.employeeId;
    }
    
    const { 
      email, 
      employeeId, 
      password, 
      role, 
      firstName, 
      lastName, 
      phoneNumber, 
      avatar, 
      workExperience 
    } = req.body;
    
    console.log('Parsed fields:', { 
      email, 
      employeeId, 
      password: password ? '****' : undefined,
      role, 
      firstName, 
      lastName 
    });

    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    // Create new user without validation errors
    try {
      console.log('Creating new user');
      const newUser = await User.create({
        email,
        employeeId,
        password: password, // Using plain password for development
        firstName,
        lastName,
        phoneNumber,
        avatar,
        workExperience,
        role: role ? role.toLowerCase() : 'admin',
        active: true
      });
      
      console.log('User created successfully');
      
      // Return the created user with password
      const userJSON = newUser.toJSON();
      return res.status(201).json({
        ...userJSON,
        password: password, // Explicitly include the password
        plainPassword: password // Keep original password for reference
      });
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationError.errors?.map(e => ({ field: e.path, message: e.message })) || [validationError.message]
      });
    }
  } catch (error) {
    console.error('Error creating user:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, employeeId, password } = req.body;
    
    // Validate that either email or employeeId is provided
    if (!email && !employeeId) {
      return res.status(400).json({ message: 'Either email or employeeId is required' });
    }
    
    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    // Find user by email or employeeId
    const whereClause = {};
    if (email) whereClause.email = email;
    if (employeeId) whereClause.employeeId = employeeId;
    
    const user = await User.findOne({ where: whereClause });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ message: 'Account is disabled. Please contact administrator.' });
    }
    
    // Check password 
    let passwordMatch = false;
    
    if (USE_PLAIN_PASSWORDS) {
      // Direct comparison for testing
      passwordMatch = (user.password === password);
    } else {
      // Secure bcrypt comparison for production
      passwordMatch = await bcrypt.compare(password, user.password);
    }
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login time
    await user.update({ lastLogin: new Date() });
    
    // Return user data
    const userData = user.toJSON();
    
    if (USE_PLAIN_PASSWORDS) {
      // Include password in response for testing
      return res.status(200).json({
        message: 'Login successful',
        user: userData
      });
    }
    
    // Production - don't return password
    const { password: _, ...userWithoutPassword } = userData;
    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during login:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { 
      email, 
      employeeId, 
      password, 
      role, 
      firstName, 
      lastName, 
      phoneNumber,
      avatar,
      workExperience,
      active 
    } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Normalize role if provided
    let normalizedRole = null;
    if (role) {
      normalizedRole = role.toLowerCase();
      // Validate role
      if (!Object.values(ROLES).includes(normalizedRole)) {
        return res.status(400).json({ 
          message: 'Invalid role', 
          validRoles: Object.values(ROLES) 
        });
      }
    }
    
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (employeeId !== undefined) updateData.employeeId = employeeId;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (workExperience !== undefined) updateData.workExperience = workExperience;
    if (active !== undefined) updateData.active = active;
    
    if (password) {
      if (USE_PLAIN_PASSWORDS) {
        updateData.password = password;
      } else {
        // Hash new password
        updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
      }
    }
    if (normalizedRole) updateData.role = normalizedRole;
    
    await user.update(updateData);
    
    // Return response based on configuration
    if (USE_PLAIN_PASSWORDS) {
      return res.status(200).json(user.toJSON());
    }
    
    // Don't return the password
    const { password: _, ...updatedUser } = user.toJSON();
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    // Convert role to lowercase for case-insensitive comparison
    const normalizedRole = role.toLowerCase();
    
    // Validate role
    if (!Object.values(ROLES).includes(normalizedRole)) {
      return res.status(400).json({ 
        message: 'Invalid role', 
        validRoles: Object.values(ROLES) 
      });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.update({ role: normalizedRole });
    
    // Don't return the password
    const { password: _, ...updatedUser } = user.toJSON();
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role', 
        validRoles: Object.values(ROLES) 
      });
    }
    
    const users = await User.findAll({
      where: { role }
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}; 