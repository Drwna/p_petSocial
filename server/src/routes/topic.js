const express = require('express');
const { Topic } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取话题列表
router.get('/list', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      order: [['postCount', 'DESC']]
    });
    
    res.json({
      code: 0,
      data: {
        list: topics
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取话题列表失败',
      error: error.message
    });
  }
});

// 获取热门话题
router.get('/hot', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      order: [['postCount', 'DESC']],
      limit: 5
    });
    
    res.json({
      code: 0,
      data: {
        list: topics
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取热门话题失败',
      error: error.message
    });
  }
});

// 创建话题（管理员）
router.post('/create', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ code: 400, msg: '话题名称必填' });
    const topic = await Topic.create({ name, description });
    res.json({ code: 0, msg: '创建成功', data: topic });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 更新话题（管理员）
router.post('/update', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { id, name, description } = req.body;
    const topic = await Topic.findByPk(id);
    if (!topic) return res.status(404).json({ code: 404, msg: '话题不存在' });
    await topic.update({ name, description });
    res.json({ code: 0, msg: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 删除话题（管理员）
router.post('/delete', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { id } = req.body;
    const topic = await Topic.findByPk(id);
    if (!topic) return res.status(404).json({ code: 404, msg: '话题不存在' });
    await topic.destroy();
    res.json({ code: 0, msg: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

module.exports = router;