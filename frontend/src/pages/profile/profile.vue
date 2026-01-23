<template>
  <view class="container">
    <view class="profile-header">
      <view class="user-info">
        <image class="avatar" :src="pet.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info-right">
          <view class="name-row">
            <text class="name">{{ pet.petName }}</text>
            <text class="gender-icon" v-if="pet.gender === '0'">♂</text>
            <text class="gender-icon female" v-else-if="pet.gender === '1'">♀</text>
            <text class="age" v-if="pet.birthday">{{ calculateAge(pet.birthday) }}</text>
          </view>
          <view class="intro"> {{ pet.intro || '这家伙很懒，什么都没写' }} </view>
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-item" @click="goFollowList('following')">
          <text class="num">{{ pet.followCount || 0 }}</text>
          <text class="label">关注</text>
        </view>
        <view class="stat-item" @click="goFollowList('fans')">
          <text class="num">{{ pet.fansCount || 0 }}</text>
          <text class="label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="num">{{ postCount }}</text>
          <text class="label">帖子</text>
        </view>
      </view>

      <view class="action-row">
        <button class="btn edit-btn" @click="goEdit">编辑资料</button>
        <button class="btn switch-btn" @click="showSwitchAccount">切换账号</button>
      </view>
    </view>

    <view class="post-section">
      <view class="section-title">我的动态</view>
      <view class="post-list">
        <post-card v-for="post in posts" :key="post.id" :post="post" :show-delete="true" @click="goDetail(post.id)"
          @like="handleLike(post)" @deleted="onPostDeleted" />
        <view v-if="posts.length === 0" class="empty">还没有发布过帖子哦</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { getPetProfile, getPetPosts, likePost } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const pet = ref({});
const postCount = ref(0);
const posts = ref([]);

const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

onShow(() => {
  const likeUpdate = uni.getStorageSync('postLikeUpdated');
  if (likeUpdate && likeUpdate.id) {
    const target = posts.value.find(p => p.id === likeUpdate.id);
    if (target) {
      target.liked = likeUpdate.liked;
      target.likeCount = likeUpdate.likeCount;
    }
    uni.removeStorageSync('postLikeUpdated');
  }
  loadData();
});

onPullDownRefresh(() => {
  loadData().then(() => {
    uni.stopPullDownRefresh();
  });
});

onReachBottom(() => {
  if (hasMore.value) {
    page.value++;
    loadPosts();
  }
});

const loadData = async () => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) {
    uni.redirectTo({ url: '/pages/login/login' });
    return;
  }

  try {
    const profileRes = await getPetProfile(userInfo.id);
    pet.value = profileRes.data.pet;
    postCount.value = profileRes.data.postCount;

    // 同步更新本地缓存
    uni.setStorageSync('userInfo', pet.value);
    let accounts = uni.getStorageSync('accounts') || [];
    let accountsChanged = false;
    accounts = accounts.map(acc => {
      if (acc.pet && acc.pet.id === pet.value.id) {
        accountsChanged = true;
        return { ...acc, pet: pet.value };
      }
      return acc;
    });
    if (accountsChanged) {
      uni.setStorageSync('accounts', accounts);
    }

    await loadPosts(true);

  } catch (e) {
    console.error(e);
  }
};

