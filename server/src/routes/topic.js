const express = require('express');
const { Topic } = require('../models');

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

module.exports = router;