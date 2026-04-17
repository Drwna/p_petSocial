const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PointLog = sequelize.define('PointLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // 'post_created', 'post_featured', etc.
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  refId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'point_log',
  timestamps: false
});

module.exports = PointLog;
