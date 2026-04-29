const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const auth = require('../middleware/auth');
const { Account, Merchant, Activity, ActivityParticipant } = require('../models');

// 获取商家信息
const getMerchant = async (petId) => {
  const account = await Account.findOne({ where: { petId } });
  if (!account) return null;
  return Merchant.findOne({ where: { accountId: account.id, status: 'approved' } });
};

// GET /api/activity/list — 活动列表（公开，只显示已审核通过的）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const { count, rows } = await Activity.findAndCountAll({
      where: { status: 'active' },
      include: [{ model: Merchant, as: 'merchant', attributes: ['id', 'businessName'] }],
      order: [['startTime', 'ASC']],
      offset: (page - 1) * pageSize,
      limit: Number(pageSize)
    });

    res.json({ code: 0, data: { total: count, list: rows } });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/activity/my-joined — 用户已参与的活动
router.get('/my-joined', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { petId: req.petId } });
    if (!account) return res.json({ code: 1, msg: '账号不存在' });

    const participations = await ActivityParticipant.findAll({
      where: { accountId: account.id },
      include: [
        {
          model: Activity,
          as: 'activity',
          include: [{ model: Merchant, as: 'merchant', attributes: ['id', 'businessName'] }]
        }
      ],
      order: [['joinTime', 'DESC']]
    });

    res.json({ code: 0, data: participations.map(p => p.activity).filter(Boolean) });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/activity/my — 商家自己的活动
router.get('/my', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { page = 1, pageSize = 10 } = req.query;
    const { count, rows } = await Activity.findAndCountAll({
      where: { merchantId: merchant.id },
      order: [['createTime', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: Number(pageSize)
    });

    res.json({ code: 0, data: { total: count, list: rows } });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/create — 商家创建活动
router.post('/create', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { title, description, location, startTime, endTime, maxParticipants } = req.body;
    if (!title || !location || !startTime || !endTime) {
      return res.json({ code: 1, msg: '请填写完整信息' });
    }

    const activity = await Activity.create({
      merchantId: merchant.id,
      title,
      description,
      location,
      startTime,
      endTime,
      maxParticipants: maxParticipants || null
    });

    res.json({ code: 0, msg: '创建成功', data: activity });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/update — 商家修改活动
router.post('/update', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { activityId, title, description, location, startTime, endTime, maxParticipants } = req.body;
    const activity = await Activity.findOne({ where: { id: activityId, merchantId: merchant.id } });
    if (!activity) return res.json({ code: 1, msg: '活动不存在或无权操作' });

    await activity.update({ title, description, location, startTime, endTime, maxParticipants });

    res.json({ code: 0, msg: '更新成功', data: activity });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/cancel — 商家取消活动
router.post('/cancel', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { activityId } = req.body;
    const activity = await Activity.findOne({ where: { id: activityId, merchantId: merchant.id } });
    if (!activity) return res.json({ code: 1, msg: '活动不存在或无权操作' });

    await activity.update({ status: 'cancelled' });

    res.json({ code: 0, msg: '活动已取消' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/join — 用户报名（事务）
router.post('/join', auth, async (req, res) => {
  try {
    const { activityId } = req.body;
    if (!activityId) return res.json({ code: 1, msg: '请选择活动' });

    await sequelize.transaction(async (t) => {
      const activity = await Activity.findOne({
        where: { id: activityId, status: 'active' },
        lock: t.LOCK.UPDATE,
        transaction: t
      });
      if (!activity) throw new Error('活动不存在或已结束');

      if (activity.maxParticipants !== null &&
          activity.currentParticipants >= activity.maxParticipants) {
        throw new Error('活动人数已满');
      }

      const account = await Account.findOne({ where: { petId: req.petId }, transaction: t });
      if (!account) throw new Error('账号不存在');

      const existing = await ActivityParticipant.findOne({
        where: { activityId, accountId: account.id },
        transaction: t
      });
      if (existing) throw new Error('已报名该活动');

      await ActivityParticipant.create({ activityId, accountId: account.id }, { transaction: t });
      await activity.increment('currentParticipants', { by: 1, transaction: t });
    });

    res.json({ code: 0, msg: '报名成功' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/leave — 用户取消报名
router.post('/leave', auth, async (req, res) => {
  try {
    const { activityId } = req.body;

    await sequelize.transaction(async (t) => {
      const account = await Account.findOne({ where: { petId: req.petId }, transaction: t });
      if (!account) throw new Error('账号不存在');

      const participant = await ActivityParticipant.findOne({
        where: { activityId, accountId: account.id },
        transaction: t
      });
      if (!participant) throw new Error('未报名该活动');

      await participant.destroy({ transaction: t });
      await Activity.decrement('currentParticipants', { by: 1, where: { id: activityId }, transaction: t });
    });

    res.json({ code: 0, msg: '已取消报名' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/activity/admin-list — 管理员查活动列表
router.get('/admin-list', auth, async (req, res) => {
  if (req.role !== 'admin') return res.json({ code: 403, msg: '无权操作' });

  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Activity.findAndCountAll({
      where,
      include: [{ model: Merchant, as: 'merchant', attributes: ['id', 'businessName'] }],
      order: [['createTime', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: Number(pageSize)
    });

    res.json({ code: 0, data: { total: count, list: rows } });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/approve — 管理员审核通过
router.post('/approve', auth, async (req, res) => {
  if (req.role !== 'admin') return res.json({ code: 403, msg: '无权操作' });

  try {
    const { activityId } = req.body;
    const activity = await Activity.findByPk(activityId);
    if (!activity) return res.json({ code: 1, msg: '活动不存在' });

    await activity.update({ status: 'active', rejectReason: null });
    res.json({ code: 0, msg: '已通过' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/activity/reject — 管理员拒绝
router.post('/reject', auth, async (req, res) => {
  if (req.role !== 'admin') return res.json({ code: 403, msg: '无权操作' });

  try {
    const { activityId, rejectReason } = req.body;
    if (!rejectReason) return res.json({ code: 1, msg: '请填写拒绝原因' });

    const activity = await Activity.findByPk(activityId);
    if (!activity) return res.json({ code: 1, msg: '活动不存在' });

    await activity.update({ status: 'rejected', rejectReason });
    res.json({ code: 0, msg: '已拒绝' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/activity/:id — 活动详情（公开）— 必须放在所有具体路由之后
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [
        { model: Merchant, as: 'merchant', attributes: ['id', 'businessName', 'address', 'contactPhone'] }
      ]
    });
    if (!activity) return res.json({ code: 1, msg: '活动不存在' });

    // 若有 token，检查是否已参与
    let hasJoined = false;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const account = await Account.findOne({ where: { petId: decoded.petId } });
        if (account) {
          const p = await ActivityParticipant.findOne({
            where: { activityId: activity.id, accountId: account.id }
          });
          hasJoined = !!p;
        }
      } catch (_) {}
    }

    res.json({ code: 0, data: { ...activity.toJSON(), hasJoined } });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

module.exports = router;
