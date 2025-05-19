const { sequelize } = require('../config/database');
const { User, ROLES } = require('./User');
const { CasIssue, ISSUE_TYPES, SEVERITY, STATUS } = require('./CasIssue');
const ChannelIssue = require('./ChannelIssue');
const FrequencyIssue = require('./FrequencyIssue');
const Notification = require('./Notification');

// Define associations between models
// A user can report many issues
User.hasMany(CasIssue, { 
  foreignKey: 'reportedById',
  as: 'reportedIssues'
});
CasIssue.belongsTo(User, { 
  foreignKey: 'reportedById',
  as: 'reportedByUser'
});

// A user can be assigned to many issues
User.hasMany(CasIssue, { 
  foreignKey: 'assignedTo',
  as: 'assignedIssues'
});
CasIssue.belongsTo(User, { 
  foreignKey: 'assignedTo',
  as: 'assignedToUser'
});

// A user can complete many issues
User.hasMany(CasIssue, { 
  foreignKey: 'completedById',
  as: 'completedIssues'
});
CasIssue.belongsTo(User, { 
  foreignKey: 'completedById',
  as: 'completedByUser'
});

// Channel Issue associations
User.hasMany(ChannelIssue, {
  foreignKey: 'createdBy',
  as: 'channelIssuesCreated'
});
ChannelIssue.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Frequency Issue associations
User.hasMany(FrequencyIssue, {
  foreignKey: 'createdBy',
  as: 'frequencyIssuesCreated'
});
FrequencyIssue.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Notification associations
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Export models
const db = {
  sequelize,
  User,
  ROLES,
  CasIssue,
  ISSUE_TYPES,
  SEVERITY,
  STATUS,
  ChannelIssue,
  FrequencyIssue,
  Notification
};

module.exports = db; 