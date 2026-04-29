<template>
  <view class="container">
    <view class="header-row">
      <text class="section-title">我的礼品</text>
      <text class="add-btn" @click="goCreate">+ 发布礼品</text>
    </view>

    <view class="gift-item" v-for="item in list" :key="item.id">
      <image class="gift-img" :src="item.image || '/static/default-gift.png'" mode="aspectFill" />
      <view class="item-info">
        <text class="name">{{ item.name }}</text>
        <text class="cost">{{ item.pointCost }} 积分 · 库存 {{ item.stock }}</text>
        <text :class="['active-tag', item.isActive ? 'on' : 'off']">{{ item.isActive ? '上架' : '下架' }}</text>
      </view>
      <view class="item-actions">
        <text @click="goEdit(item.id)">编辑</text>
      </view>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">还没有发布礼品</view>
    <view v-if="loading" class="loading">加载中...</view>

    <view class="orders-entry" @click="goOrders">查看兑换订单</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getMyGifts } from '@/api/index';

const list = ref([]);
const loading = ref(false);

onShow(async () => {
  loading.value = true;
  try {
    const res = await getMyGifts({ page: 1, pageSize: 50 });
    if (res.code === 0) list.value = res.data.list;
  } catch (e) {} finally {
    loading.value = false;
  }
});

const goCreate = () => uni.navigateTo({ url: '/pages/merchant/gift-form' });
const goEdit = (id) => uni.navigateTo({ url: `/pages/merchant/gift-form?id=${id}` });
const goOrders = () => uni.navigateTo({ url: '/pages/merchant/orders' });
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 34rpx; font-weight: bold; }
.add-btn { color: #71C5DA; font-size: 28rpx; }
.gift-item { display: flex; background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; gap: 20rpx; align-items: center; }
.gift-img { width: 110rpx; height: 110rpx; border-radius: 10rpx; flex-shrink: 0; }
.item-info { flex: 1; }
.name { font-size: 30rpx; font-weight: bold; display: block; margin-bottom: 8rpx; }
.cost { font-size: 26rpx; color: #666; display: block; margin-bottom: 8rpx; }
.active-tag { font-size: 22rpx; padding: 2rpx 12rpx; border-radius: 20rpx; }
.active-tag.on { background: #d4edda; color: #155724; }
.active-tag.off { background: #f5f5f5; color: #999; }
.item-actions { font-size: 26rpx; color: #71C5DA; }
.empty, .loading { text-align: center; color: #999; padding: 60rpx; font-size: 28rpx; }
.orders-entry { text-align: center; color: #71C5DA; font-size: 28rpx; padding: 30rpx; background: #fff; border-radius: 16rpx; margin-top: 20rpx; }
</style>
