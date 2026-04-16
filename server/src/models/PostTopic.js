const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostTopic = sequelize.define('PostTopic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'post_topic',
  timestamps: false
});

module.exports = PostTopic;