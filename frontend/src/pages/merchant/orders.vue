<template>
  <view class="container">
    <view class="filter-tabs">
      <text :class="['tab', activeTab === '' ? 'active' : '']" @click="switchTab('')">全部</text>
      <text :class="['tab', activeTab === 'pending' ? 'active' : '']" @click="switchTab('pending')">待发货</text>
      <text :class="['tab', activeTab === 'shipped' ? 'active' : '']" @click="switchTab('shipped')">已发货</text>
    </view>

    <view class="order-item" v-for="item in list" :key="item.id">
      <view class="order-header">
        <text class="gift-name">{{ item.gift?.name }}</text>
        <text :class="['status', item.status]">{{ item.status === 'pending' ? '待发货' : '已发货' }}</text>
      </view>
      <text class="user-email">买家：{{ item.account?.email }}</text>
      <text class="cost">{{ item.pointCost }} 积分</text>
      <text class="address" v-if="item.address">收货地址：{{ item.address }}</text>
      <text class="time">下单时间：{{ formatTime(item.createTime) }}</text>
      <button v-if="item.status === 'pending'" class="ship-btn" @click="ship(item)">标记已发货</button>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">暂无订单</view>
    <view v-if="loading" class="loading">加载中...</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMerchantOrders, shipOrder } from '@/api/index';

const list = ref([]);
const loading = ref(false);
const activeTab = ref('');

const loadOrders = async (status = '') => {
  loading.value = true;
  try {
    const res = await getMerchantOrders({ status: status || undefined, pageSize: 50 });
    if (res.code === 0) list.value = res.data.list;
  } catch (e) {} finally {
    loading.value = false;
  }
};

onLoad(() => loadOrders());

const switchTab = (tab) => {
  activeTab.value = tab;
  loadOrders(tab);
};

const ship = async (item) => {
  uni.showModal({
    title: '确认发货',
    content: '确认标记该订单为已发货？',
    success: async ({ confirm }) => {
      if (!confirm) return;
      const res = await shipOrder(item.id);
      if (res.code === 0) {
        item.status = 'shipped';
        uni.showToast({ title: '已标记发货' });
      }
    }
  });
};

const formatTime = (t) => t ? new Date(t).toLocaleDateString('zh-CN') : '';
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.filter-tabs { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.tab { font-size: 28rpx; color: #666; padding: 10rpx 24rpx; border-radius: 30rpx; background: #fff; }
.tab.active { background: #71C5DA; color: #fff; }
.order-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.gift-name { font-size: 30rpx; font-weight: bold; }
.status { font-size: 24rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d4edda; color: #155724; }
.user-email, .cost, .address, .time { font-size: 26rpx; color: #666; display: block; margin-bottom: 6rpx; }
.ship-btn { background: #71C5DA; color: #fff; border-radius: 40rpx; font-size: 26rpx; height: 70rpx; line-height: 70rpx; margin-top: 16rpx; }
.empty, .loading { text-align: center; color: #999; padding: 60rpx; font-size: 28rpx; }
</style>
