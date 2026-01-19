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
        <view class="stat-item">
          <text class="num">{{ pet.followCount || 0 }}</text>
          <text class="label">关注</text>
        </view>
        <view class="stat-item">
          <text class="num">{{ pet.fansCount || 0 }}</text>
          <text class="label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="num">{{ postCount }}</text>
          <text class="label">帖子</text>
        </view>
      </view>

      <view class="action-row">
         <button v-if="!isFollowing" class="btn follow-btn" @click="handleFollow">关注</button>
         <button v-else class="btn followed-btn" @click="handleUnfollow">已关注</button>
      </view>
    </view>

    <view class="post-section">
      <view class="section-title">TA的动态</view>
      <view class="post-list">
        <post-card v-for="post in posts" :key="post.id" :post="post" @click="goDetail(post.id)"
          @like="handleLike(post)" />
        <view v-if="posts.length === 0" class="empty">还没有发布过帖子哦</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { getPetProfileById, getPetPostsById, likePost, followPet, unfollowPet, getFollowStatus } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const petId = ref('');
const pet = ref({});
const postCount = ref(0);
const posts = ref([]);
const isFollowing = ref(false);

onLoad((options) => {
  if (options.id) {
    petId.value = options.id;
    loadData();
    checkFollowStatus();
  }
});

onPullDownRefresh(() => {
  loadData().then(() => {
    uni.stopPullDownRefresh();
  });
});

const loadData = async () => {
  try {
    const profileRes = await getPetProfileById(petId.value);
    pet.value = profileRes.data.pet;
    postCount.value = profileRes.data.postCount;

    const postsRes = await getPetPostsById(petId.value);
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

const checkFollowStatus = async () => {
    try {
        const res = await getFollowStatus(petId.value);
        isFollowing.value = res.data.isFollowing;
    } catch(e) {
        console.error(e);
    }
};

const handleFollow = async () => {
    try {
        await followPet(petId.value);
        isFollowing.value = true;
        pet.value.fansCount = (pet.value.fansCount || 0) + 1;
        uni.showToast({ title: '已关注' });
    } catch(e) {
        console.error(e);
    }
};

const handleUnfollow = async () => {
    try {
        await unfollowPet(petId.value);
        isFollowing.value = false;
        pet.value.fansCount = Math.max(0, (pet.value.fansCount || 0) - 1);
        uni.showToast({ title: '已取消关注' });
    } catch(e) {
        console.error(e);
    }
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
    justify-content: center;

    .btn {
      width: 60%;
      height: 70rpx;
      line-height: 70rpx;
      font-size: 28rpx;
      border-radius: 35rpx;
      
      &.follow-btn {
          background-color: #FF9800;
          color: #fff;
      }
      &.followed-btn {
          background-color: #eee;
          color: #999;
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