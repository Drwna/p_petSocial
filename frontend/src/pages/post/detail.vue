<template>
  <view class="container" v-if="post">
    <!-- 帖子主体 -->
    <view class="post-card">
      <view class="post-header">
        <image class="avatar" :src="post.pet.avatar || '/static/default-avatar.png'" mode="aspectFill" @click="goProfile" />
        <view class="info" @click="goProfile">
          <text class="name">{{ post.pet.petName }}</text>
          <text class="time">{{ formatTime(post.createTime) }}</text>
        </view>
        <!-- 关注按钮 -->
        <button v-if="!isSelf && !isFollowing" class="follow-btn" @click="handleFollow">关注</button>
        <button v-if="!isSelf && isFollowing" class="follow-btn followed" @click="handleUnfollow">已关注</button>
      </view>

      <view class="post-content">
        <text class="text">{{ post.content }}</text>
      </view>

      <view class="post-images" v-if="post.images && post.images.length">
        <image v-for="(img, index) in post.images" :key="index" :src="img" class="img" mode="widthFix"
          @click="previewImage(index)" />
      </view>

      <view class="post-stats">
        <text class="stat">点赞 {{ post.likeCount }}</text>
        <text class="stat">评论 {{ post.commentCount }}</text>
      </view>
    </view>

    <!-- 评论列表 -->
    <view class="comment-section">
      <view class="section-title">评论</view>
      <view class="comment-list">
        <view class="comment-item" v-for="comment in comments" :key="comment.id">
          <image class="c-avatar" :src="comment.pet.avatar" @click="goUserProfile(comment.pet.id)" />
          <view class="c-content">
            <view class="c-header">
              <text class="c-name" @click="goUserProfile(comment.pet.id)">{{ comment.pet.petName }}</text>
              <text class="c-time">{{ formatTime(comment.createTime) }}</text>
            </view>
            <text class="c-text">{{ comment.content }}</text>
          </view>
          <!-- 评论删除按钮：如果是自己的评论 或者 是帖子作者 -->
          <view class="c-action" v-if="canDeleteComment(comment)" @click="handleDeleteComment(comment)">
             <text class="delete-text">删除</text>
          </view>
        </view>
        <view v-if="comments.length === 0" class="empty">暂无评论，快来抢沙发</view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <input class="comment-input" v-model="commentContent" placeholder="说点什么..." confirm-type="send"
        @confirm="sendComment" />
      <view class="action" @click="handleLike">
        <text class="icon">{{ post.liked ? '❤️' : '🤍' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPostDetail, getCommentList, createComment, likePost, followPet, unfollowPet, getFollowStatus, deleteComment } from '@/api/index';

const post = ref(null);
const comments = ref([]);
const commentContent = ref('');
const isFollowing = ref(false);
const isSelf = ref(false);

onLoad((options) => {
  if (options.id) {
    loadPost(options.id);
    loadComments(options.id);
  }
});

const formatTime = (time) => {
  if (!time) return '';
  // 示例：2026-01-16T15:11:58.000Z
  return time.replace('T', ' ').replace('.000Z', '');
};

const loadPost = async (id) => {
  try {
    const res = await getPostDetail(id);
    const data = res.data;
    if (typeof data.images === 'string') {
      try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
    }
    post.value = data;

    // Check if self
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo && userInfo.id === data.pet.id) {
      isSelf.value = true;
    } else if (userInfo) {
      checkFollowStatus(data.pet.id);
    }
  } catch (e) {
    console.error(e);
  }
};

