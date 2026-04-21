const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const { Category, Topic, Account, Pet } = require('./models');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
// 静态文件服务，用于访问上传的图片
app.use('/public', express.static('src/public'));

// 路由
const accountRoutes = require('./routes/account');
const petRoutes = require('./routes/pet');
const postRoutes = require('./routes/post');
const categoryRoutes = require('./routes/category');
const commentRoutes = require('./routes/comment');
const followRoutes = require('./routes/follow');
const uploadRoutes = require('./routes/upload');
const topicRoutes = require('./routes/topic');
const bookmarkRoutes = require('./routes/bookmark');
const pointRoutes = require('./routes/point');

app.use('/api/account', accountRoutes);
app.use('/api/pet', petRoutes);
app.use('/api/post', postRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/topic', topicRoutes);
app.use('/api/bookmark', bookmarkRoutes);
app.use('/api/point', pointRoutes);

// 初始化数据库
const initDatabase = async () => {
  try {
    // 创建数据库表，如果表存在则修改表结构以匹配模型定义
    await sequelize.sync({ alter: true });
    
    // 初始化分类数据, 只在表为空时初始化
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      const categories = [
        { name: '日常生活' },
        { name: '搞笑瞬间' },
        { name: '成长记录' },
        { name: '经验分享' },
        { name: '求助提问' },
        { name: '好物推荐' }
      ];
      
      await Category.bulkCreate(categories);
    }

    // 初始化话题数据
    const topicCount = await Topic.count();
    if (topicCount === 0) {
      const topics = [
        { name: '经验交流', postCount: 0, viewCount: 0 },
        { name: '话题讨论', postCount: 0, viewCount: 0 },
        { name: '萌宠日常', postCount: 0, viewCount: 0 },
        { name: '新手求助', postCount: 0, viewCount: 0 },
        { name: '铲屎官日常', postCount: 0, viewCount: 0 }
      ];
      await Topic.bulkCreate(topics);
    }

    // 自动初始化管理员账号
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@petsocial.com';
    let existingAdmin = await Account.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const pet = await Pet.create({
        petName: 'Admin',
        petType: '4', // 4-其他
        gender: '0',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        intro: 'System Administrator'
      });
      
      await Account.create({
        email: adminEmail,
        petId: pet.id,
        role: 'admin'
      });
      console.log(`管理员账号初始化成功: ${adminEmail}`);
    } else if (existingAdmin.role !== 'admin') {
      await existingAdmin.update({ role: 'admin' });
      console.log(`已将账号 ${adminEmail} 升级为管理员`);
    }

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDatabase();
});

module.exports = app;