require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pet = require('./models/Pet');

const app = express();
const port = process.env.PORT || 3005;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 托管静态文件

// 连接到MongoDB数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/petEncyclopedia';
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB连接成功'))
.catch(err => console.error('❌ MongoDB连接失败:', err));

// ================= API 路由 =================

// 1. 获取所有宠物数据
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 1.5 根据名称搜索宠物数据 (注意：需放在 :id 路由之前)
app.get('/api/pets/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, message: '请提供搜索名称 (例如 ?name=拉布拉多)' });
    
    // 使用正则表达式进行模糊匹配，忽略大小写
    const pets = await Pet.find({ name: { $regex: name, $options: 'i' } });
    
    // 如果想要只返回精确匹配的第一个，可以判断 pets.length 
    res.json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. 根据ID获取单个宠物数据
app.get('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: '找不到该宠物' });
    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. 添加新的宠物数据
app.post('/api/pets', async (req, res) => {
  try {
    const newPet = new Pet(req.body);
    const savedPet = await newPet.save();
    res.status(201).json({ success: true, data: savedPet, message: '添加成功' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. 更新宠物数据
app.put('/api/pets/:id', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPet) return res.status(404).json({ success: false, message: '找不到该宠物' });
    res.json({ success: true, data: updatedPet, message: '更新成功' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. 删除宠物数据
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ success: false, message: '找不到该宠物' });
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. 快捷添加一条测试数据（可选）
app.post('/api/pets/init-test', async (req, res) => {
  const samplePet = {
    name: "金毛寻回犬",
    engname: "Golden Retriever",
    nation: "英国",
    life: "10-12年",
    price: "1500-5000",
    pic: "https://example.com/golden.jpg",
    sticky: 3,
    shout: 1,
    friendly: 5,
    lint: 3,
    beauty: 2,
    odour: 2,
    saliva: 5,
    active: 1,
    message: "性格善良友好、对主人十分忠诚。",
    feed: "注意控制体重，定时定量喂食。",
    relative: "拉布拉多",
    pick: "挑选骨骼粗壮、毛发光泽的幼犬。"
  };
  try {
    const newPet = new Pet(samplePet);
    await newPet.save();
    res.json({ success: true, message: '测试数据添加成功', data: newPet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${port}`);
});
