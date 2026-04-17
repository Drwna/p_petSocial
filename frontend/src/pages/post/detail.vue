<template>
  <view class="container" v-if="post">
    <!-- 帖子主体 -->
    <view class="post-card">
      <view class="post-header">
        <image class="avatar" :src="post.pet?.avatar || '/static/default-avatar.png'" mode="aspectFill" @click="goProfile" />
        <view class="info" @click="goProfile">
          <view class="name-row">
            <text class="name">{{ post.pet?.petName || '已注销用户' }}</text>
            <text class="badge pin-badge" v-if="post.isPinned">置顶</text>
            <text class="badge feature-badge" v-if="post.isFeatured">精品</text>
          </view>
          <text class="time">{{ formatTime(post.createTime) }}</text>
        </view>
        <!-- 关注按钮 -->
        <button v-if="!isSelf && !isFollowing" class="follow-btn" @click="handleFollow">关注</button>
        <button v-if="!isSelf && isFollowing" class="follow-btn followed" @click="handleUnfollow">已关注</button>
        
        <!-- 更多操作 -->
        <view class="more-btn" v-if="!isSelf" @click.stop="handleMore">
          <text class="more-icon">···</text>
        </view>
      </view>

      <view class="post-content">
        <view class="topic-list" v-if="post.topics && post.topics.length > 0">
          <text class="topic-tag" v-for="topic in post.topics" :key="topic.id" @click="goTopic(topic.id, topic.name)">#{{ topic.name }}#</text>
        </view>
        <text class="text">{{ post.content }}</text>
      </view>

      <view class="post-images" v-if="post.images && post.images.length">
        <image v-for="(img, index) in post.images" :key="index" :src="img" class="img" mode="widthFix"
          @click="previewImage(index)" />
      </view>

      <view class="post-stats">
        <view class="like-stat" @click="handleLike">
          <text class="icon">{{ post.liked ? '❤️' : '🤍' }}</text>
          <text>点赞 {{ post.likeCount }}</text>
        </view>
        <view class="like-stat" @click="handleBookmark">
          <text class="icon">{{ post.isBookmarked ? '⭐' : '☆' }}</text>
          <text>{{ post.isBookmarked ? '已收藏' : '收藏' }}</text>
        </view>
        <text class="stat">评论 {{ post.commentCount }}</text>
      </view>
    </view>

    <!-- 评论列表 -->
    <view class="comment-section">
      <view class="section-title">评论</view>
      <view class="comment-list">
        <view class="comment-item" v-for="comment in comments" :key="comment.id">
          <image class="c-avatar" :src="comment.pet?.avatar || '/static/default-avatar.png'" mode="aspectFill" @click="goUserProfile(comment.pet?.id)" />
          <view class="c-content">
            <view class="c-header">
              <text class="c-name" @click="goUserProfile(comment.pet?.id)">{{ comment.pet?.petName || '已注销用户' }}</text>
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

    <view class="footer-bar">
      <view class="comment-input_placeholder"></view>
      <input class="comment-input" v-model="commentContent" placeholder="说点什么..." confirm-type="send"
        @confirm="sendComment" />
      <view class="comment-input_placeholder"></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { getPostDetail, getCommentList, createComment, likePost, followPet, unfollowPet, getFollowStatus, deleteComment, toggleBookmark, dislikePost, blockPet } from '@/api/index';

const post = ref(null);
const comments = ref([]);
const commentContent = ref('');
const isFollowing = ref(false);
const isSelf = ref(false);

const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

onLoad((options) => {
  if (options.id) {
    loadPost(options.id);
    loadComments(options.id, true);
  }
});

