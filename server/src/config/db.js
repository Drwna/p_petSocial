const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  try {
    // 先连接到MySQL服务器
    const connection = await mysql2.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // 关闭连接
    await connection.end();
    
    console.log('数据库创建成功');
  } catch (error) {
    console.error('数据库创建失败:', error);
  }
};

// 创建数据库
createDatabase();

// 连接到数据库
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00',
    dialectOptions: {
      charset: 'utf8mb4'
    },
    charset: 'utf8mb4',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

module.exports = sequelize;