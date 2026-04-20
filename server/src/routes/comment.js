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
    const { postId, page = 1, size = 10 } = req.query;
    
    if (!postId) {
      return res.status(400).json({
        code: 400,
        msg: '缺少postId参数'
      });
    }

    const offset = (page - 1) * size;

    const { rows: comments, count } = await Comment.findAndCountAll({
      where: { postId, isDeleted: 0 },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'petName', 'avatar']
        }
      ],
      order: [['createTime', 'DESC']],
      limit: parseInt(size),
      offset: parseInt(offset)
    });

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: comments,
        total: count,
        page: parseInt(page),
        size: parseInt(size)
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

// 获取所有评论（管理员）
router.get('/list-all', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { page = 1, size = 10 } = req.query;
    const offset = (page - 1) * size;

    const { rows: comments, count } = await Comment.findAndCountAll({
      where: { isDeleted: 0 },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'petName', 'avatar']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'content']
        }
      ],
      order: [['createTime', 'DESC']],
      limit: parseInt(size),
      offset: parseInt(offset)
    });

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: comments,
        total: count,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '获取评论列表失败', error: error.message });
  }
});

// 删除评论
router.post('/delete', auth, async (req, res) => {
  try {
    const { commentId } = req.body;
    
    if (!commentId) {
      return res.status(400).json({
        code: 400,
        msg: '缺少commentId参数'
      });
    }

    // 检查评论是否存在
    const comment = await Comment.findOne({
      where: { id: commentId, isDeleted: 0 },
      include: [{ model: Post, as: 'post', attributes: ['id', 'petId'] }]
    });
    
    if (!comment) {
      return res.status(404).json({
        code: 404,
        msg: '评论不存在'
      });
    }

    // 检查权限：要么是管理员，要么是评论作者，要么是帖子作者
    const isAdmin = req.role === 'admin';
    const isCommentAuthor = comment.petId === req.petId;
    const isPostAuthor = comment.post.petId === req.petId;
    
    if (!isAdmin && !isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        code: 403,
        msg: '无权删除该评论'
      });
    }

    // 执行软删除
    await comment.update({
      isDeleted: 1,
      deletedAt: new Date()
    });

    res.json({
      code: 0,
      msg: '删除评论成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '删除评论失败',
      error: error.message
    });
  }
});

module.exports = router;