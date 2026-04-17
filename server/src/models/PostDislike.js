const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostDislike = sequelize.define('PostDislike', {
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
  tableName: 'post_dislike',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['petId', 'postId']
    }
  ]
});

module.exports = PostDislike;