const loadPosts = async (refresh = false) => {
  if (loading.value && !refresh) return;
  loading.value = true;

  if (refresh) {
    page.value = 1;
    hasMore.value = true;
    posts.value = [];
  }

  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) return;

  try {
    const postsRes = await getPetPosts({ 
        petId: userInfo.id,
        page: page.value,
        size: 10
    });
    const list = postsRes.data.list || [];

    // 处理图片 JSON 解析
    list.forEach(item => {
      if (typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (e) {
          item.images = [];
        }
      }
    });

    if (refresh) {
      posts.value = list;
    } else {
      posts.value = [...posts.value, ...list];
    }
    
    if (list.length < 10) {
      hasMore.value = false;
    }

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goEdit = () => {
  uni.navigateTo({ url: '/pages/user/edit' });
};

const goFollowList = (type) => {
  uni.navigateTo({ url: `/pages/follow/list?type=${type}` });
};

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` });
};

const handleLike = async (post) => {
  try {
    await likePost(post.id);
    post.liked = !post.liked;
    post.likeCount += post.liked ? 1 : -1;
  } catch (e) {
    console.error(e);
  }
};

const onPostDeleted = (postId) => {
  posts.value = posts.value.filter(p => p.id !== postId);
  postCount.value = Math.max(0, postCount.value - 1);
};

const calculateAge = (birthday) => {
  if (!birthday) return '';
  const birth = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 1) {
    // 不满1岁显示月份
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months--;
    return months + '个月';
  }

  return age + '岁';
};

const showSwitchAccount = () => {
  const accounts = uni.getStorageSync('accounts') || [];
  const itemList = accounts.map(a => a.pet.petName);

  uni.showActionSheet({
    itemList: [...itemList, '+ 添加新账号', '退出登录'],
    success: (res) => {
      if (res.tapIndex < accounts.length) {
        // 切换
        const target = accounts[res.tapIndex];
        uni.setStorageSync('token', target.token);
        uni.setStorageSync('userInfo', target.pet);
        loadData(); // 刷新当前页
        uni.showToast({ title: `已切换为 ${target.pet.petName}` });
      } else if (res.tapIndex === accounts.length) {
        // 添加新账号
        uni.navigateTo({ url: '/pages/login/login' });
      } else {
        // 退出当前账号
        const currentUser = uni.getStorageSync('userInfo');
        let remainingAccounts = accounts.filter(acc => acc.pet.id !== currentUser.id);
        
        // 更新本地存储的账号列表
        uni.setStorageSync('accounts', remainingAccounts);

        if (remainingAccounts.length > 0) {
          // 自动切换到下一个账号
          const nextAccount = remainingAccounts[0];
          uni.setStorageSync('token', nextAccount.token);
          uni.setStorageSync('userInfo', nextAccount.pet);
          loadData(); // 刷新页面数据
          uni.showToast({ title: `已切换为 ${nextAccount.pet.petName}`, icon: 'none' });
        } else {
          // 无其他账号，清除所有登录信息并跳转登录页
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');
          uni.reLaunch({ url: '/pages/login/login' });
        }
      }
    }
  });
};
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #FFFBF0;
  padding-bottom: 40rpx;
}

.profile-header {
  background-color: #fff;
  margin: 24rpx;
  padding: 40rpx 30rpx;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;

  // 增加顶部装饰条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 12rpx;
    background: linear-gradient(90deg, #71C5DA, #71C5DA);
  }

  .user-info {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 48rpx;

    .avatar {
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      margin-right: 32rpx;
      background-color: #f5f5f5;
      border: 6rpx solid #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
      flex-shrink: 0;
    }

    .info-right {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .name {
          font-size: 40rpx;
          font-weight: 700;
          color: #333;
          margin-right: 16rpx;
        }

        .gender-icon {
          font-size: 28rpx;
          color: #4FB3FF;
          background-color: rgba(79, 179, 255, 0.1);
          width: 40rpx;
          height: 40rpx;
          line-height: 40rpx;
          text-align: center;
          border-radius: 50%;

          &.female {
            color: #FF6B81;
            background-color: rgba(255, 107, 129, 0.1);
          }
        }

        .age {
          flex-shrink: 0;
          font-size: 22rpx;
          color: #71C5DA;
          background-color: #E4F5FB;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          margin-left: 16rpx;
          font-weight: 500;
        }
      }

      .intro {
        font-size: 26rpx;
        color: #888;
        line-height: 1.4;
      }
    }
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 48rpx;
    padding: 20rpx 0;
    background-color: #F5FBFD;
    border-radius: 24rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        font-size: 36rpx;
        font-weight: 700;
        color: #333;
        margin-bottom: 8rpx;
      }

      .label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .action-row {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;

    .btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 40rpx;
      font-weight: 600;
      border: none;

      &.edit-btn {
        background: linear-gradient(90deg, #71C5DA, #71C5DA);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(113, 197, 218, 0.25);
      }

      &.switch-btn {
        background-color: #fff;
        color: #71C5DA;
        border: 2rpx solid #71C5DA;
      }
    }
  }
}

.post-section {
  .section-title {
    padding: 24rpx 40rpx;
    font-size: 32rpx;
    font-weight: 700;
    color: #333;
    background-color: transparent;
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      width: 8rpx;
      height: 32rpx;
      background-color: #71C5DA;
      border-radius: 4rpx;
      margin-right: 16rpx;
    }
  }

  .post-list {
    padding: 0 24rpx;

    .empty {
      text-align: center;
      padding: 80rpx;
      color: #999;
      background-color: #fff;
      border-radius: 24rpx;
      margin-top: 20rpx;
    }
  }
}
</style>
