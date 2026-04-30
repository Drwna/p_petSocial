<template>
  <view class="container">
    <view class="section-title">发布活动</view>
    <view class="form-card">
      <view class="cell">
        <text class="cell-label">活动标题</text>
        <input class="cell-input" v-model="form.title" placeholder="请输入活动标题" placeholder-class="ph" />
      </view>
      <view class="cell">
        <text class="cell-label">活动地点</text>
        <input class="cell-input" v-model="form.location" placeholder="请输入活动地点" placeholder-class="ph" />
      </view>
      <view class="cell">
        <text class="cell-label">开始日期</text>
        <picker mode="date" :value="form.startDate" @change="e => form.startDate = e.detail.value">
          <view class="picker-val" :class="{ ph: !form.startDate }">{{ form.startDate || '请选择日期' }}</view>
        </picker>
      </view>
      <view class="cell">
        <text class="cell-label">结束日期</text>
        <picker mode="date" :value="form.endDate" @change="e => form.endDate = e.detail.value">
          <view class="picker-val" :class="{ ph: !form.endDate }">{{ form.endDate || '请选择日期' }}</view>
        </picker>
      </view>
      <view class="cell">
        <text class="cell-label">人数上限</text>
        <input class="cell-input" v-model.number="form.maxParticipants" type="number" placeholder="不限制留空" placeholder-class="ph" />
      </view>
      <view class="cell cell-textarea">
        <text class="cell-label">活动描述</text>
        <textarea class="textarea" v-model="form.description" placeholder="介绍一下这次活动（选填）" placeholder-class="ph" />
      </view>
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
.container { padding: 24rpx; background: #f5f5f5; min-height: 100vh; }

.section-title { font-size: 28rpx; color: #999; padding: 0 8rpx 16rpx; }

.form-card { background: #fff; border-radius: 12rpx; overflow: hidden; }

.cell {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.cell:last-child { border-bottom: none; }

.cell-label {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
  flex-shrink: 0;
}

.cell-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  min-height: 44rpx;
}

.picker-val {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.cell-textarea { align-items: flex-start; }
.textarea {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  min-height: 120rpx;
  line-height: 1.6;
}

.submit-btn {
  margin-top: 40rpx;
  background: #71C5DA;
  color: #fff;
  border-radius: 8rpx;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
}
.submit-btn[disabled] { opacity: 0.6; }

.ph { color: #bbb; }
</style>
