const express = require('express');
const { Category } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取帖子分类列表
router.get('/list', async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    res.json({
      code: 0,
      data: {
        list: categories
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取分类列表失败',
      error: error.message
    });
  }
});

// 创建分类（管理员）
router.post('/create', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ code: 400, msg: '分类名称必填' });
    const category = await Category.create({ name, icon });
    res.json({ code: 0, msg: '创建成功', data: category });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 更新分类（管理员）
router.post('/update', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { id, name, icon } = req.body;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ code: 404, msg: '分类不存在' });
    await category.update({ name, icon });
    res.json({ code: 0, msg: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 删除分类（管理员）
router.post('/delete', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { id } = req.body;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ code: 404, msg: '分类不存在' });
    await category.destroy();
    res.json({ code: 0, msg: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

module.exports = router;