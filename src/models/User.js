const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define available roles
const ROLES = {
  ADMIN: 'admin',
  CUSTOMER_SUPPORT: 'customer_support',
  TECHNICAL: 'technical'
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: {
        msg: "Please provide a valid email address"
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL path to the avatar image'
  },
  workExperience: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User\'s work experience details'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: ROLES.ADMIN,
    allowNull: false,
    validate: {
      isIn: {
        args: [Object.values(ROLES)],
        msg: `Role must be one of: ${Object.values(ROLES).join(', ')}`
      }
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'app_users'
});

module.exports = { User, ROLES }; 