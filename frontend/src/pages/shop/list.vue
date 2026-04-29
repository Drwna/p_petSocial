<template>
  <view class="container">
    <view class="section-title">积分商城</view>
    <view class="points-bar">
      <text>我的积分：{{ points }}</text>
      <text class="redemption-link" @click="goRedemptions">我的兑换</text>
    </view>

    <view class="gift-grid" v-if="list.length > 0">
      <view class="gift-card" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
        <image class="gift-img" :src="item.image || '/static/default-gift.png'" mode="aspectFill" />
        <view class="gift-info">
          <text class="gift-name">{{ item.name }}</text>
          <text class="gift-cost">{{ item.pointCost }} 积分</text>
          <text class="gift-stock">剩余 {{ item.stock }}</text>
        </view>
      </view>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">暂无礼品</view>
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="!hasMore && list.length > 0" class="no-more">没有更多了</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { getGiftList } from '@/api/index';

const list = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const points = ref(uni.getStorageSync('userInfo')?.points || 0);

const load = async (refresh = false) => {
  if (loading.value) return;
  if (refresh) { page.value = 1; hasMore.value = true; list.value = []; }
  loading.value = true;
  try {
    const res = await getGiftList({ page: page.value, pageSize: 10 });
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

const goDetail = (id) => uni.navigateTo({ url: `/pages/shop/detail?id=${id}` });
const goRedemptions = () => uni.navigateTo({ url: '/pages/shop/redemptions' });
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.section-title { font-size: 36rpx; font-weight: bold; margin-bottom: 16rpx; }
.points-bar { display: flex; justify-content: space-between; background: #fff; padding: 20rpx 24rpx; border-radius: 12rpx; margin-bottom: 20rpx; font-size: 28rpx; }
.redemption-link { color: #71C5DA; }
.gift-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.gift-card { width: calc(50% - 10rpx); background: #fff; border-radius: 16rpx; overflow: hidden; }
.gift-img { width: 100%; height: 280rpx; }
.gift-info { padding: 16rpx; }
.gift-name { font-size: 28rpx; font-weight: bold; display: block; }
.gift-cost { font-size: 26rpx; color: #e74c3c; display: block; margin-top: 8rpx; }
.gift-stock { font-size: 24rpx; color: #999; display: block; }
.empty, .loading, .no-more { text-align: center; color: #999; padding: 40rpx; font-size: 28rpx; }
</style>
