const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true  // null = 不限人数
  },
  currentParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // pending | active | rejected | ended | cancelled
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  rejectReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity',
  timestamps: false
});

module.exports = Activity;
