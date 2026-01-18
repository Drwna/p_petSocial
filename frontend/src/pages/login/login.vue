<template>
  <view class="container">
    <view class="header">
      <text class="title">欢迎回来</text>
      <text class="subtitle">使用验证码登录你的宠物账号</text>
    </view>
    
    <view class="form">
      <input class="input" type="text" v-model="email" placeholder="请输入邮箱" />
      
      <view class="input-group">
        <input class="input captcha" type="text" v-model="captcha" placeholder="请输入验证码" />
        <button class="btn-code" @click="handleSendCaptcha" :disabled="countdown > 0">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </view>
      
      <button class="btn-primary" @click="handleLogin" :loading="loading">登录</button>
      
      <view class="links">
        <text class="link-text" @click="goToRegister">没有账号？去注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { login, sendCaptcha } from '@/api/index';

const email = ref('');
const captcha = ref('');
const loading = ref(false);
const countdown = ref(0);

const handleSendCaptcha = async () => {
  if (!email.value) {
    uni.showToast({ title: '请填写邮箱', icon: 'none' });
    return;
  }
  
  try {
    await sendCaptcha({ email: email.value, type: 'login' });
    uni.showToast({ title: '验证码已发送' });
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e) {
    console.error(e);
  }
};

const handleLogin = async () => {
  if (!email.value || !captcha.value) {
    uni.showToast({ title: '请填写完整', icon: 'none' });
    return;
  }
  
  loading.value = true;
  try {
    const res = await login({ email: email.value, code: captcha.value });
    // 保存 token
    uni.setStorageSync('token', res.data.token);
    // 保存用户信息
    uni.setStorageSync('userInfo', res.data.pet);
    
    // 保存到多账号列表
    let accounts = uni.getStorageSync('accounts') || [];
    accounts = accounts.filter(a => a.email !== email.value);
    accounts.push({ 
        email: email.value, 
        token: res.data.token, 
        pet: res.data.pet,
        lastLogin: Date.now()
    });
    uni.setStorageSync('accounts', accounts);
    
    uni.showToast({ title: '登录成功' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 1500);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' });
};
</script>

<style lang="scss">
.container {
  padding: 60rpx;
  min-height: 100vh;
  background-color: #fff;
}
.header {
  margin-top: 100rpx;
  margin-bottom: 80rpx;
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
  }
  .subtitle {
    font-size: 28rpx;
    color: #999;
  }
}
.form {
  .input {
    background-color: #f8f8f8;
    height: 100rpx;
    border-radius: 50rpx;
    padding: 0 40rpx;
    margin-bottom: 40rpx;
    font-size: 28rpx;
    flex: 1;
  }
  .input-group {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    .captcha {
      margin-bottom: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .btn-code {
      height: 100rpx;
      line-height: 100rpx;
      background-color: #FF9800;
      color: #fff;
      font-size: 28rpx;
      border-radius: 0 50rpx 50rpx 0;
      padding: 0 30rpx;
      min-width: 200rpx;
      &[disabled] {
        background-color: #ccc;
      }
    }
  }
  .btn-primary {
    margin-top: 60rpx;
    height: 100rpx;
    line-height: 100rpx;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 10rpx 20rpx rgba(255, 152, 0, 0.3);
  }
  .links {
    margin-top: 40rpx;
    text-align: center;
    .link-text {
      color: #FF9800;
      font-size: 28rpx;
    }
  }
}
</style>
