const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Account, Merchant, Pet } = require('../models');

// POST /api/merchant/apply — 提交商家申请
router.post('/apply', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { petId: req.petId } });
    if (!account) return res.json({ code: 1, msg: '账号不存在' });

    const existing = await Merchant.findOne({ where: { accountId: account.id } });
    if (existing) {
      // pending 或 approved 状态不允许重复提交
      if (existing.status === 'pending' || existing.status === 'approved') {
        return res.json({ code: 0, msg: '已提交申请', data: existing });
      }
      // rejected 状态允许重新提交，更新记录
      const { businessName, contactPhone, address, description, licenseImage } = req.body;
      if (!businessName || !contactPhone || !address || !licenseImage) {
        return res.json({ code: 1, msg: '请填写完整信息' });
      }
      await existing.update({ businessName, contactPhone, address, description, licenseImage, status: 'pending', rejectReason: null });
      return res.json({ code: 0, msg: '申请已重新提交', data: existing });
    }

    const { businessName, contactPhone, address, description, licenseImage } = req.body;
    if (!businessName || !contactPhone || !address || !licenseImage) {
      return res.json({ code: 1, msg: '请填写完整信息' });
    }

    const merchant = await Merchant.create({
      accountId: account.id,
      businessName,
      contactPhone,
      address,
      description,
      licenseImage
    });

    res.json({ code: 0, msg: '申请已提交', data: merchant });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/merchant/my — 查询本账号申请状态
router.get('/my', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ where: { petId: req.petId } });
    if (!account) return res.json({ code: 1, msg: '账号不存在' });

    const merchant = await Merchant.findOne({ where: { accountId: account.id } });
    if (!merchant) return res.json({ code: 1, msg: '未申请商家' });

    res.json({ code: 0, data: merchant });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// GET /api/merchant/list — 管理员查商家列表
router.get('/list', auth, async (req, res) => {
  if (req.role !== 'admin') return res.json({ code: 403, msg: '无权操作' });

  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Merchant.findAndCountAll({
      where,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'email'],
          include: [{ model: Pet, as: 'pet', attributes: ['petName', 'avatar'] }]
        }
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

// POST /api/merchant/approve — 审核通过
router.post('/approve', auth, async (req, res) => {
  if (req.role !== 'admin') return res.json({ code: 403, msg: '无权操作' });

  try {
    const { merchantId } = req.body;
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) return res.json({ code: 1, msg: '商家不存在' });

    await merchant.update({ status: 'approved', rejectReason: null });
    await Account.update({ role: 'merchant' }, { where: { id: merchant.accountId } });

    res.json({ code: 0, msg: '审核通过' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

// POST /api/merchant/reject — 审核拒绝
router.post('/reject', auth, async (req, res) => {
  if (req.role !== 'admin') return res.json({ code: 403, msg: '无权操作' });

  try {
    const { merchantId, rejectReason } = req.body;
    if (!rejectReason) return res.json({ code: 1, msg: '请填写拒绝原因' });

    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) return res.json({ code: 1, msg: '商家不存在' });

    await merchant.update({ status: 'rejected', rejectReason });

    res.json({ code: 0, msg: '已拒绝' });
  } catch (error) {
    res.json({ code: 1, msg: error.message });
  }
});

module.exports = router;
