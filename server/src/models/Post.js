const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isPinned: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  isFeatured: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  createTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isDeleted: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'post',
  timestamps: false
});

module.exports = Post;