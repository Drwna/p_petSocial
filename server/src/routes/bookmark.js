const express = require('express');
const { Bookmark, Post, Pet, PostLike, Topic, Category, PostTopic } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

const router = express.Router();

// 收藏/取消收藏帖子
router.post('/toggle', auth, async (req, res) => {
  try {
    const { postId } = req.body;
    const petId = req.petId;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ code: 404, msg: '帖子不存在' });
    }

    const existingBookmark = await Bookmark.findOne({
      where: { petId, postId }
    });

    if (existingBookmark) {
      // 取消收藏
      await existingBookmark.destroy();
      res.json({ code: 0, msg: '已取消收藏', data: { bookmarked: false } });
    } else {
      // 添加收藏
      await Bookmark.create({ petId, postId });
      res.json({ code: 0, msg: '收藏成功', data: { bookmarked: true } });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '操作失败',
      error: error.message
    });
  }
});

// 获取我的收藏列表
router.get('/list', auth, async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const offset = (page - 1) * size;
    const petId = req.petId;

    const { rows: bookmarks, count } = await Bookmark.findAndCountAll({
      where: { petId },
      include: [
        {
          model: Post,
          as: 'post',
          where: { isDeleted: 0 },
          include: [
            { model: Pet, as: 'pet', attributes: ['id', 'petName', 'avatar'] },
            { model: Category, as: 'category', attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['createTime', 'DESC']],
      limit: parseInt(size),
      offset: offset
    });

    // 格式化数据，添加点赞、评论等状态
    const postIds = bookmarks.map(b => b.postId);

    // 获取话题
    let allTopics = [];
    if (postIds.length > 0) {
      const postsWithAllTopics = await Post.findAll({
        where: { id: { [Op.in]: postIds } },
        include: [{
          model: Topic,
          as: 'topics',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }]
      });
      
      postsWithAllTopics.forEach(post => {
        if (post.topics) {
          post.topics.forEach(topic => {
             allTopics.push({
                 postId: post.id,
                 Topic: topic
             });
          });
        }
      });
    }

    // 获取点赞和评论数量及状态
    let likes = [];
    if (postIds.length > 0) {
      likes = await PostLike.findAll({
        where: { postId: { [Op.in]: postIds }, petId }
      });
    }
    const likeMap = {};
    likes.forEach(like => {
      likeMap[like.postId] = true;
    });

    // 查询所有帖子的点赞数和评论数
    let likeCounts = [];
    let commentCounts = [];
    
    if (postIds.length > 0) {
      likeCounts = await PostLike.findAll({
        where: { postId: { [Op.in]: postIds } },
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['postId']
      });

      const Comment = sequelize.models.Comment;
      commentCounts = await Comment.findAll({
        where: { postId: { [Op.in]: postIds }, isDeleted: 0 },
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['postId']
      });
    }

    const resultList = bookmarks.map(bookmark => {
      const p = bookmark.post.toJSON();
      p.topics = allTopics.filter(pt => pt.postId === p.id).map(pt => pt.Topic);
      p.liked = !!likeMap[p.id];
      p.isBookmarked = true;
      
      const lCount = likeCounts.find(lc => lc.postId === p.id);
      p.likeCount = lCount ? parseInt(lCount.getDataValue('count')) : 0;
      
      const cCount = commentCounts.find(cc => cc.postId === p.id);
      p.commentCount = cCount ? parseInt(cCount.getDataValue('count')) : 0;

      return p;
    });

    res.json({
      code: 0,
      data: {
        list: resultList,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取收藏列表失败',
      error: error.message
    });
  }
});

module.exports = router;