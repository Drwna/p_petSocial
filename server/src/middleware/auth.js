const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        code: 401,
        msg: '请先登录'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.petId = decoded.petId;
    
    const { Account } = require('../models');
    const account = await Account.findOne({ where: { petId: req.petId } });
    req.role = account ? account.role : 'user';

    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      msg: 'token无效'
    });
  }
};

module.exports = auth;