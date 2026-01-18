<template>
  <view class="post-card" @click="$emit('click')">
    <view class="post-header">
      <image class="avatar" :src="post.pet.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      <view class="info">
        <text class="name">{{ post.pet.petName }}</text>
        <text class="time">{{ formatTime(post.createTime) }}</text>
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
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
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
