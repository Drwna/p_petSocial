const express = require('express');
const { PointLog, Account } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// 获取积分记录（只支持近三个月）
router.get('/logs', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { petId: req.petId } });
    if (!account) {
      return res.status(404).json({
        code: 404,
        msg: '未找到账户信息'
      });
    }

    // 计算三个月前的时间
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const logs = await PointLog.findAll({
      where: {
        accountId: account.id,
        createTime: {
          [Op.gte]: threeMonthsAgo
        }
      },
      order: [['createTime', 'DESC']]
    });

    res.json({
      code: 0,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '获取积分记录失败',
      error: error.message
    });
  }
});

module.exports = router;
