const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const auth = require('../middleware/auth');
const { Account, Merchant, Gift, GiftRedemption, PointLog, Pet } = require('../models');

// 获取商家信息（通过 petId）
const getMerchant = async (petId) => {
  const account = await Account.findOne({ where: { petId } });
  if (!account) return null;
  return Merchant.findOne({ where: { accountId: account.id, status: 'approved' } });
};

// GET /api/gift/list — 积分商城列表（公开）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, merchantId } = req.query;
    const where = { isActive: 1, stock: { [Op.gt]: 0 } };
    if (merchantId) where.merchantId = merchantId;

    const { count, rows } = await Gift.findAndCountAll({
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

// GET /api/gift/my-redemptions — 用户自己的兑换记录
router.get('/my-redemptions', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { petId: req.petId } });
    if (!account) return res.json({ code: 1, msg: '账号不存在' });

    const list = await GiftRedemption.findAll({
      where: { accountId: account.id },
      include: [{ model: Gift, as: 'gift', attributes: ['id', 'name', 'image', 'pointCost'] }],
      order: [['createTime', 'DESC']]
    });

    res.json({ code: 0, data: list });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/gift/merchant-orders — 商家查订单
router.get('/merchant-orders', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { status, page = 1, pageSize = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await GiftRedemption.findAndCountAll({
      where,
      include: [
        { model: Gift, as: 'gift', where: { merchantId: merchant.id }, attributes: ['id', 'name'], required: true },
        { model: Account, as: 'account', attributes: ['id', 'email'] }
      ],
      order: [['createTime', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: Number(pageSize)
    });

    res.json({ code: 0, data: { total: count, list: rows } });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/gift/my — 商家自己的礼品
router.get('/my', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { page = 1, pageSize = 10 } = req.query;
    const { count, rows } = await Gift.findAndCountAll({
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

// GET /api/gift/:id — 礼品详情（公开）
router.get('/:id', async (req, res) => {
  try {
    const gift = await Gift.findByPk(req.params.id, {
      include: [{ model: Merchant, as: 'merchant', attributes: ['id', 'businessName', 'address'] }]
    });
    if (!gift) return res.json({ code: 1, msg: '礼品不存在' });

    res.json({ code: 0, data: gift });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/gift/create — 商家创建礼品
router.post('/create', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { name, description, image, pointCost, stock } = req.body;
    if (!name || !pointCost || stock === undefined) {
      return res.json({ code: 1, msg: '请填写完整信息' });
    }

    const gift = await Gift.create({
      merchantId: merchant.id,
      name,
      description,
      image,
      pointCost,
      stock
    });

    res.json({ code: 0, msg: '创建成功', data: gift });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/gift/update — 商家修改礼品
router.post('/update', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { giftId, name, description, image, pointCost, stock, isActive } = req.body;
    const gift = await Gift.findOne({ where: { id: giftId, merchantId: merchant.id } });
    if (!gift) return res.json({ code: 1, msg: '礼品不存在或无权操作' });

    await gift.update({ name, description, image, pointCost, stock, isActive });

    res.json({ code: 0, msg: '更新成功', data: gift });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/gift/ship — 商家标记已发货
router.post('/ship', auth, async (req, res) => {
  if (req.role !== 'merchant') return res.json({ code: 403, msg: '需要商家权限' });

  try {
    const merchant = await getMerchant(req.petId);
    if (!merchant) return res.json({ code: 1, msg: '商家信息不存在' });

    const { redemptionId } = req.body;
    const redemption = await GiftRedemption.findByPk(redemptionId, {
      include: [{ model: Gift, as: 'gift', where: { merchantId: merchant.id } }]
    });
    if (!redemption) return res.json({ code: 1, msg: '订单不存在或无权操作' });

    await redemption.update({ status: 'shipped' });

    res.json({ code: 0, msg: '已标记发货' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/gift/redeem — 用户兑换礼品（事务）
router.post('/redeem', auth, async (req, res) => {
  try {
    const { giftId, address } = req.body;
    if (!giftId) return res.json({ code: 1, msg: '请选择礼品' });

    const result = await sequelize.transaction(async (t) => {
      const gift = await Gift.findOne({
        where: { id: giftId, isActive: 1, stock: { [Op.gt]: 0 } },
        lock: t.LOCK.UPDATE,
        transaction: t
      });
      if (!gift) throw new Error('礼品不存在或已售罄');

      const account = await Account.findOne({
        where: { petId: req.petId },
        lock: t.LOCK.UPDATE,
        transaction: t
      });
      if (!account) throw new Error('账号不存在');
      if (account.points < gift.pointCost) throw new Error('积分不足');

      await account.decrement('points', { by: gift.pointCost, transaction: t });
      await gift.decrement('stock', { by: 1, transaction: t });

      const redemption = await GiftRedemption.create({
        giftId: gift.id,
        accountId: account.id,
        pointCost: gift.pointCost,
        address
      }, { transaction: t });

      await PointLog.create({
        accountId: account.id,
        type: 'gift_redeemed',
        amount: -gift.pointCost,
        refId: redemption.id
      }, { transaction: t });

      return redemption;
    });

    res.json({ code: 0, msg: '兑换成功', data: result });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

module.exports = router;
