const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bookmark',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['petId', 'postId']
    }
  ]
});

module.exports = Bookmark;