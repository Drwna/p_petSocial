const express = require('express');
const { Category } = require('../models');

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

module.exports = router;