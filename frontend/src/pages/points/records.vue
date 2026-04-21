<template>
  <view class="container">
    <view class="header-card">
      <view class="title">当前积分</view>
      <view class="points">{{ currentPoints }}</view>
      <view class="tip">仅展示近三个月的积分记录</view>
    </view>

    <view class="list-section">
      <view v-if="logs.length > 0" class="log-list">
        <view v-for="log in logs" :key="log.id" class="log-item">
          <view class="log-info">
            <view class="log-type">{{ getTypeName(log.type) }}</view>
            <view class="log-time">{{ formatTime(log.createTime) }}</view>
          </view>
          <view class="log-amount" :class="{ plus: log.amount > 0, minus: log.amount < 0 }">
            {{ log.amount > 0 ? '+' + log.amount : log.amount }}
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <image src="/static/empty.png" mode="aspectFit" class="empty-img" />
        <text>暂无积分记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getPointLogs, getPetProfile } from '@/api/index';

const logs = ref([]);
const currentPoints = ref(0);

onShow(() => {
  loadData();
});

const loadData = async () => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) return;

  try {
    // 获取最新积分
    const profileRes = await getPetProfile(userInfo.id);
    currentPoints.value = profileRes.data.points || 0;

    // 获取积分记录
    const logsRes = await getPointLogs();
    if (logsRes.code === 0) {
      logs.value = logsRes.data;
    }
  } catch (e) {
    console.error('加载积分记录失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
};

const getTypeName = (type) => {
  const types = {
    'post_created': '发帖奖励',
    'post_featured': '精品贴奖励',
    'admin_adjust': '系统调整',
    'sign_in': '签到奖励'
  };
  return types[type] || '积分变动';
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 30rpx;
}

.header-card {
  background: linear-gradient(135deg, #71C5DA 0%, #58A7BC 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  color: #ffffff;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(113, 197, 218, 0.3);
  text-align: center;

  .title {
    font-size: 28rpx;
    opacity: 0.9;
    margin-bottom: 10rpx;
  }

  .points {
    font-size: 72rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .tip {
    font-size: 24rpx;
    opacity: 0.7;
  }
}

.list-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 0 30rpx;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eeeeee;

  &:last-child {
    border-bottom: none;
  }

  .log-info {
    .log-type {
      font-size: 30rpx;
      color: #333333;
      margin-bottom: 6rpx;
    }
    .log-time {
      font-size: 24rpx;
      color: #999999;
    }
  }

  .log-amount {
    font-size: 36rpx;
    font-weight: bold;

    &.plus {
      color: #ff6b6b;
    }
    &.minus {
      color: #4cd964;
    }
  }
}

.empty {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999999;
  font-size: 28rpx;

  .empty-img {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
    opacity: 0.5;
  }
}
</style>
