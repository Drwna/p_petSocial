<template>
  <view class="container">
    <view class="header-row">
      <text class="section-title">我的活动</text>
      <text class="add-btn" @click="goCreate">+ 发布活动</text>
    </view>

    <view class="activity-item" v-for="item in list" :key="item.id">
      <view class="activity-header">
        <text class="title">{{ item.title }}</text>
        <text class="status" :class="item.status">{{ statusText(item.status) }}</text>
      </view>
      <text class="meta">📍 {{ item.location }} · {{ formatTime(item.startTime) }}</text>
      <text class="participants">{{ item.currentParticipants }}{{ item.maxParticipants ? `/${item.maxParticipants}` : '' }} 人参与</text>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">还没有发布活动</view>
    <view v-if="loading" class="loading">加载中...</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getMyActivities } from '@/api/index';

const list = ref([]);
const loading = ref(false);

onShow(async () => {
  loading.value = true;
  try {
    const res = await getMyActivities({ page: 1, pageSize: 50 });
    if (res.code === 0) list.value = res.data.list;
  } catch (e) {} finally {
    loading.value = false;
  }
});

const goCreate = () => uni.navigateTo({ url: '/pages/merchant/activity-form' });
const statusText = (s) => ({ pending: '审核中', active: '进行中', rejected: '已拒绝', ended: '已结束', cancelled: '已取消' }[s] || s);
const formatTime = (t) => t ? new Date(t).toLocaleDateString('zh-CN') : '';
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 34rpx; font-weight: bold; }
.add-btn { color: #71C5DA; font-size: 28rpx; }
.activity-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.activity-header { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.title { font-size: 30rpx; font-weight: bold; }
.status { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.status.active { background: #d4edda; color: #155724; }
.status.pending { background: #fff3cd; color: #856404; }
.status.rejected { background: #f8d7da; color: #721c24; }
.status.ended, .status.cancelled { background: #f5f5f5; color: #999; }
.meta { font-size: 26rpx; color: #666; display: block; margin-bottom: 8rpx; }
.participants { font-size: 24rpx; color: #999; }
.empty, .loading { text-align: center; color: #999; padding: 60rpx; font-size: 28rpx; }
</style>
