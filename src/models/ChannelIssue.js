const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChannelIssue = sequelize.define('ChannelIssue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  channel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false
  },
  issueType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('assignedTo');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('assignedTo', JSON.stringify(value || []));
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dateReported: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Resolved'),
    defaultValue: 'Open'
  }
}, {
  tableName: 'channel_issues',
  timestamps: true
});

module.exports = ChannelIssue; 