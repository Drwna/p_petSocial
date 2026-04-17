const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Post, Pet, Category, PostLike, Comment, Follow, Topic, PostTopic, Bookmark } = require('../models');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// 发布帖子
router.post('/create', auth, async (req, res) => {
  try {
    // 解析表单数据
    const content = req.body.content;
    const images = req.body.images || [];
    const categoryId = parseInt(req.body.categoryId);
    const topicIds = req.body.topicIds || [];

    if (!categoryId) {
      return res.status(400).json({
        code: 400,
        msg: '请选择一个分类'
      });
    }

    // 创建帖子
    const post = await Post.create({
      petId: req.petId,
      content,
      images,
      categoryId
    });

    // 如果有关联话题，建立关联并增加话题的帖子数
    if (topicIds && topicIds.length > 0) {
      await post.setTopics(topicIds);
      await Topic.increment('postCount', { by: 1, where: { id: topicIds } });
    }

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

// 置顶/取消置顶帖子
router.post('/:id/pin', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { id } = req.params;
    const { isPinned } = req.body;
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ code: 404, msg: '帖子不存在' });
    }
    await post.update({ isPinned: isPinned ? 1 : 0 });
    res.json({ code: 0, msg: isPinned ? '置顶成功' : '已取消置顶' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 设置/取消精品帖子
router.post('/:id/feature', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无权操作' });
    }
    const { id } = req.params;
    const { isFeatured } = req.body;
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ code: 404, msg: '帖子不存在' });
    }
    await post.update({ isFeatured: isFeatured ? 1 : 0 });
    res.json({ code: 0, msg: isFeatured ? '已设为精品' : '已取消精品' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 获取帖子列表（首页）
router.get('/list', async (req, res) => {
  try {
    const { categoryId, topicId, keyword, page = 1, pageSize = 10 } = req.query;

    const offset = (page - 1) * pageSize;
    const where = { isDeleted: 0 };

    if (categoryId && categoryId !== 'undefined') {
      where.categoryId = categoryId;
    }
    
    // 构建 include 数组
    const includeOptions = [
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
    ];
    
    if (topicId && topicId !== 'undefined') {
      // 筛选包含特定话题的帖子
      includeOptions.push({
        model: Topic,
        as: 'topics',
        where: { id: topicId },
        through: { attributes: [] },
        attributes: ['id', 'name']
      });
      
      // 增加话题浏览量
      if (page == 1) {
        await Topic.increment('viewCount', { by: 1, where: { id: topicId } });
      }
    } else {
      // 不筛选特定话题时，正常包含所有话题
      includeOptions.push({
        model: Topic,
        as: 'topics',
        through: { attributes: [] },
        attributes: ['id', 'name']
      });
    }

    if (keyword && keyword.trim()) {
      where.content = {
        [Op.like]: `%${keyword.trim()}%`
      };
    }

    let orderOption = [
      ['isPinned', 'DESC'],
      ['createTime', 'DESC']
    ];
    if (req.query.isRecommend === '1') {
      // 推荐流：综合点赞数、评论数和精选状态排序，并结合时间，但置顶仍然优先
      orderOption = [
        ['isPinned', 'DESC'],
        [sequelize.literal('((SELECT COUNT(*) FROM post_like WHERE post_like.postId = `Post`.`id`) * 2 + (SELECT COUNT(*) FROM comment WHERE comment.postId = `Post`.`id` AND comment.isDeleted = 0) * 3 + `Post`.`isFeatured` * 10)'), 'DESC'],
        ['createTime', 'DESC']
      ];
    }

    const { rows: posts, count } = await Post.findAndCountAll({
      where,
      include: includeOptions,
      order: orderOption,
      limit: parseInt(pageSize),
      offset: offset,
      distinct: true // 当使用 include 且有一对多关系时，确保 count 准确
    });

    // 如果通过 topicId 筛选，为了让帖子显示完整的所有标签，需要再次查询（因为上面的 include where 限制了只返回匹配的那一个标签）
    if (topicId && topicId !== 'undefined' && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const postsWithAllTopics = await Post.findAll({
        where: { id: { [Op.in]: postIds } },
        include: [{
          model: Topic,
          as: 'topics',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }]
      });
      // 手动合并标签
      posts.forEach(post => {
        const fullPost = postsWithAllTopics.find(p => p.id === post.id);
        if (fullPost) {
          post.topics = fullPost.topics;
        }
      });
    }

    // 获取当前用户ID (如果已登录)
    let currentPetId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentPetId = decoded.petId;
      } catch (e) {
        // ignore
      }
    }

    // 获取每个帖子的点赞数、评论数、点赞状态和关注状态
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likeCount = await PostLike.count({ where: { postId: post.id } });
      const commentCount = await Comment.count({ where: { postId: post.id, isDeleted: 0 } });
      
      let liked = false;
      let isFollowing = false;
      let isBookmarked = false;

      if (currentPetId) {
        // 检查点赞状态
        const postLike = await PostLike.findOne({
          where: { postId: post.id, petId: currentPetId }
        });
        liked = !!postLike;

        // 检查关注状态 (不是自己)
        if (post.petId !== currentPetId) {
          const follow = await Follow.findOne({
            where: { followerPetId: currentPetId, followingPetId: post.petId }
          });
          isFollowing = !!follow;
        }

        // 检查收藏状态
        const bookmark = await Bookmark.findOne({
          where: { postId: post.id, petId: currentPetId }
        });
        isBookmarked = !!bookmark;
      }

      return {
        ...post.toJSON(),
        likeCount,
        commentCount,
        liked,
        isFollowing,
        isBookmarked
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
        },
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name'],
          through: { attributes: [] }
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
    const commentCount = await Comment.count({ where: { postId: post.id, isDeleted: 0 } });

    // 检查当前宠物是否已点赞（根据 token 解析当前用户，保持与列表接口一致的逻辑）
    let liked = false;
    let isBookmarked = false;
    let currentPetId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentPetId = decoded.petId;
      } catch (e) {
        // ignore token error
      }
    }

    if (currentPetId) {
      const postLike = await PostLike.findOne({
        where: { postId: post.id, petId: currentPetId }
      });
      liked = !!postLike;

      const bookmark = await Bookmark.findOne({
        where: { postId: post.id, petId: currentPetId }
      });
      isBookmarked = !!bookmark;
    }

    res.json({
      code: 0,
      msg: 'success',
      data: {
        ...post.toJSON(),
        likeCount,
        commentCount,
        liked,
        isBookmarked
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
