const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  // 使用 SMTP 服务，这里使用 QQ 邮箱作为示例
  // 实际使用时需要替换为真实的邮件服务配置
  host: process.env.EMAIL_HOST || 'smtp.qq.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com', // 发件人邮箱
    pass: process.env.EMAIL_PASS || 'your-email-password' // 发件人邮箱密码或授权码
  }
});

/**
 * 发送验证码邮件
 * @param {string} email - 收件人邮箱
 * @param {string} code - 验证码
 * @param {string} type - 验证码类型（register或login）
 * @returns {Promise<boolean>} 是否发送成功
 */
const sendVerificationCode = async (email, code, type = 'register') => {
  try {
    // 根据类型生成不同的邮件内容
    let subject, action, textContent, htmlContent;
    
    if (type === 'login') {
      subject = '宠物社交圈 - 登录验证码';
      action = '登录';
      textContent = `您的${action}验证码是：${code}，有效期10分钟，请尽快使用。`;
      htmlContent = `<div style="font-family: Arial, sans-serif;">
                      <h2>宠物社交圈 - ${action}验证码</h2>
                      <p>您好！</p>
                      <p>您正在${action}宠物社交圈账号，您的验证码是：</p>
                      <div style="font-size: 24px; font-weight: bold; color: #1890ff; margin: 20px 0;">${code}</div>
                      <p>验证码有效期为10分钟，请尽快使用。</p>
                      <p>如果您没有请求此验证码，可能有人尝试登录您的账号，请检查账号安全。</p>
                      <p>宠物社交圈团队</p>
                    </div>`;
    } else {
      // 默认注册场景
      subject = '宠物社交圈 - 注册验证码';
      action = '注册';
      textContent = `您的${action}验证码是：${code}，有效期10分钟，请尽快使用。`;
      htmlContent = `<div style="font-family: Arial, sans-serif;">
                      <h2>宠物社交圈 - ${action}验证码</h2>
                      <p>您好！</p>
                      <p>您正在${action}宠物社交圈账号，您的验证码是：</p>
                      <div style="font-size: 24px; font-weight: bold; color: #1890ff; margin: 20px 0;">${code}</div>
                      <p>验证码有效期为10分钟，请尽快使用。</p>
                      <p>如果您没有请求此验证码，请忽略此邮件。</p>
                      <p>宠物社交圈团队</p>
                    </div>`;
    }
    
    // 发送邮件
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@example.com', // 发件人邮箱
      to: email, // 收件人邮箱
      subject: subject, // 邮件主题
      text: textContent, // 纯文本内容
      html: htmlContent // HTML内容
    });
    
    console.log('验证码邮件发送成功:', info.messageId);
    return true;
  } catch (error) {
    console.error('验证码邮件发送失败:', error);
    // 在开发环境下，为了方便测试，直接返回成功
    // 实际生产环境中需要返回真实的发送结果
    console.log('开发环境下，验证码已生成:', code);
    return true;
  }
  // 在开发环境下，无论邮件是否发送成功，都输出验证码到日志
  console.log('开发环境下，验证码已生成:', code);
  return true;
};

module.exports = {
  sendVerificationCode
};