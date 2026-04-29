<template>
  <view class="container">
    <view v-if="list.length === 0 && !loading" class="empty">暂无兑换记录</view>
    <view class="redemption-item" v-for="item in list" :key="item.id">
      <image class="gift-img" :src="item.gift?.image || '/static/default-gift.png'" mode="aspectFill" />
      <view class="item-info">
        <text class="gift-name">{{ item.gift?.name }}</text>
        <text class="cost">-{{ item.pointCost }} 积分</text>
        <text class="address" v-if="item.address">{{ item.address }}</text>
        <view class="status-row">
          <text :class="['status', item.status]">{{ item.status === 'pending' ? '待发货' : '已发货' }}</text>
          <text class="time">{{ formatTime(item.createTime) }}</text>
        </view>
      </view>
    </view>
    <view v-if="loading" class="loading">加载中...</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMyRedemptions } from '@/api/index';

const list = ref([]);
const loading = ref(true);

onLoad(async () => {
  try {
    const res = await getMyRedemptions();
    if (res.code === 0) list.value = res.data;
  } catch (e) {} finally {
    loading.value = false;
  }
});

const formatTime = (t) => t ? new Date(t).toLocaleDateString('zh-CN') : '';
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.empty, .loading { text-align: center; color: #999; padding: 80rpx; font-size: 28rpx; }
.redemption-item { display: flex; background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; gap: 20rpx; }
.gift-img { width: 120rpx; height: 120rpx; border-radius: 10rpx; flex-shrink: 0; }
.item-info { flex: 1; }
.gift-name { font-size: 30rpx; font-weight: bold; display: block; margin-bottom: 8rpx; }
.cost { font-size: 26rpx; color: #e74c3c; display: block; margin-bottom: 6rpx; }
.address { font-size: 24rpx; color: #666; display: block; margin-bottom: 8rpx; }
.status-row { display: flex; justify-content: space-between; align-items: center; }
.status { font-size: 24rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d4edda; color: #155724; }
.time { font-size: 22rpx; color: #999; }
</style>