const loadComments = async (id) => {
  try {
    const res = await getCommentList(id);
    // 假设 API 返回的结构是 { code: 0, data: { list: [] } } 或 { code: 0, data: [] }
    // 根据文档，评论列表接口返回示例没给全，假设返回的是数组
    comments.value = res.data.list || res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const checkFollowStatus = async (petId) => {
  try {
    const res = await getFollowStatus(petId);
    isFollowing.value = res.data.isFollowing;
  } catch (e) { console.error(e); }
};

const handleFollow = async () => {
  try {
    await followPet(post.value.pet.id);
    isFollowing.value = true;
    uni.showToast({ title: '已关注' });
  } catch (e) { console.error(e); }
};

const handleUnfollow = async () => {
  try {
    await unfollowPet(post.value.pet.id);
    isFollowing.value = false;
    uni.showToast({ title: '已取消关注' });
  } catch (e) { console.error(e); }
};

const handleLike = async () => {
  try {
    await likePost(post.value.id);
    post.value.liked = !post.value.liked;
    post.value.likeCount += post.value.liked ? 1 : -1;
  } catch (e) { console.error(e); }
};

const sendComment = async () => {
  if (!commentContent.value) return;
  try {
    await createComment({ postId: post.value.id, content: commentContent.value });
    commentContent.value = '';
    uni.showToast({ title: '评论成功' });
    loadComments(post.value.id);
    post.value.commentCount++;
  } catch (e) { console.error(e); }
};

const previewImage = (index) => {
  uni.previewImage({
    urls: post.value.images,
    current: index
  });
};

const goProfile = () => {
  if (isSelf.value) {
    uni.switchTab({ url: '/pages/profile/profile' });
  } else {
    uni.navigateTo({ url: `/pages/profile/other?id=${post.value.pet.id}` });
  }
};

const goUserProfile = (userId) => {
  const currentUser = uni.getStorageSync('userInfo');
  if (currentUser && currentUser.id === userId) {
      uni.switchTab({ url: '/pages/profile/profile' });
  } else {
      uni.navigateTo({ url: `/pages/profile/other?id=${userId}` });
  }
};

const canDeleteComment = (comment) => {
    const userInfo = uni.getStorageSync('userInfo');
    if (!userInfo) return false;
    // 1. 自己的评论
    if (comment.pet.id === userInfo.id) return true;
    // 2. 我是帖子作者，有权删除帖子下的任何评论
    if (post.value && post.value.pet.id === userInfo.id) return true;
    
    return false;
};

const handleDeleteComment = (comment) => {
    uni.showModal({
        title: '提示',
        content: '确定要删除这条评论吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await deleteComment(comment.id);
                    uni.showToast({ title: '删除成功' });
                    // 刷新评论列表
                    loadComments(post.value.id);
                    // 更新评论数
                    post.value.commentCount = Math.max(0, post.value.commentCount - 1);
                } catch(e) {
                    console.error(e);
                    uni.showToast({ title: '删除失败', icon: 'none' });
                }
            }
        }
    });
};
</script>

<style lang="scss">
.container {
  padding-bottom: 120rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.post-card {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .name {
        font-weight: bold;
        font-size: 30rpx;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .follow-btn {
      font-size: 24rpx;
      height: 50rpx;
      line-height: 50rpx;
      background-color: #FF9800;
      color: #fff;
      padding: 0 30rpx;
      border-radius: 25rpx;

      &.followed {
        background-color: #eee;
        color: #999;
      }
    }
  }

  .post-content {
    margin-bottom: 20rpx;
    font-size: 32rpx;
    line-height: 1.6;
  }

  .post-images {
    margin-bottom: 20rpx;

    .img {
      width: 100%;
      border-radius: 8rpx;
      margin-bottom: 10rpx;
    }
  }

  .post-stats {
    font-size: 26rpx;
    color: #999;
    display: flex;
    justify-content: flex-end;

    .stat {
      margin-left: 30rpx;
    }
  }
}

.comment-section {
  background-color: #fff;
  padding: 30rpx;

  .section-title {
    font-weight: bold;
    margin-bottom: 20rpx;
    font-size: 30rpx;
  }

  .comment-list {
    .comment-item {
      display: flex;
      margin-bottom: 30rpx;

      .c-avatar {
        width: 70rpx;
        height: 70rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        background-color: #eee;
      }

      .c-content {
        flex: 1;

        .c-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10rpx;

          .c-name {
            font-size: 28rpx;
            color: #666;
          }

          .c-time {
            font-size: 24rpx;
            color: #ccc;
          }
        }

        .c-text {
          font-size: 28rpx;
          color: #333;
        }
      }

      .c-action {
          display: flex;
          align-items: center;
          padding-left: 20rpx;
          
          .delete-text {
              font-size: 24rpx;
              color: #999;
              padding: 10rpx;
          }
      }
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 40rpx;
    }
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .comment-input {
    flex: 1;
    height: 70rpx;
    background-color: #f5f5f5;
    border-radius: 35rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
  }

  .action {
    margin-left: 30rpx;

    .icon {
      font-size: 50rpx;
    }
  }
}
</style>
