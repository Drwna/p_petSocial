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
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { getPetProfile, getPetPosts, likePost } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const pet = ref({});
const postCount = ref(0);
const posts = ref([]);

onShow(() => {
  loadData();
});

onPullDownRefresh(() => {
  loadData().then(() => {
    uni.stopPullDownRefresh();
  });
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

    const postsRes = await getPetPosts({ petId: userInfo.id });
    posts.value = postsRes.data.list || [];

    // 处理图片 JSON 解析
    posts.value.forEach(item => {
      if (typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (e) {
          item.images = [];
        }
      }
    });

  } catch (e) {
    console.error(e);
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
        // 退出
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.reLaunch({ url: '/pages/login/login' });
      }
    }
  });
};
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-header {
  background-color: #fff;
  padding: 40rpx;
  margin-bottom: 20rpx;

  .user-info {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 30rpx;
      background-color: #eee;
      flex-shrink: 0;
    }

    .info-right {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;

        .name {
          font-size: 36rpx;
          font-weight: bold;
          color: #333;
          margin-right: 10rpx;
        }

        .gender-icon {
          font-size: 30rpx;
          color: #2196F3;

          &.female {
            color: #E91E63;
          }
        }

        .age {
          flex-shrink: 0;
          font-size: 24rpx;
          color: #fff;
          background-color: #FF9800;
          padding: 2rpx 10rpx;
          border-radius: 10rpx;
          margin-left: 10rpx;
        }
      }

      .intro {
        flex-grow: 1;
        font-size: 26rpx;
        color: #999;
        word-break: break-word;

      }
    }
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 40rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 5rpx;
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

    .btn {
      width: 45%;
      height: 70rpx;
      line-height: 70rpx;
      font-size: 28rpx;
      border-radius: 35rpx;

      &.edit-btn {
        background-color: #FF9800;
        color: #fff;
      }

      &.switch-btn {
        background-color: #fff;
        color: #FF9800;
        border: 2rpx solid #FF9800;
      }
    }
  }
}

.post-section {
  .section-title {
    padding: 20rpx 30rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .post-list {
    padding: 20rpx;

    .empty {
      text-align: center;
      padding: 60rpx;
      color: #999;
    }
  }
}
</style>
