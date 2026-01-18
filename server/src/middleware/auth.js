const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
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
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      msg: 'token无效'
    });
  }
};

module.exports = auth;