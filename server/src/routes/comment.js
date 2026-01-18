const express = require('express');
const { Comment, Post, Pet } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 评论帖子
router.post('/create', auth, async (req, res) => {
  try {
    const { postId, content } = req.body;
    
    // 检查帖子是否存在
    const post = await Post.findOne({ where: { id: postId, isDeleted: 0 } });
    if (!post) {
      return res.status(404).json({
        code: 404,
        msg: '帖子不存在'
      });
    }

    await Comment.create({
      postId,
      petId: req.petId,
      content
    });

    res.json({
      code: 0,
      msg: '评论成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '评论失败',
      error: error.message
    });
  }
});

// 获取评论列表
router.get('/list', async (req, res) => {
  try {
    const { postId } = req.query;
    
    if (!postId) {
      return res.status(400).json({
        code: 400,
        msg: '缺少postId参数'
      });
    }

    const comments = await Comment.findAll({
      where: { postId },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'petName', 'avatar']
        }
      ],
      order: [['createTime', 'DESC']]
    });

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: comments
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取评论列表失败',
      error: error.message
    });
  }
});

module.exports = router;