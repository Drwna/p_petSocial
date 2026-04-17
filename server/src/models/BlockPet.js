const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlockPet = sequelize.define('BlockPet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blockerPetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  blockedPetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'block_pet',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['blockerPetId', 'blockedPetId']
    }
  ]
});

module.exports = BlockPet;
