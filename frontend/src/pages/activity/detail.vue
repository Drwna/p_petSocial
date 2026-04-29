<template>
  <view class="container" v-if="activity">
    <view class="info-section">
      <view class="title-row">
        <text class="title">{{ activity.title }}</text>
        <text class="status" :class="activity.status">{{ statusText(activity.status) }}</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">地点</text>
        <text class="meta-value">{{ activity.location }}</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">开始</text>
        <text class="meta-value">{{ formatTime(activity.startTime) }}</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">结束</text>
        <text class="meta-value">{{ formatTime(activity.endTime) }}</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">参与人数</text>
        <text class="meta-value">{{ activity.currentParticipants }}{{ activity.maxParticipants ? ` / ${activity.maxParticipants}` : '' }} 人</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">主办方</text>
        <text class="meta-value">{{ activity.merchant?.businessName }}</text>
      </view>
      <text class="desc" v-if="activity.description">{{ activity.description }}</text>
    </view>

    <view class="join-section" v-if="activity.status === 'active'">
      <button
        v-if="!activity.hasJoined"
        class="join-btn"
        :disabled="isFull || joining"
        @click="join"
      >
        {{ isFull ? '人数已满' : (joining ? '报名中...' : '参与活动') }}
      </button>
      <button v-else class="leave-btn" :disabled="joining" @click="leave">
        {{ joining ? '处理中...' : '取消报名' }}
      </button>
    </view>
    <view v-else class="ended-tip">活动已{{ activity.status === 'ended' ? '结束' : '取消' }}</view>
  </view>
  <view v-else class="loading">加载中...</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getActivityDetail, joinActivity, leaveActivity } from '@/api/index';

const activity = ref(null);
const joining = ref(false);
let activityId = null;

const isFull = computed(() => {
  if (!activity.value || activity.value.maxParticipants === null) return false;
  return activity.value.currentParticipants >= activity.value.maxParticipants;
});

onLoad(async ({ id }) => {
  activityId = id;
  const res = await getActivityDetail(id);
  if (res.code === 0) activity.value = res.data;
});

const join = async () => {
  joining.value = true;
  try {
    const res = await joinActivity(activityId);
    if (res.code === 0) {
      activity.value.hasJoined = true;
      activity.value.currentParticipants++;
      uni.showToast({ title: '报名成功！' });
    } else {
      uni.showToast({ title: res.msg || '报名失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '报名失败', icon: 'none' });
  } finally {
    joining.value = false;
  }
};

const leave = async () => {
  joining.value = true;
  try {
    const res = await leaveActivity(activityId);
    if (res.code === 0) {
      activity.value.hasJoined = false;
      activity.value.currentParticipants--;
      uni.showToast({ title: '已取消报名' });
    } else {
      uni.showToast({ title: res.msg || '取消失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '取消失败', icon: 'none' });
  } finally {
    joining.value = false;
  }
};

const statusText = (s) => ({ active: '报名中', ended: '已结束', cancelled: '已取消' }[s] || s);
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '';
</script>

<style scoped>
.container { background: #f8f8f8; min-height: 100vh; padding-bottom: 40rpx; }
.info-section { background: #fff; padding: 30rpx; margin-bottom: 20rpx; }
.title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24rpx; }
.title { font-size: 36rpx; font-weight: bold; flex: 1; }
.status { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 20rpx; flex-shrink: 0; margin-left: 16rpx; }
.status.active { background: #d4edda; color: #155724; }
.status.ended, .status.cancelled { background: #f5f5f5; color: #999; }
.meta-item { display: flex; margin-bottom: 14rpx; }
.meta-label { font-size: 26rpx; color: #999; width: 120rpx; flex-shrink: 0; }
.meta-value { font-size: 26rpx; color: #333; }
.desc { font-size: 28rpx; color: #444; line-height: 1.6; margin-top: 20rpx; display: block; }
.join-section { padding: 20rpx; }
.join-btn { background: #71C5DA; color: #fff; border-radius: 50rpx; font-size: 32rpx; height: 100rpx; line-height: 100rpx; }
.join-btn[disabled] { background: #ccc; }
.leave-btn { background: #fff; color: #e74c3c; border: 2rpx solid #e74c3c; border-radius: 50rpx; font-size: 32rpx; height: 100rpx; line-height: 100rpx; }
.ended-tip { text-align: center; color: #999; padding: 40rpx; font-size: 28rpx; }
.loading { text-align: center; color: #999; padding: 100rpx; }
</style>
