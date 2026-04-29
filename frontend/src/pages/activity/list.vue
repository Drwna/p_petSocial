<template>
  <view class="container">
    <view class="activity-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
      <view class="activity-header">
        <text class="title">{{ item.title }}</text>
        <text class="status" :class="item.status">{{ statusText(item.status) }}</text>
      </view>
      <view class="meta">
        <text class="location">📍 {{ item.location }}</text>
        <text class="time">🕐 {{ formatTime(item.startTime) }}</text>
      </view>
      <view class="footer">
        <text class="merchant">{{ item.merchant?.businessName }}</text>
        <text class="participants">{{ item.currentParticipants }}{{ item.maxParticipants ? `/${item.maxParticipants}` : '' }} 人参与</text>
      </view>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">暂无活动</view>
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="!hasMore && list.length > 0" class="no-more">没有更多了</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { getActivityList } from '@/api/index';

const list = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);

const load = async (refresh = false) => {
  if (loading.value) return;
  if (refresh) { page.value = 1; hasMore.value = true; list.value = []; }
  loading.value = true;
  try {
    const res = await getActivityList({ page: page.value, pageSize: 10 });
    const items = res.data.list || [];
    list.value = refresh ? items : [...list.value, ...items];
    if (items.length < 10) hasMore.value = false;
  } catch (e) {} finally {
    loading.value = false;
  }
};

onLoad(() => load(true));
onPullDownRefresh(() => load(true).then(() => uni.stopPullDownRefresh()));
onReachBottom(() => { if (hasMore.value) { page.value++; load(); } });

const goDetail = (id) => uni.navigateTo({ url: `/pages/activity/detail?id=${id}` });
const statusText = (s) => ({ active: '报名中', ended: '已结束', cancelled: '已取消' }[s] || s);
const formatTime = (t) => t ? new Date(t).toLocaleDateString('zh-CN') : '';
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.activity-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.activity-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: bold; flex: 1; }
.status { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 20rpx; flex-shrink: 0; margin-left: 16rpx; }
.status.active { background: #d4edda; color: #155724; }
.status.ended, .status.cancelled { background: #f5f5f5; color: #999; }
.meta { margin-bottom: 12rpx; }
.location, .time { font-size: 26rpx; color: #666; display: block; margin-bottom: 6rpx; }
.footer { display: flex; justify-content: space-between; }
.merchant { font-size: 24rpx; color: #71C5DA; }
.participants { font-size: 24rpx; color: #999; }
.empty, .loading, .no-more { text-align: center; color: #999; padding: 60rpx; font-size: 28rpx; }
</style>
