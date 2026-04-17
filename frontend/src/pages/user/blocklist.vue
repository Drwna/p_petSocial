<template>
  <view class="container">
    <view class="block-list" v-if="blockList.length > 0">
      <view class="block-item" v-for="item in blockList" :key="item.id">
        <image class="avatar" :src="item.avatar || '/static/default-avatar.png'" mode="aspectFill" @click="goProfile(item.id)" />
        <view class="info" @click="goProfile(item.id)">
          <text class="name">{{ item.petName }}</text>
        </view>
        <button class="unblock-btn" @click="handleUnblock(item)">取消屏蔽</button>
      </view>
    </view>
    <view v-else class="empty">
      <text>暂无屏蔽的作者</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getBlockList, unblockPet } from '@/api/index';

const blockList = ref([]);

const loadBlockList = async () => {
  try {
    const res = await getBlockList();
    blockList.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

onShow(() => {
  loadBlockList();
});

const handleUnblock = (item) => {
  uni.showModal({
    title: '提示',
    content: `确定取消对作者 ${item.petName} 的屏蔽吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await unblockPet(item.id);
          uni.showToast({ title: '已取消屏蔽', icon: 'none' });
          loadBlockList();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
};

const goProfile = (id) => {
  uni.navigateTo({ url: `/pages/profile/other?id=${id}` });
};
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #FFFBF0;
  padding: 20rpx;
}

.block-list {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 0 20rpx;
}

.block-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f9f9f9;

  &:last-child {
    border-bottom: none;
  }

  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    border: 2rpx solid #fffbf0;
  }

  .info {
    flex: 1;
    min-width: 0;

    .name {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
  }

  .unblock-btn {
    font-size: 24rpx;
    height: 60rpx;
    line-height: 60rpx;
    background-color: #fff;
    color: #71C5DA;
    border: 2rpx solid #71C5DA;
    padding: 0 30rpx;
    border-radius: 30rpx;
    margin-left: 20rpx;
    flex-shrink: 0;

    &:active {
      opacity: 0.7;
    }
  }
}

.empty {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
