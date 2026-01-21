<template>
  <view class="container">
    <view class="user-list">
      <view class="user-item" v-for="user in list" :key="user.id" @click="goProfile(user.id)">
        <image class="avatar" :src="user.avatar || '/static/default-avatar.png'" />
        <text class="name">{{ user.petName }}</text>
      </view>
      <view v-if="loading" class="loading-more">加载中...</view>
      <view v-if="!hasMore && list.length > 0" class="no-more">没有更多了</view>
      <view v-if="!loading && list.length === 0" class="empty">暂无列表</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { getFollowingList, getFansList } from '@/api/index';

const type = ref('following');
const list = ref([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

onLoad((options) => {
  type.value = options.type || 'following';
  uni.setNavigationBarTitle({
    title: type.value === 'following' ? '我的关注' : '我的粉丝'
  });
  loadData(true);
});

onPullDownRefresh(() => {
  loadData(true).then(() => {
    uni.stopPullDownRefresh();
  });
});

onReachBottom(() => {
  if (hasMore.value) {
    page.value++;
    loadData();
  }
});

const loadData = async (refresh = false) => {
  if (loading.value && !refresh) return;
  loading.value = true;

  if (refresh) {
    page.value = 1;
    hasMore.value = true;
    // list.value = []; // 可选：清空列表会闪烁，不清空则平滑
  }

  try {
    const api = type.value === 'following' ? getFollowingList : getFansList;
    const res = await api({ page: page.value, pageSize: 20 });
    const data = res.data.list || [];
    
    if (refresh) {
      list.value = data;
    } else {
      list.value = [...list.value, ...data];
    }
    
    if (data.length < 20) {
      hasMore.value = false;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goProfile = (id) => {
  const userInfo = uni.getStorageSync('userInfo');
  if (userInfo && userInfo.id === id) {
    uni.switchTab({ url: '/pages/profile/profile' });
  } else {
    uni.navigateTo({ url: `/pages/profile/other?id=${id}` });
  }
};
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.user-list {
  background-color: #fff;
  .user-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      margin-right: 30rpx;
      background-color: #eee;
    }
    .name {
      font-size: 32rpx;
      color: #333;
      flex: 1;
    }
  }
  .empty {
    text-align: center;
    padding: 60rpx;
    color: #999;
  }
  .loading-more, .no-more {
    text-align: center;
    padding: 20rpx;
    color: #999;
    font-size: 24rpx;
  }
}
</style>
