const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'post_like',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['postId', 'petId']
    }
  ]
});

module.exports = PostLike;