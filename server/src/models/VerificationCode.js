const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VerificationCode = sequelize.define('VerificationCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expireTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'verification_code',
  timestamps: false,
  indexes: [
    {
      name: 'idx_email',
      fields: ['email']
    }
  ]
});

module.exports = VerificationCode;