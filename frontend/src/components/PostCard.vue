<template>
  <view class="post-card" @click="$emit('click')">
    <view class="post-header">
      <image class="avatar" :src="post.pet.avatar || '/static/default-avatar.png'" mode="aspectFill" @click.stop="goProfile" />
      <view class="info" @click.stop="goProfile">
        <text class="name">{{ post.pet.petName }}</text>
        <text class="time">{{ formatTime(post.createTime) }}</text>
      </view>
      <!-- 删除按钮 -->
      <view class="delete-btn" v-if="isSelf && showDelete" @click.stop="handleDelete">
        <image src="/static/delete.svg" class="delete-icon" />
      </view>
    </view>

    <view class="post-content">
      <text class="text">{{ post.content }}</text>
    </view>

    <view class="post-images" v-if="post.images && post.images.length">
      <image v-for="(img, index) in post.images" :key="index" :src="img" class="img" mode="aspectFill"
        @click.stop="previewImage(index)" />
    </view>

    <view class="post-footer">
      <view class="action" @click.stop="$emit('like')">
        <text class="icon">{{ post.liked ? '❤️' : '🤍' }}</text>
        <text class="count">{{ post.likeCount || 0 }}</text>
      </view>
      <view class="action">
        <text class="icon">💬</text>
        <text class="count">{{ post.commentCount || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { deletePost } from '@/api/index';

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  showDelete: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click', 'like', 'deleted']);

const isSelf = computed(() => {
  const userInfo = uni.getStorageSync('userInfo');
  return userInfo && props.post.pet && userInfo.id === props.post.pet.id;
});

const formatTime = (time) => {
  if (!time) return '';
  // 示例：2026-01-16T15:11:58.000Z
  return time.replace('T', ' ').replace('.000Z', '');
};

const previewImage = (index) => {
  uni.previewImage({
    urls: props.post.images,
    current: index
  });
};

const handleDelete = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条帖子吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deletePost(props.post.id);
          uni.showToast({ title: '删除成功', icon: 'none' });
          emit('deleted', props.post.id);
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' });
          console.error(e);
        }
      }
    }
  });
};

const goProfile = () => {
  if (isSelf.value) {
    uni.switchTab({ url: '/pages/profile/profile' });
  } else {
    uni.navigateTo({ url: `/pages/profile/other?id=${props.post.pet.id}` });
  }
};
</script>

<style lang="scss">
.post-card {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      background-color: #eee;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .delete-btn {
      padding: 10rpx;
      .delete-icon {
        width: 36rpx;
        height: 36rpx;
      }
    }
  }

  .post-content {
    margin-bottom: 20rpx;

    .text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.5;
    }
  }

  .post-images {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20rpx;

    .img {
      width: 190rpx;
      height: 190rpx;
      margin-right: 8rpx;
      margin-bottom: 8rpx;
      border-radius: 8rpx;
      background-color: #f0f0f0;

      &:nth-child(3n) {
       // margin-right: 0;
      }
    }
  }

  .post-footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1rpx solid #f5f5f5;
    padding-top: 20rpx;

    .action {
      display: flex;
      align-items: center;
      margin-left: 40rpx;

      .icon {
        font-size: 36rpx;
        margin-right: 10rpx;
      }

      .count {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}
</style>
