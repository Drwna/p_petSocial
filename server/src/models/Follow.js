const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  followerPetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  followingPetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'follow',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['followerPetId', 'followingPetId']
    }
  ]
});

module.exports = Follow;