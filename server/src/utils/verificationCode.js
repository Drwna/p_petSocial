// 验证码存储服务
const { Sequelize } = require('sequelize');
const { VerificationCode } = require('../models');

// 验证码有效期（分钟）
const CODE_EXPIRE_TIME = 10;

/**
 * 生成6位随机验证码
 */
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 清理过期验证码
 */
const cleanupExpiredCodes = async () => {
  try {
    await VerificationCode.destroy({
      where: {
        expireTime: { [Sequelize.Op.lt]: new Date() }
      }
    });
  } catch (error) {
    console.error('清理过期验证码失败:', error);
  }
};

/**
 * 存储验证码到数据库
 * @param {string} email - 邮箱
 * @returns {Promise<string>} 生成的验证码
 */
const storeCode = async (email) => {
  const code = generateCode();
  const expireTime = new Date(Date.now() + CODE_EXPIRE_TIME * 60 * 1000);
  
  try {
    // 先清理该邮箱的所有旧验证码
    await VerificationCode.destroy({
      where: { email }
    });
    
    // 存储新验证码
    await VerificationCode.create({
      email,
      code,
      expireTime
    });
    
    // 清理所有过期验证码
    await cleanupExpiredCodes();
    
    return code;
  } catch (error) {
    console.error('存储验证码失败:', error);
    throw error;
  }
};

/**
 * 验证验证码
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @returns {Promise<boolean>} 是否验证通过
 */
const verifyCode = async (email, code) => {
  try {
    // 查找有效的验证码
    const verificationCode = await VerificationCode.findOne({
      where: {
        email,
        code,
        expireTime: { [Sequelize.Op.gt]: new Date() },
        isUsed: 0
      }
    });
    
    if (!verificationCode) {
      return false;
    }
    
    // 标记为已使用
    await verificationCode.update({
      isUsed: 1
    });
    
    // 清理过期验证码
    await cleanupExpiredCodes();
    
    return true;
  } catch (error) {
    console.error('验证验证码失败:', error);
    return false;
  }
};

/**
 * 删除验证码
 * @param {string} email - 邮箱
 */
const deleteCode = async (email) => {
  try {
    await VerificationCode.destroy({
      where: { email }
    });
  } catch (error) {
    console.error('删除验证码失败:', error);
  }
};

module.exports = {
  generateCode,
  storeCode,
  verifyCode,
  deleteCode
};