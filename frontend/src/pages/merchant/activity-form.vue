<template>
  <view class="container">
    <view class="form-item">
      <text class="label">活动标题</text>
      <input class="input" v-model="form.title" placeholder="请输入活动标题" />
    </view>
    <view class="form-item">
      <text class="label">活动地点</text>
      <input class="input" v-model="form.location" placeholder="请输入活动地点" />
    </view>
    <view class="form-item">
      <text class="label">开始时间</text>
      <picker mode="date" :value="form.startDate" @change="onStartDateChange">
        <view class="picker-val">{{ form.startDate || '请选择日期' }}</view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">结束时间</text>
      <picker mode="date" :value="form.endDate" @change="onEndDateChange">
        <view class="picker-val">{{ form.endDate || '请选择日期' }}</view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">人数上限（留空不限）</text>
      <input class="input" v-model.number="form.maxParticipants" type="number" placeholder="不限制人数留空" />
    </view>
    <view class="form-item">
      <text class="label">活动描述（选填）</text>
      <textarea class="textarea" v-model="form.description" placeholder="介绍一下这次活动" />
    </view>

    <button class="submit-btn" :disabled="submitting" @click="submit">
      {{ submitting ? '提交中...' : '发布活动' }}
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { createActivity } from '@/api/index';

const submitting = ref(false);
const form = ref({
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  maxParticipants: '',
  description: ''
});

const onStartDateChange = (e) => { form.value.startDate = e.detail.value; };
const onEndDateChange = (e) => { form.value.endDate = e.detail.value; };

const submit = async () => {
  const { title, location, startDate, endDate } = form.value;
  if (!title || !location || !startDate || !endDate) {
    return uni.showToast({ title: '请填写完整信息', icon: 'none' });
  }
  submitting.value = true;
  try {
    const res = await createActivity({
      title,
      location,
      description: form.value.description,
      startTime: startDate,
      endTime: endDate,
      maxParticipants: form.value.maxParticipants || null
    });
    if (res.code === 0) {
      uni.showToast({ title: '发布成功' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  } catch (e) {
    uni.showToast({ title: '发布失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.form-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.label { font-size: 28rpx; color: #555; display: block; margin-bottom: 12rpx; }
.input { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; box-sizing: border-box; }
.textarea { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; min-height: 120rpx; box-sizing: border-box; }
.picker-val { font-size: 28rpx; color: #333; padding: 10rpx 0; }
.submit-btn { background: #71C5DA; color: #fff; border-radius: 50rpx; margin: 30rpx 0; font-size: 30rpx; height: 90rpx; line-height: 90rpx; }
</style>
