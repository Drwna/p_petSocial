<template>
  <view class="container">
    <view class="header">
      <text class="title">创建账号</text>
      <text class="subtitle">为你的宠物建立一个家</text>
    </view>
    
    <view class="form">
      <input class="input" v-model="form.email" placeholder="邮箱" />
      
      <view class="input-group">
        <input class="input captcha" v-model="form.code" placeholder="验证码" />
        <button class="btn-code" @click="handleSendCaptcha" :disabled="countdown > 0">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </view>

      <input class="input" v-model="form.petName" placeholder="宠物名称" />
      
      <picker :range="petTypes" @change="onTypeChange">
        <view class="input picker" :class="{ empty: !form.petType }">
          {{ form.petType ? form.petType : '选择宠物类型' }}
        </view>
      </picker>
      
      <picker mode="date" @change="onDateChange">
        <view class="input picker" :class="{ empty: !form.birthday }">
          {{ form.birthday ? form.birthday : '选择出生日期' }}
        </view>
      </picker>

      <picker :range="['公', '母']" @change="onGenderChange">
        <view class="input picker" :class="{ empty: form.gender === '' }">
          {{ form.gender !== '' ? (form.gender === '0' ? '公' : '母') : '选择性别' }}
        </view>
      </picker>

      <textarea class="input textarea" v-model="form.intro" placeholder="宠物简介（可选）" />
      
      <button class="btn-primary" @click="handleRegister" :loading="loading">注册</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { register, sendCaptcha } from '@/api/index';

const petTypes = ['狗', '猫', '鸟', '爬行动物', '其他'];
const loading = ref(false);
const countdown = ref(0);
const form = reactive({
  email: '',
  code: '',
  petName: '',
  petType: '',
  gender: '', // 0-男 1-女
  intro: ''
});

const onTypeChange = (e) => {
  form.petType = petTypes[e.detail.value];
};

const onDateChange = (e) => {
  form.birthday = e.detail.value;
};

const onGenderChange = (e) => {
  form.gender = e.detail.value.toString(); // 0 or 1
};

const handleSendCaptcha = async () => {
  if (!form.email) {
    uni.showToast({ title: '请填写邮箱', icon: 'none' });
    return;
  }
  
  try {
    await sendCaptcha({ email: form.email, type: 'register' });
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

const handleRegister = async () => {
  if (!form.email || !form.code || !form.petName || !form.petType || form.gender === '') {
    uni.showToast({ title: '请填写必填项', icon: 'none' });
    return;
  }
  
  loading.value = true;
  try {
    // 假设注册接口现在接受 captcha 而不是 password
    await register(form);
    uni.showToast({ title: '注册成功' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss">
.container {
  padding: 60rpx;
  min-height: 100vh;
  background-color: #fff;
}
.header {
  margin-top: 60rpx;
  margin-bottom: 60rpx;
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
    margin-bottom: 30rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    &.picker {
      color: #333;
      &.empty {
        color: #808080; 
      }
    }
    &.textarea {
      height: 200rpx;
      padding: 20rpx 40rpx;
      width: auto;
    }
  }
  .input-group {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    .input {
      margin-bottom: 0;
      flex: 1;
      &.captcha {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
    .btn-code {
      height: 100rpx;
      line-height: 100rpx;
      background-color: #71C5DA;
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
    box-shadow: 0 10rpx 20rpx rgba(113, 197, 218, 0.3);
  }
}
</style>
