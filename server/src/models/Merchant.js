const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Merchant = sequelize.define('Merchant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  licenseImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // pending | approved | rejected
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
  tableName: 'merchant',
  timestamps: false
});

module.exports = Merchant;
