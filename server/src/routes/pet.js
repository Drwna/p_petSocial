const express = require('express');
const { Pet, Post, Category, PostLike, Comment, BlockPet, Account } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取宠物主页信息
router.get('/profile', auth, async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.petId);

    if (!pet) {
      return res.status(404).json({
        code: 404,
        msg: '宠物不存在'
      });
    }

    // 获取账号信息（包含积分）
    const account = await Account.findOne({ where: { petId: pet.id } });

    // 获取帖子数量
    const postCount = await Post.count({ where: { petId: pet.id, isDeleted: 0 } });

    res.json({
      code: 0,
      data: {
        pet,
        postCount,
        points: account ? account.points : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取宠物主页信息失败',
      error: error.message
    });
  }
});

// 获取宠物发布的帖子
// 改为这种数据类型
// "pet": {
//                     "id": 3,
//                     "petName": "小白--momo",
//                     "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaolong.work@outlook.com"
//                 },
//                 "category": {
//                     "id": 3,
//                     "name": "成长记录"
//                 },
router.get('/posts', auth, async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;

    const pet = await Pet.findByPk(req.petId);

    const petId = pet.id;

    if (!petId) {
      return res.status(400).json({
        code: 400,
        msg: '缺少petId参数'
      });
    }

    const offset = (page - 1) * size;

    const { rows: posts, count } = await Post.findAndCountAll({
      where: { petId, isDeleted: 0 },
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
      limit: parseInt(size),
      offset: offset
    });

    // 获取每个帖子的点赞数和评论数
    const merchantAccount = await Account.findOne({ where: { petId, role: 'merchant' }, attributes: ['petId'] });
    const isMerchant = !!merchantAccount;
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likeCount = await PostLike.count({ where: { postId: post.id } });
      const commentCount = await Comment.count({ where: { postId: post.id, isDeleted: 0 } });

      return {
        ...post.toJSON(),
        likeCount,
        commentCount,
        pet: post.pet ? { ...post.pet.toJSON(), isMerchant } : null
      };
    }));

    res.json({
      code: 0,
      data: {
        list: postsWithCounts,
        page: parseInt(page),
        size: parseInt(size),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取宠物帖子失败',
      error: error.message
    });
  }
});

// 编辑当前宠物信息
router.post('/update', auth, async (req, res) => {
  try {
    const { intro, birthday, petName, petType, avatar, gender } = req.body;

    const pet = await Pet.findByPk(req.petId);

    if (!pet) {
      return res.status(404).json({
        code: 404,
        msg: '宠物不存在'
      });
    }

    // 更新宠物信息
    await pet.update({
      intro: intro || pet.intro,
      birthday: birthday || pet.birthday,
      petName: petName || pet.petName,
      petType: petType || pet.petType,
      avatar: avatar || pet.avatar,
      gender: gender || pet.gender
    });

    res.json({
      code: 0,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '更新宠物信息失败',
      error: error.message
    });
  }
});

// 获取指定宠物主页信息
router.get('/profile/:petId', async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findByPk(petId);

    if (!pet) {
      return res.status(404).json({
        code: 404,
        msg: '宠物不存在'
      });
    }

    // 获取帖子数量
    const postCount = await Post.count({ where: { petId: pet.id, isDeleted: 0 } });
    const merchantAccount = await Account.findOne({ where: { petId: pet.id, role: 'merchant' }, attributes: ['petId'] });

    res.json({
      code: 0,
      data: {
        pet: { ...pet.toJSON(), isMerchant: !!merchantAccount },
        postCount
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取宠物主页信息失败',
      error: error.message
    });
  }
});

// 获取指定宠物发布的帖子
router.get('/:petId/posts', async (req, res) => {
  try {
    const { petId } = req.params;
    const { page = 1, size = 10 } = req.query;

    // 检查宠物是否存在
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({
        code: 404,
        msg: '宠物不存在'
      });
    }

    const offset = (page - 1) * size;

    const { rows: posts, count } = await Post.findAndCountAll({
      where: { petId, isDeleted: 0 },
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
      limit: parseInt(size),
      offset: offset
    });

    // 获取每个帖子的点赞数和评论数
    const merchantAccount = await Account.findOne({ where: { petId, role: 'merchant' }, attributes: ['petId'] });
    const isMerchant = !!merchantAccount;
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const likeCount = await PostLike.count({ where: { postId: post.id } });
      const commentCount = await Comment.count({ where: { postId: post.id, isDeleted: 0 } });

      return {
        ...post.toJSON(),
        likeCount,
        commentCount,
        pet: post.pet ? { ...post.pet.toJSON(), isMerchant } : null
      };
    }));

    res.json({
      code: 0,
      data: {
        list: postsWithCounts,
        page: parseInt(page),
        size: parseInt(size),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取宠物帖子失败',
      error: error.message
    });
  }
});

// 封装 dataDB 百科搜索服务
router.get('/search', auth, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        code: 400,
        msg: '请提供搜索名称'
      });
    }

    // 调用本地 dataDB 的搜索接口
    const response = await fetch(`http://localhost:3005/api/pets/search?name=${encodeURIComponent(name)}`);
    const result = await response.json();

    if (result.success) {
      res.json({
        code: 0,
        data: result.data
      });
    } else {
      res.status(500).json({
        code: 500,
        msg: result.message || '搜索失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '请求百科搜索服务异常',
      error: error.message
    });
  }
});

// 屏蔽作者
router.post('/block', auth, async (req, res) => {
  try {
    const { blockedPetId } = req.body;
    if (!blockedPetId) {
      return res.status(400).json({ code: 400, msg: '缺少blockedPetId' });
    }

    if (blockedPetId === req.petId) {
      return res.status(400).json({ code: 400, msg: '不能屏蔽自己' });
    }

    await BlockPet.findOrCreate({
      where: { blockerPetId: req.petId, blockedPetId }
    });

    res.json({ code: 0, msg: '已屏蔽该作者' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

// 获取屏蔽列表
router.get('/block/list', auth, async (req, res) => {
  try {
    const blocks = await BlockPet.findAll({
      where: { blockerPetId: req.petId },
      include: [{
        model: Pet,
        as: 'blocked',
        attributes: ['id', 'petName', 'avatar']
      }]
    });

    res.json({
      code: 0,
      data: blocks.map(b => b.blocked)
    });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '获取列表失败', error: error.message });
  }
});

// 取消屏蔽
router.post('/unblock', auth, async (req, res) => {
  try {
    const { blockedPetId } = req.body;
    if (!blockedPetId) {
      return res.status(400).json({ code: 400, msg: '缺少blockedPetId' });
    }

    await BlockPet.destroy({
      where: { blockerPetId: req.petId, blockedPetId }
    });

    res.json({ code: 0, msg: '已取消屏蔽' });
  } catch (error) {
    res.status(500).json({ code: 500, msg: '操作失败', error: error.message });
  }
});

module.exports = router;