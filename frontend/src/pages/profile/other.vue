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
          @like="handleLike(post)" @follow-change="onFollowChange" />
        <view v-if="posts.length === 0" class="empty">还没有发布过帖子哦</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { getPetProfileById, getPetPostsById, likePost, followPet, unfollowPet, getFollowStatus } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const petId = ref('');
const pet = ref({});
const postCount = ref(0);
const posts = ref([]);
const isFollowing = ref(false);

const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

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

onReachBottom(() => {
  if (hasMore.value) {
    page.value++;
    loadPosts();
  }
});

const loadData = async () => {
  try {
    const profileRes = await getPetProfileById(petId.value);
    pet.value = profileRes.data.pet;
    postCount.value = profileRes.data.postCount;

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

    try {
        const postsRes = await getPetPostsById(petId.value, {
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
            // 初始化关注状态
            item.isFollowing = isFollowing.value;
        });

        if (refresh) {
            posts.value = list;
        } else {
            posts.value = [...posts.value, ...list];
        }

        if (list.length < 10) {
            hasMore.value = false;
        }
    } catch(e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const checkFollowStatus = async () => {
    try {
        const res = await getFollowStatus(petId.value);
        isFollowing.value = res.data.isFollowing;
        // 更新帖子列表的关注状态
        posts.value.forEach(p => p.isFollowing = isFollowing.value);
    } catch(e) {
        console.error(e);
    }
};

const handleFollow = async () => {
    try {
        await followPet(petId.value);
        isFollowing.value = true;
        pet.value.fansCount = (pet.value.fansCount || 0) + 1;
        posts.value.forEach(p => p.isFollowing = true);
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
        posts.value.forEach(p => p.isFollowing = false);
        uni.showToast({ title: '已取消关注' });
    } catch(e) {
        console.error(e);
    }
};

const onFollowChange = ({ isFollowing: following }) => {
    isFollowing.value = following;
    posts.value.forEach(p => p.isFollowing = following);
    if (following) {
        pet.value.fansCount = (pet.value.fansCount || 0) + 1;
    } else {
        pet.value.fansCount = Math.max(0, (pet.value.fansCount || 0) - 1);
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
    background: linear-gradient(90deg, #FFB74D, #FF9800);
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
          color: #FF9800;
          background-color: #FFF3E0;
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
    background-color: #fffcf7;
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
    justify-content: center;

    .btn {
      width: 70%;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 30rpx;
      border-radius: 40rpx;
      font-weight: 600;
      border: none;
      
      &.follow-btn {
          background: linear-gradient(90deg, #FFB74D, #FF9800);
          color: #fff;
          box-shadow: 0 4rpx 12rpx rgba(255, 152, 0, 0.25);
      }
      &.followed-btn {
          background-color: #f5f5f5;
          color: #999;
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
      background-color: #FF9800;
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