const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of notification (e.g., issue_assigned, issue_updated, etc.)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the related entity (issue, etc.)'
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type of the related entity (frequency_issue, channel_issue, etc.)'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification; 