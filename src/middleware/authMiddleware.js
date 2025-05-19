const { User, ROLES } = require('../models/User');

// Check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    // In a real application, you would verify a JWT token here
    // For this example, we're using a simple user ID in headers
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user has required role
exports.hasRole = (requiredRole) => {
  return (req, res, next) => {
    // Make sure isAuthenticated middleware is used first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== requiredRole && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ 
        message: 'Access denied',
        requiredRole: requiredRole
      });
    }
    
    next();
  };
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  // Make sure isAuthenticated middleware is used first
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
}; 