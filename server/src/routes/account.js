const express = require('express');
const jwt = require('jsonwebtoken');
const { Account, Pet } = require('../models');
const auth = require('../middleware/auth');
const { storeCode, verifyCode } = require('../utils/verificationCode');
const { sendVerificationCode } = require('../utils/emailService');
require('dotenv').config();

const router = express.Router();

// 发送验证码（支持注册和登录场景）
router.post('/send-code', async (req, res) => {
  try {
    const { email, type = 'register' } = req.body;

    // 检查邮箱
    const existingAccount = await Account.findOne({ where: { email } });
    
    // 根据类型执行不同的逻辑
    if (!type || type === 'register') {
      // 注册场景：邮箱不能已存在
      if (existingAccount) {
        return res.status(400).json({
          code: 400,
          msg: '邮箱已被注册'
        });
      }
    } else if (type === 'login') {
      // 登录场景：邮箱必须已存在
      if (!existingAccount) {
        return res.status(400).json({
          code: 400,
          msg: '邮箱未注册'
        });
      }
    } else {
      return res.status(400).json({
        code: 400,
        msg: '无效的验证码类型'
      });
    }

    // 生成并存储验证码
    const code = await storeCode(email);

    // 发送验证码邮件
    const sendResult = await sendVerificationCode(email, code, type);
    
    if (!sendResult) {
      return res.status(500).json({
        code: 500,
        msg: '验证码发送失败'
      });
    }

    res.json({
      code: 0,
      msg: '验证码发送成功',
      data: {
        email
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '发送验证码失败',
      error: error.message
    });
  }
});

// 邮箱验证码登录
router.post('/login-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // 检查验证码
    const codeValid = await verifyCode(email, code);
    if (!codeValid) {
      return res.status(400).json({
        code: 400,
        msg: '验证码无效或已过期'
      });
    }

    // 检查账号是否存在
    const account = await Account.findOne({ 
      where: { email },
      include: [{ model: Pet, as: 'pet' }]
    });
    if (!account) {
      return res.status(400).json({
        code: 400,
        msg: '邮箱未注册'
      });
    }

    // 生成token
    const token = jwt.sign(
      { petId: account.petId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        pet: {
          id: account.pet.id,
          petName: account.pet.petName,
          avatar: account.pet.avatar
        },
        role: account.role
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '登录失败',
      error: error.message
    });
  }
});

// 邮箱注册宠物账号（无需密码）
router.post('/register', async (req, res) => {
  try {
    const { email, code, petName, petType, gender, avatar, intro, birthday } = req.body;

    // 检查验证码
    const codeValid = await verifyCode(email, code);
    if (!codeValid) {
      return res.status(400).json({
        code: 400,
        msg: '验证码无效或已过期'
      });
    }

    // 检查邮箱是否已存在
    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount) {
      return res.status(400).json({
        code: 400,
        msg: '邮箱已被注册'
      });
    }

    // 创建宠物
    const pet = await Pet.create({
      petName,
      petType, // 宠物类型: 0-狗, 1-猫, 2-鸟, 3-爬行动物, 4-其他
      gender, // 性别: 0-男, 1-女
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      intro,
      birthday
    });

    // 创建账号（无需密码）
    await Account.create({
      email,
      petId: pet.id
    });

    res.status(201).json({
      code: 0,
      msg: '注册成功',
      data: {
        petId: pet.id
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '注册失败',
      error: error.message
    });
  }
});

// 邮箱登录功能已移除，仅支持验证码登录
// router.post('/login', async (req, res) => {
//   res.status(400).json({
//     code: 400,
//     msg: '已移除密码登录功能，请使用验证码登录'
//   });
// });

// 获取当前宠物信息
router.get('/current', auth, async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.petId);
    
    if (!pet) {
      return res.status(404).json({
        code: 404,
        msg: '宠物不存在'
      });
    }

    // 获取关联的账号信息（邮箱）
    const account = await Account.findOne({ where: { petId: req.petId } });

    res.json({
      code: 0,
      data: {
        ...pet.toJSON(),
        email: account ? account.email : ''
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取信息失败',
      error: error.message
    });
  }
});

module.exports = router;