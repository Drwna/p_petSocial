const express = require('express');
const { Post, Pet, Category, PostLike, Comment } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 发布帖子
router.post('/create', auth, async (req, res) => {
  try {
    // 解析表单数据
    const content = req.body.content;
    const images = req.body.images || [];
    const categoryId = parseInt(req.body.categoryId);

    if (!categoryId) {
      return res.status(400).json({
        code: 400,
        msg: '请选择一个分类'
      });
    }

    // 创建帖子
    await Post.create({
      petId: req.petId,
      content,
      images,
      categoryId
    });

    res.json({
      code: 0,
      msg: '发布成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '发布失败',
      error: error.message
    });
  }
});

// 删除帖子
router.post('/delete', auth, async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findOne({
      where: { id: postId, petId: req.petId }
    });

    if (!post) {
      return res.status(404).json({
        code: 404,
        msg: '帖子不存在或无权限删除'
      });
    }

    // 软删除
    await post.update({
      isDeleted: 1,
      deletedAt: new Date()
    });

    res.json({
      code: 0,
      msg: '删除成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '删除失败',
      error: error.message
    });
  }
});

// 获取帖子列表（首页）
router.get('/list', async (req, res) => {
  try {
    const { categoryId, page = 1, pageSize = 10 } = req.query;

    const offset = (page - 1) * pageSize;
    const where = { isDeleted: 0 };

    if (categoryId && categoryId !== 'undefined') {
      where.categoryId = categoryId;
    }

    const { rows: posts, count } = await Post.findAndCountAll({
      where,
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'petName', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createTime', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset
    });

    // 获取每个帖子的点赞数和评论数
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likeCount = await PostLike.count({ where: { postId: post.id } });
      const commentCount = await Comment.count({ where: { postId: post.id } });

      return {
        ...post.toJSON(),
        likeCount,
        commentCount
      };
    }));
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: postsWithCounts,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取帖子列表失败',
      error: error.message
    });
  }
});

// 获取帖子详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      where: { id, isDeleted: 0 },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'petName', 'petType', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        code: 404,
        msg: '帖子不存在'
      });
    }

    // 获取点赞数和评论数
    const likeCount = await PostLike.count({ where: { postId: post.id } });
    const commentCount = await Comment.count({ where: { postId: post.id } });

    // 检查当前宠物是否已点赞
    let liked = false;
    if (req.petId) {
      const postLike = await PostLike.findOne({
        where: { postId: post.id, petId: req.petId }
      });
      liked = !!postLike;
    }

    res.json({
      code: 0,
      msg: 'success',
      data: {
        ...post.toJSON(),
        likeCount,
        commentCount,
        liked
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取帖子详情失败',
      error: error.message
    });
  }
});

// 点赞 / 取消点赞
router.post('/like', auth, async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        code: 400,
        msg: '缺少必要参数 postId'
      });
    }

    // 检查帖子是否存在
    const post = await Post.findOne({ where: { id: postId, isDeleted: 0 } });
    if (!post) {
      return res.status(404).json({
        code: 404,
        msg: '帖子不存在'
      });
    }

    // 检查是否已点赞
    const existingLike = await PostLike.findOne({
      where: { postId, petId: req.petId }
    });

    if (existingLike) {
      // 已点赞，取消点赞
      await existingLike.destroy();
      res.json({
        code: 0,
        msg: '取消点赞成功'
      });
    } else {
      // 未点赞，点赞
      await PostLike.create({
        postId,
        petId: req.petId
      });
      res.json({
        code: 0,
        msg: '点赞成功'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '操作失败',
      error: error.message
    });
  }
});

module.exports = router;