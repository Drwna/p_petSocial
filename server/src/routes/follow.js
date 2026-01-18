const express = require('express');
const { Follow, Pet } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 关注
router.post('/add', auth, async (req, res) => {
  try {
    const { petId } = req.body;

    // 不能关注自己
    if (req.petId === parseInt(petId)) {
      return res.status(400).json({
        code: 400,
        msg: '不能关注自己'
      });
    }

    // 检查宠物是否存在
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({
        code: 404,
        msg: '宠物不存在'
      });
    }

    // 检查是否已关注
    const existingFollow = await Follow.findOne({
      where: {
        followerPetId: req.petId,
        followingPetId: petId
      }
    });

    if (existingFollow) {
      return res.status(400).json({
        code: 400,
        msg: '已关注该宠物'
      });
    }

    // 创建关注记录
    await Follow.create({
      followerPetId: req.petId,
      followingPetId: petId
    });

    // 更新关注数和粉丝数
    await Pet.increment('followCount', { where: { id: req.petId } });
    await Pet.increment('fansCount', { where: { id: petId } });

    res.json({
      code: 0,
      msg: '关注成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '关注失败',
      error: error.message
    });
  }
});

// 取消关注
router.post('/remove', auth, async (req, res) => {
  try {
    const { petId } = req.body;

    // 检查是否已关注
    const follow = await Follow.findOne({
      where: {
        followerPetId: req.petId,
        followingPetId: petId
      }
    });

    if (!follow) {
      return res.status(400).json({
        code: 400,
        msg: '未关注该宠物'
      });
    }

    // 删除关注记录
    await follow.destroy();

    // 更新关注数和粉丝数
    await Pet.decrement('followCount', { where: { id: req.petId } });
    await Pet.decrement('fansCount', { where: { id: petId } });

    res.json({
      code: 0,
      msg: '已取消关注'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '取消关注失败',
      error: error.message
    });
  }
});

// 获取关注列表（我关注的）
router.get('/following', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (page - 1) * pageSize;

    const { rows: follows, count } = await Follow.findAndCountAll({
      where: { followerPetId: req.petId },
      include: [
        {
          model: Pet,
          as: 'following',
          attributes: ['id', 'petName', 'avatar']
        }
      ],
      order: [['createdTime', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset
    });

    const followingList = follows.map(follow => follow.following);

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: followingList,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取关注列表失败',
      error: error.message
    });
  }
});

// 获取粉丝列表（关注我的）
router.get('/fans', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (page - 1) * pageSize;

    const { rows: follows, count } = await Follow.findAndCountAll({
      where: { followingPetId: req.petId },
      include: [
        {
          model: Pet,
          as: 'follower',
          attributes: ['id', 'petName', 'avatar']
        }
      ],
      order: [['createdTime', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset
    });

    const fansList = follows.map(follow => follow.follower);

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: fansList,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取粉丝列表失败',
      error: error.message
    });
  }
});

// 判断是否已关注（宠物主页用）
router.get('/status', auth, async (req, res) => {
  try {
    const { petId } = req.query;

    const follow = await Follow.findOne({
      where: {
        followerPetId: req.petId,
        followingPetId: petId
      }
    });

    res.json({
      code: 0,
      msg: 'success',
      data: {
        isFollowing: !!follow
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取关注状态失败',
      error: error.message
    });
  }
});

module.exports = router;