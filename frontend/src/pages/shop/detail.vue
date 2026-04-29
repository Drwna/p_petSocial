<template>
  <view class="container" v-if="gift">
    <image class="gift-img" :src="gift.image || '/static/default-gift.png'" mode="aspectFill" />
    <view class="info-section">
      <text class="name">{{ gift.name }}</text>
      <text class="cost">{{ gift.pointCost }} 积分兑换</text>
      <text class="stock">库存：{{ gift.stock }}</text>
      <text class="merchant">来自：{{ gift.merchant?.businessName }}</text>
      <text class="desc" v-if="gift.description">{{ gift.description }}</text>
    </view>

    <button class="redeem-btn" :disabled="gift.stock === 0" @click="showSheet = true">
      {{ gift.stock > 0 ? '立即兑换' : '已售罄' }}
    </button>

    <!-- 底部兑换面板 -->
    <view v-if="showSheet" class="sheet-mask" @click.self="showSheet = false">
      <view class="sheet-content">
        <text class="popup-title">填写收货地址</text>
        <textarea class="address-input" v-model="address" placeholder="请输入收货地址（选填）" />
        <button class="confirm-btn" :disabled="redeeming" @click="redeem">
          {{ redeeming ? '兑换中...' : `确认兑换 (${gift.pointCost} 积分)` }}
        </button>
        <button class="cancel-btn" @click="showSheet = false">取消</button>
      </view>
    </view>
  </view>
  <view v-else class="loading">加载中...</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getGiftDetail, redeemGift } from '@/api/index';

const gift = ref(null);
const address = ref('');
const redeeming = ref(false);
const showSheet = ref(false);

onLoad(async ({ id }) => {
  const res = await getGiftDetail(id);
  if (res.code === 0) gift.value = res.data;
});

const redeem = async () => {
  redeeming.value = true;
  try {
    const res = await redeemGift({ giftId: gift.value.id, address: address.value });
    if (res.code === 0) {
      uni.showToast({ title: '兑换成功！' });
      gift.value.stock--;
      showSheet.value = false;
    }
  } catch (e) {
    uni.showToast({ title: '兑换失败', icon: 'none' });
  } finally {
    redeeming.value = false;
  }
};
</script>

<style scoped>
.container { background: #f8f8f8; min-height: 100vh; }
.gift-img { width: 100%; height: 500rpx; }
.info-section { background: #fff; padding: 30rpx; margin-bottom: 20rpx; }
.name { font-size: 36rpx; font-weight: bold; display: block; margin-bottom: 12rpx; }
.cost { font-size: 32rpx; color: #e74c3c; display: block; margin-bottom: 8rpx; }
.stock { font-size: 26rpx; color: #999; display: block; margin-bottom: 8rpx; }
.merchant { font-size: 26rpx; color: #666; display: block; margin-bottom: 16rpx; }
.desc { font-size: 28rpx; color: #444; line-height: 1.6; }
.redeem-btn { margin: 20rpx; background: #71C5DA; color: #fff; border-radius: 50rpx; font-size: 32rpx; height: 100rpx; line-height: 100rpx; }
.redeem-btn[disabled] { background: #ccc; }
.loading { text-align: center; color: #999; padding: 100rpx; }
.sheet-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; flex-direction: column; justify-content: flex-end; }
.sheet-content { background: #fff; padding: 40rpx; border-radius: 20rpx 20rpx 0 0; }
.popup-title { font-size: 32rpx; font-weight: bold; display: block; margin-bottom: 24rpx; }
.address-input { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; min-height: 120rpx; box-sizing: border-box; margin-bottom: 24rpx; }
.confirm-btn { background: #71C5DA; color: #fff; border-radius: 50rpx; font-size: 30rpx; height: 90rpx; line-height: 90rpx; margin-bottom: 16rpx; }
.confirm-btn[disabled] { background: #aaa; }
.cancel-btn { background: #f5f5f5; color: #666; border-radius: 50rpx; font-size: 30rpx; height: 90rpx; line-height: 90rpx; }
</style>
