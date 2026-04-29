const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityParticipant = sequelize.define('ActivityParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  joinTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity_participant',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['activityId', 'accountId']
    }
  ]
});

module.exports = ActivityParticipant;
