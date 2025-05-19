const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define constants for the model
const ISSUE_TYPES = {
  ERROR: 'Error',
  LOADING_TAKES_MORE_TIME: 'Loading... Takes More Time',
  LOADING_NO_RESPONSE: 'Loading... no response',
  ERROR_DISCONNECTED: 'Error: disconnected to CAS',
  ERROR_FOR_ONE_IC_CARD: 'Error For One Ic Card',
  GENERAL_ERROR: 'General Error',
  CAS_DOWN: 'CAS Down'
};

const SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

const STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

const CasIssue = sequelize.define('CasIssue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  issueType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(ISSUE_TYPES)]
    }
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(SEVERITY)]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID of the person assigned to this issue'
  },
  // Virtual field for assigned user's full name
  assignedToFullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('_assignedToFullName');
    },
    set(value) {
      this.setDataValue('_assignedToFullName', value);
    }
  },
  reportedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID of the person who reported this issue'
  },
  // Virtual field for reporting user's full name
  reportedByFullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('_reportedByFullName');
    },
    set(value) {
      this.setDataValue('_reportedByFullName', value);
    }
  },
  reportedByEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email of the person who reported this issue (for reference)'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: STATUS.NEW,
    validate: {
      isIn: [Object.values(STATUS)]
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID of the person who completed this issue'
  },
  // Virtual field for completing user's full name
  completedByFullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('_completedByFullName');
    },
    set(value) {
      this.setDataValue('_completedByFullName', value);
    }
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
  tableName: 'cas_issues'
});

module.exports = { 
  CasIssue,
  ISSUE_TYPES,
  SEVERITY,
  STATUS
}; 