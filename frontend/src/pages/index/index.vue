<template>
  <view class="container">
    <!-- 分类 Tab -->
    <scroll-view scroll-x enhanced :show-scrollbar="false" class="category-tabs" :scroll-into-view="'tab-' + currentCategory">
      <view class="category-tabs_placeholder"></view>
      <view class="tab-item" :class="{ active: currentCategory === 0 }" @click="changeCategory(0)" id="tab-0">
        全部
      </view>
      <view v-for="cat in categories" :key="cat.id" class="tab-item" :class="{ active: currentCategory === cat.id }"
        @click="changeCategory(cat.id)" :id="'tab-' + cat.id">
        {{ cat.name }}
      </view>
    </scroll-view>

    <!-- 左右滑动切换内容 -->
    <swiper class="content-swiper" :current="currentSwiperIndex" @change="onSwiperChange">
      <!-- 全部 Tab 的内容 -->
      <swiper-item>
        <scroll-view scroll-y class="post-scroll" @scrolltolower="onScrollToLower">
          <view class="post-list">
            <post-card v-for="post in posts" :key="post.id" :post="post" @click="goDetail(post.id)"
              @like="handleLike(post)" @follow-change="onFollowChange" />
            <view v-if="loading" class="loading">加载中...</view>
            <view v-if="!loading && posts.length === 0" class="empty">暂无内容</view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- 各个分类 Tab 的内容 -->
      <swiper-item v-for="cat in categories" :key="cat.id">
        <scroll-view scroll-y class="post-scroll" @scrolltolower="onScrollToLower">
          <view class="post-list">
            <!-- 这里为了演示简单，所有 swiper-item 共用 posts 数据，
                  实际生产环境通常会为每个 Tab 维护独立的 list 数据以避免切换时闪烁或重新加载。
                  但鉴于当前代码结构，切换 Tab 时会重新请求 loadPosts，所以共用一个 posts 也是可行的方案（切换时显示 loading）。
             -->
            <post-card v-for="post in posts" :key="post.id" :post="post" @click="goDetail(post.id)"
              @like="handleLike(post)" @follow-change="onFollowChange" />
            <view v-if="loading" class="loading">加载中...</view>
            <view v-if="!loading && posts.length === 0" class="empty">暂无内容</view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { getCategories, getPostList, likePost } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const categories = ref([]);
const currentCategory = ref(0);
const posts = ref([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);

// 计算当前 swiper 的 index
// 0 对应 "全部"，1 对应 categories[0]，以此类推
const currentSwiperIndex = computed(() => {
  if (currentCategory.value === 0) return 0;
  const index = categories.value.findIndex(c => c.id === currentCategory.value);
  return index + 1;
});

onMounted(async () => {
  await loadCategories();
  // 初始加载
  loadPosts(true);
});

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

	loadPosts(true);
    // const needRefresh = uni.getStorageSync('needRefreshIndex');
    // if (needRefresh) {
    //     uni.removeStorageSync('needRefreshIndex');
    //     loadPosts(true);
    // } else {
    //     if (posts.value.length === 0 && !loading.value) {
    //         loadPosts(true);
    //     }
    // }
});

onPullDownRefresh(() => {
  loadPosts(true).then(() => {
    uni.stopPullDownRefresh();
  });
});

const onScrollToLower = () => {
  if (hasMore.value) {
    page.value++;
    loadPosts();
  }
};

const loadCategories = async () => {
  try {
    const res = await getCategories();
    categories.value = res.data.list;
  } catch (e) {
    console.error(e);
  }
};

const changeCategory = (id) => {
  if (currentCategory.value === id) return;
  currentCategory.value = id;
  // loadPosts 会在 watch currentCategory 或者 swiper change 中触发吗？
  // 由于 swiper :current 绑定了 currentSwiperIndex，修改 currentCategory 会导致 swiper 切换
  // swiper 切换会触发 @change -> onSwiperChange
  // 所以这里不需要手动调 loadPosts，除非 swiper change 没触发（例如点的是同一个？）
  // 上面第一行已经判断了 id 不同。

  // 但是，如果仅仅修改 currentCategory，swiper 的 current 变了，会触发动画切换，
  // 动画切换完成后触发 @change。
  // 我们希望点击 Tab 立即开始加载数据，还是等滑过去再加载？
  // 通常点击 Tab 立即加载体验更好。
  loadPosts(true);
};

const onSwiperChange = (e) => {
  const index = e.detail.current;
  let targetCatId = 0;
  if (index === 0) {
    targetCatId = 0;
  } else {
    targetCatId = categories.value[index - 1].id;
  }

  if (currentCategory.value !== targetCatId) {
    currentCategory.value = targetCatId;
    loadPosts(true);
  }
};

const loadPosts = async (refresh = false) => {
  // 防止切换太快导致的数据错乱，可以加一个 cancel token 机制，这里简化处理
  if (loading.value && !refresh) return;
  loading.value = true;

  if (refresh) {
    page.value = 1;
    hasMore.value = true;
    posts.value = []; // 清空，显示 loading
  }

  try {
    const res = await getPostList({
      categoryId: currentCategory.value || undefined,
      page: page.value,
      pageSize: 10
    });

    const list = res.data.list;

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

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` });
};

const handleLike = async (post) => {
  try {
    await likePost(post.id);
    if (post.liked) {
      post.liked = false;
      post.likeCount--;
    } else {
      post.liked = true;
      post.likeCount++;
    }
    uni.setStorageSync('postLikeUpdated', {
      id: post.id,
      liked: post.liked,
      likeCount: post.likeCount
    });
  } catch (e) {
    if (e.code === 401) {
      uni.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
    }
  }
};

const onPostDeleted = (postId) => {
  posts.value = posts.value.filter(p => p.id !== postId);
};

const onFollowChange = ({ petId, isFollowing }) => {
  posts.value.forEach(post => {
    if (post.pet.id === petId) {
      post.isFollowing = isFollowing;
    }
  });
};
</script>

<style lang="scss">
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FFFBF0; // 暖米色背景
  overflow: hidden;
}

.category-tabs_placeholder {
  display: inline-block;
  width: 20rpx;
  // 隐藏滚动条
}

.category-tabs {
  height: 100rpx;
  background-color: transparent; // 透明背景，融入页面
  white-space: nowrap;
  flex-shrink: 0;
  z-index: 10;
  padding: 0 20rpx;
  box-sizing: border-box;

  .tab-item {
    display: inline-block;
    padding: 10rpx 32rpx;
    margin-right: 20rpx;
    margin-top: 20rpx; // 垂直居中微调
    line-height: 1.5;
    font-size: 28rpx;
    color: #999;
    border-radius: 34rpx;
    background-color: #fff;
    transition: all 0.3s ease;

    &.active {
      color: #fff;
      font-weight: 600;
      background: linear-gradient(135deg, #71C5DA 0%, #71C5DA 100%);
      box-shadow: 0 4rpx 12rpx rgba(113, 197, 218, 0.3);
      transform: scale(1.05);

      &::after {
        display: none; // 移除下划线
      }
    }
  }
}

.content-swiper {
  flex: 1;
  height: 0;

  .post-scroll {
    height: 100%;
  }
}

.post-list {
  padding: 24rpx;
  padding-bottom: 40rpx;

  .loading,
  .empty {
    text-align: center;
    padding: 60rpx;
    color: #ccc;
    font-size: 26rpx;

    // 增加空状态插图占位（文字描述）
    &.empty::before {
      content: '🐾';
      display: block;
      font-size: 64rpx;
      margin-bottom: 20rpx;
    }
  }
}
</style>
