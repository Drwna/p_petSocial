<template>
  <view class="post-card" @click="$emit('click')">
    <view class="post-header">
      <image class="avatar" :src="post.pet?.avatar || '/static/default-avatar.png'" mode="aspectFill"
        @click.stop="goProfile" />
      <view class="info" @click.stop="goProfile">
        <text class="name">{{ post.pet?.petName || '已注销用户' }}</text>
        <text class="time">{{ formatTime(post.createTime) }}</text>
      </view>

      <!-- 关注按钮 -->
      <view class="follow-btn" v-if="!isSelf" @click.stop="handleFollowAction" :class="{ followed: isFollowing }">
        {{ isFollowing ? '已关注' : '关注' }}
      </view>

      <!-- 删除按钮 -->
      <view class="delete-btn" v-if="isSelf && showDelete" @click.stop="handleDelete">
        <image src="/static/delete.svg" class="delete-icon" />
      </view>
    </view>

    <view class="post-content">
      <view class="topic-list" v-if="post.topics && post.topics.length > 0">
        <text class="topic-tag" v-for="topic in post.topics" :key="topic.id" @click.stop="goTopic(topic.id, topic.name)">#{{ topic.name }}#</text>
      </view>
      <text class="text">{{ post.content }}</text>
    </view>

    <view class="post-images" v-if="post.images && post.images.length">
      <image v-for="(img, index) in post.images" :key="index" :src="img" class="img" mode="aspectFill"
        @click.stop="previewImage(index)" />
    </view>

    <view class="post-footer">
      <view class="action" @click.stop="$emit('like')">
        <text class="icon">{{ post.liked ? '❤️' : '🤍' }}</text>
        <text class="count" :class="{ active: post.liked }">{{ post.likeCount || 0 }}</text>
      </view>
      <view class="action">
        <text class="icon">💬</text>
        <text class="count">{{ post.commentCount || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { deletePost, followPet, unfollowPet } from '@/api/index';

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

const emit = defineEmits(['click', 'like', 'deleted', 'follow-change']);

const isFollowing = ref(props.post.isFollowing || false);

watch(() => props.post.isFollowing, (val) => {
  isFollowing.value = !!val;
});

const isSelf = computed(() => {
  const userInfo = uni.getStorageSync('userInfo');
  return userInfo && props.post.pet && userInfo.id === props.post.pet.id;
});

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

const handleFollowAction = async () => {
  if (!props.post.pet) return;
  const targetId = props.post.pet.id;
  try {
    if (isFollowing.value) {
      await unfollowPet(targetId);
      isFollowing.value = false;
      uni.showToast({ title: '已取消关注', icon: 'none' });
    } else {
      await followPet(targetId);
      isFollowing.value = true;
      uni.showToast({ title: '已关注', icon: 'none' });
    }
    emit('follow-change', { petId: targetId, isFollowing: isFollowing.value });
  } catch (e) {
    console.error(e);
  }
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
  if (!props.post.pet) return;
  if (isSelf.value) {
    uni.switchTab({ url: '/pages/profile/profile' });
  } else {
    uni.navigateTo({ url: `/pages/profile/other?id=${props.post.pet.id}` });
  }
};

const goTopic = (topicId, topicName) => {
  // 点击话题跳转到首页并带上 topic信息
  uni.setStorageSync('filterTopic', { id: topicId, name: topicName });
  // 先触发事件，因为如果当前已经在首页，switchTab 可能会走 fail 回调而不是 success
  uni.$emit('refreshIndex');
  uni.switchTab({ 
    url: '/pages/index/index'
  });
};
</script>

<style lang="scss">
.post-card {
  background-color: #fff;
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;

    .avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      background-color: #f5f5f5;
      border: 2rpx solid #fffbf0;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 4rpx;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .follow-btn {
      font-size: 24rpx;
      height: 52rpx;
      line-height: 52rpx;
      background: linear-gradient(90deg, #71C5DA, #71C5DA);
      color: #fff;
      padding: 0 24rpx;
      border-radius: 26rpx;
      font-weight: 600;
      box-shadow: 0 4rpx 10rpx rgba(113, 197, 218, 0.2);
      transition: all 0.3s;

      &.followed {
        background: #f5f5f5;
        color: #999;
        box-shadow: none;
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .delete-btn {
      padding: 12rpx;
      background-color: #f9f9f9;
      border-radius: 50%;

      .delete-icon {
        width: 32rpx;
        height: 32rpx;
        display: block;
      }
    }
  }

  .post-content {
    margin-bottom: 24rpx;
    
    .topic-list {
      display: inline-block;
      margin-bottom: 8rpx;
    }
    
    .topic-tag {
      color: #71C5DA;
      font-size: 30rpx;
      margin-right: 12rpx;
      font-weight: 500;
    }

    .text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.6;
      letter-spacing: 0.5rpx;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .post-images {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 24rpx;
    gap: 12rpx; // 使用 gap 替代 margin

    .img {
      // 动态计算宽度: (100% - gap * 2) / 3
      width: calc((100% - 24rpx) / 3);
      height: 220rpx;
      border-radius: 12rpx;
      background-color: #f0f0f0;
    }
  }

  .post-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 24rpx;
    border-top: 1rpx solid #f9f9f9;

    .action {
      display: flex;
      align-items: center;
      margin-left: 48rpx;
      background-color: #f9f9f9;
      padding: 8rpx 24rpx;
      border-radius: 30rpx;

      .icon {
        font-size: 32rpx;
        margin-right: 12rpx;
      }

      .count {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;

        &.active {
          color: #ff4d4f;
        }
      }
    }
  }
}
</style>
