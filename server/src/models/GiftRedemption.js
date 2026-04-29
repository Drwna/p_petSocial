const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GiftRedemption = sequelize.define('GiftRedemption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  giftId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pointCost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // pending | shipped
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'gift_redemption',
  timestamps: false
});

module.exports = GiftRedemption;