onReachBottom(() => {
  if (hasMore.value && post.value) {
    page.value++;
    loadComments(post.value.id);
  }
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

const loadPost = async (id) => {
  try {
    const res = await getPostDetail(id);
    const data = res.data;
    if (typeof data.images === 'string') {
      try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
    }
    const likeUpdate = uni.getStorageSync('postLikeUpdated');
    if (likeUpdate && likeUpdate.id === data.id) {
      data.liked = likeUpdate.liked;
      data.likeCount = likeUpdate.likeCount;
    }
    post.value = data;

    // Check if self
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo && data.pet && userInfo.id === data.pet.id) {
      isSelf.value = true;
    } else if (userInfo && data.pet) {
      checkFollowStatus(data.pet.id);
    }
  } catch (e) {
    console.error(e);
  }
};

const loadComments = async (id, refresh = false) => {
  if (loading.value && !refresh) return;
  loading.value = true;
  
  if (refresh) {
    page.value = 1;
    hasMore.value = true;
    comments.value = [];
  }

  try {
    const res = await getCommentList({
        postId: id,
        page: page.value,
        size: 10
    });
    // 假设 API 返回的结构是 { code: 0, data: { list: [], total: ... } }
    const list = res.data.list || res.data || [];
    
    if (refresh) {
      comments.value = list;
    } else {
      comments.value = [...comments.value, ...list];
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
    uni.showToast({ title: '已取消关注', icon: 'none' });
  } catch (e) { console.error(e); }
};

const handleMore = () => {
  const options = ['不感兴趣', '屏蔽作者'];
  uni.showActionSheet({
    itemList: options,
    success: async (res) => {
      if (res.tapIndex === 0) {
        // 不感兴趣
        try {
          await dislikePost(post.value.id);
          uni.showToast({ title: '已减少此类内容推荐', icon: 'none' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } catch (e) {
          console.error(e);
        }
      } else if (res.tapIndex === 1) {
        // 屏蔽作者
        uni.showModal({
          title: '提示',
          content: `确定屏蔽作者 ${post.value.pet?.petName} 吗？屏蔽后将不再看到该作者的内容。`,
          success: async (modalRes) => {
            if (modalRes.confirm) {
              try {
                await blockPet(post.value.pet.id);
                uni.showToast({ title: '已屏蔽该作者', icon: 'none' });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1000);
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

const handleLike = async () => {
  try {
    await likePost(post.value.id);
    post.value.liked = !post.value.liked;
    post.value.likeCount += post.value.liked ? 1 : -1;
    uni.setStorageSync('postLikeUpdated', {
      id: post.value.id,
      liked: post.value.liked,
      likeCount: post.value.likeCount
    });
  } catch (e) { console.error(e); }
};

const handleBookmark = async () => {
  try {
    const res = await toggleBookmark(post.value.id);
    post.value.isBookmarked = res.data.bookmarked;
    uni.setStorageSync('postBookmarkUpdated', {
      id: post.value.id,
      isBookmarked: post.value.isBookmarked
    });
    uni.showToast({ title: res.msg, icon: 'none' });
  } catch (e) { console.error(e); }
};

const sendComment = async () => {
  if (!commentContent.value) return;
  try {
    await createComment({ postId: post.value.id, content: commentContent.value });
    commentContent.value = '';
    uni.showToast({ title: '评论成功' });
    loadComments(post.value.id, true);
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
  if (!post.value.pet) return;
  if (isSelf.value) {
    uni.switchTab({ url: '/pages/profile/profile' });
  } else {
    uni.navigateTo({ url: `/pages/profile/other?id=${post.value.pet.id}` });
  }
};

const goTopic = (topicId, topicName) => {
  uni.setStorageSync('filterTopic', { id: topicId, name: topicName });
  uni.$emit('refreshIndex');
  uni.switchTab({ 
    url: '/pages/index/index'
  });
};

const goUserProfile = (userId) => {
  if (!userId) return;
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
    if (comment.pet && comment.pet.id === userInfo.id) return true;
    // 2. 我是帖子作者，有权删除帖子下的任何评论
    if (post.value && post.value.pet && post.value.pet.id === userInfo.id) return true;
    
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
                    loadComments(post.value.id, true);
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
  background-color: #FFFBF0;
  min-height: 100vh;
}

// 详情页复用 PostCard 样式，但做微调
.post-card {
  background-color: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 24rpx;
  border-radius: 0 0 32rpx 32rpx; // 只有底部圆角，顶部直角（沉浸感）
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    .avatar {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      margin-right: 24rpx;
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
        margin-bottom: 6rpx;
      }

      .name {
        font-weight: 700;
        font-size: 34rpx;
        color: #333;
        margin-right: 12rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-shrink: 1;
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
      height: 56rpx;
      line-height: 56rpx;
      background: linear-gradient(90deg, #71C5DA, #71C5DA);
      color: #fff;
      padding: 0 36rpx;
      border-radius: 28rpx;
      font-weight: 600;
      box-shadow: 0 4rpx 10rpx rgba(113, 197, 218, 0.2);
      flex-shrink: 0;
      white-space: nowrap;

      &.followed {
        background: #f5f5f5;
        color: #999;
        box-shadow: none;
      }
    }

    .more-btn {
      padding: 12rpx 20rpx;
      flex-shrink: 0;
      
      .more-icon {
        font-size: 40rpx;
        color: #999;
        font-weight: bold;
        line-height: 1;
      }

      &:active {
        opacity: 0.7;
      }
    }
    
    .delete-btn {
        padding: 12rpx;
        margin-left: 16rpx;
        flex-shrink: 0;
        .delete-icon {
            width: 36rpx;
            height: 36rpx;
        }
    }
  }

  .post-content {
    margin-bottom: 32rpx;
    font-size: 34rpx;
    line-height: 1.8;
    color: #333;
    letter-spacing: 0.5rpx;
    
    .topic-list {
      display: inline-block;
      margin-bottom: 12rpx;
    }
    
    .topic-tag {
      color: #71C5DA;
      font-size: 32rpx;
      margin-right: 16rpx;
      font-weight: 500;
    }
    
    .text {
      word-break: break-word;
    }
  }

  .post-images {
    margin-bottom: 32rpx;

    .img {
      width: 100%;
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    }
  }

  .post-stats {
    font-size: 26rpx;
    color: #999;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f9f9f9;

    .stat {
      margin-left: 30rpx;
      background-color: #f9f9f9;
      padding: 6rpx 20rpx;
      border-radius: 20rpx;
    }

    .like-stat {
      display: flex;
      align-items: center;
      margin-left: 30rpx;
      background-color: #f9f9f9;
      padding: 6rpx 20rpx;
      border-radius: 20rpx;

      .icon {
        font-size: 32rpx;
        margin-right: 8rpx;
      }
    }
  }
}

.comment-section {
  background-color: #fff;
  padding: 30rpx;
  margin: 0 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);

  .section-title {
    font-weight: 700;
    margin-bottom: 30rpx;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    
    &::before {
        content: '';
        width: 8rpx;
        height: 28rpx;
        background-color: #71C5DA;
        border-radius: 4rpx;
        margin-right: 16rpx;
    }
  }

  .comment-list {
    .comment-item {
      display: flex;
      margin-bottom: 40rpx;

      .c-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 24rpx;
        background-color: #eee;
        flex-shrink: 0;
      }

      .c-content {
        flex: 1;

        .c-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12rpx;

          .c-name {
            font-size: 28rpx;
            font-weight: 600;
            color: #555;
          }

          .c-time {
            font-size: 22rpx;
            color: #ccc;
          }
        }

        .c-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.5;
          background-color: #f9f9f9;
          padding: 16rpx 24rpx;
          border-radius: 0 24rpx 24rpx 24rpx; // 气泡样式
          display: inline-block;
        }
      }

      .c-action {
          display: flex;
          align-items: center;
          padding-left: 20rpx;
          
          .delete-text {
              font-size: 22rpx;
              color: #999;
              padding: 10rpx;
              background-color: #f5f5f5;
              border-radius: 8rpx;
          }
      }
    }

    .empty {
      text-align: center;
      color: #ccc;
      padding: 40rpx;
      font-size: 26rpx;
    }
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 0;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);

  .comment-input {
    flex: 1;
    height: 76rpx;
    background-color: #f5f5f5;
    border-radius: 38rpx;
    padding: 0 36rpx;
    font-size: 28rpx;
    color: #333;
  }

  .comment-input_placeholder{
    width: 30rpx;
  }

}
</style>
