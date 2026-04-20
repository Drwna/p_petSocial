<template>
  <view class="post-card" @click="$emit('click')">
    <view class="post-header">
      <image class="avatar" :src="post.pet?.avatar || '/static/default-avatar.png'" mode="aspectFill"
        @click.stop="goProfile" />
      <view class="info" @click.stop="goProfile">
        <view class="name-row">
          <text class="name">{{ post.pet?.petName || '已注销用户' }}</text>
          <text class="badge pin-badge" v-if="post.isPinned">置顶</text>
          <text class="badge feature-badge" v-if="post.isFeatured">精品</text>
        </view>
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

      <!-- 更多操作 (不感兴趣/屏蔽) -->
      <view class="more-btn" v-if="!isSelf" @click.stop="handleMore">
        <text class="more-icon">···</text>
      </view>
    </view>

    <view class="post-content">
      <view class="topic-list" v-if="post.topics && post.topics.length > 0">
        <text class="topic-tag" v-for="topic in post.topics" :key="topic.id"
          @click.stop="goTopic(topic.id, topic.name)">#{{ topic.name }}#</text>
      </view>
      <text class="text">{{ post.content }}</text>
    </view>

    <view class="post-images" v-if="post.images && post.images.length">
      <image v-for="(img, index) in post.images" :key="index" :src="img" class="img" mode="aspectFill"
        @click.stop="previewImage(index)" />
    </view>

    <view class="post-footer">
      <view class="footer-left"></view>

      <view class="footer-right">
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
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { deletePost, followPet, unfollowPet, dislikePost, blockPet } from '@/api/index';

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

const emit = defineEmits(['click', 'like', 'deleted', 'follow-change', 'update-post', 'disliked']);

const isFollowing = ref(props.post.isFollowing || false);

watch(() => props.post.isFollowing, (val) => {
  isFollowing.value = !!val;
});

const userInfo = uni.getStorageSync('userInfo');
const isSelf = computed(() => {
  return userInfo && props.post.pet && userInfo.id === props.post.pet.id;
});

const handleMore = () => {
  const options = ['不感兴趣', '屏蔽作者'];
  uni.showActionSheet({
    itemList: options,
    success: async (res) => {
      if (res.tapIndex === 0) {
        // 不感兴趣
        try {
          await dislikePost(props.post.id);
          uni.showToast({ title: '已减少此类内容推荐', icon: 'none' });
          emit('disliked', props.post.id);
        } catch (e) {
          console.error(e);
        }
      } else if (res.tapIndex === 1) {
        // 屏蔽作者
        uni.showModal({
          title: '提示',
          content: `确定屏蔽作者 ${props.post.pet?.petName} 吗？屏蔽后将不再看到该作者的内容。`,
          success: async (modalRes) => {
            if (modalRes.confirm) {
              try {
                await blockPet(props.post.petId);
                uni.showToast({ title: '已屏蔽该作者', icon: 'none' });
                emit('disliked', props.post.id, true); // true 表示屏蔽了作者，可能需要刷新列表或移除该作者的所有帖子
              } catch (e) {
                console.error(e);
              }
            }
          }
        });
      }
    }
  });
};

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
      min-width: 0;
      margin-right: 16rpx;

      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 4rpx;
        min-width: 0;
      }

      .name {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-right: 12rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 0 1 auto;
        min-width: 0;
      }

      .badge {
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 4rpx;
        margin-right: 8rpx;
        font-weight: normal;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .pin-badge {
        background-color: #ffe58f;
        color: #d46b08;
      }

      .feature-badge {
        background-color: #ffccc7;
        color: #cf1322;
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
      flex-shrink: 0;
      white-space: nowrap;

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
      flex-shrink: 0;

      .delete-icon {
        width: 32rpx;
        height: 32rpx;
        display: block;
      }
    }

    .more-btn {
      padding: 12rpx 20rpx;
      flex-shrink: 0;

      .more-icon {
        font-size: 36rpx;
        color: #999;
        font-weight: bold;
        line-height: 1;
      }

      &:active {
        opacity: 0.7;
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
      // 设置最大高度，超出部分省略号显示
      max-height: 120rpx;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
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
    align-items: center;
    justify-content: space-between;
    padding-top: 24rpx;
    border-top: 1rpx solid #f9f9f9;

    .footer-left {
      flex: 1;
    }

    .footer-right {
      display: flex;
      align-items: center;
    }

    .action {
      display: flex;
      align-items: center;
      margin-left: 32rpx;
      background-color: #f9f9f9;
      padding: 8rpx 24rpx;
      border-radius: 30rpx;

      .icon {
        font-size: 32rpx;
        margin-right: 8rpx;
      }

      .count {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
        min-width: 20rpx;

        &.active {
          color: #ff4d4f;
        }
      }
    }
  }
}
</style>
