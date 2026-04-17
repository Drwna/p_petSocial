<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索贴子内容..." 
          class="search-input" 
          @confirm="onSearch" 
          confirm-type="search"
        />
        <text v-if="searchQuery" class="clear-icon" @click="clearSearch">✖</text>
      </view>
    </view>
    
    <!-- 话题过滤提示 -->
    <view class="topic-filter-bar" v-if="filterTopic">
      <text class="topic-filter-text">正在查看话题：#{{ filterTopic.name }}</text>
      <view class="topic-filter-clear" @click="clearTopicFilter">清除筛选</view>
    </view>

    <!-- 分类 Tab -->
    <scroll-view scroll-x enhanced :show-scrollbar="false" class="category-tabs" :scroll-into-view="'tab-' + currentCategory">
      <view class="category-tabs_placeholder"></view>
      <view class="tab-item" :class="{ active: currentCategory === 'recommend' }" @click="changeCategory('recommend')" id="tab-recommend">
        推荐
      </view>
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
      <!-- 推荐 Tab 的内容 -->
      <swiper-item>
        <scroll-view scroll-y class="post-scroll" @scrolltolower="onScrollToLower">
          <view class="post-list">
            <post-card v-for="post in (tabData['recommend'] ? tabData['recommend'].posts : [])" :key="post.id" :post="post" @click="goDetail(post.id)"
              @like="handleLike(post)" @follow-change="onFollowChange" />
            <view v-if="tabData['recommend'] && tabData['recommend'].loading" class="loading">加载中...</view>
            <view v-if="tabData['recommend'] && !tabData['recommend'].loading && tabData['recommend'].posts.length === 0" class="empty">暂无内容</view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- 全部 Tab 的内容 -->
      <swiper-item>
        <scroll-view scroll-y class="post-scroll" @scrolltolower="onScrollToLower">
          <view class="post-list">
            <post-card v-for="post in (tabData[0] ? tabData[0].posts : [])" :key="post.id" :post="post" @click="goDetail(post.id)"
              @like="handleLike(post)" @follow-change="onFollowChange" />
            <view v-if="tabData[0] && tabData[0].loading" class="loading">加载中...</view>
            <view v-if="tabData[0] && !tabData[0].loading && tabData[0].posts.length === 0" class="empty">暂无内容</view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- 各个分类 Tab 的内容 -->
      <swiper-item v-for="cat in categories" :key="cat.id">
        <scroll-view scroll-y class="post-scroll" @scrolltolower="onScrollToLower">
          <view class="post-list">
            <post-card v-for="post in (tabData[cat.id] ? tabData[cat.id].posts : [])" :key="post.id" :post="post" @click="goDetail(post.id)"
              @like="handleLike(post)" @follow-change="onFollowChange" />
            <view v-if="tabData[cat.id] && tabData[cat.id].loading" class="loading">加载中...</view>
            <view v-if="tabData[cat.id] && !tabData[cat.id].loading && tabData[cat.id].posts.length === 0" class="empty">暂无内容</view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { getCategories, getPostList, likePost } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const categories = ref([]);
const currentCategory = ref('recommend');
// 独立每个 Tab 的数据流
const tabData = reactive({
  'recommend': { posts: [], page: 1, hasMore: true, loading: false, loaded: false },
  0: { posts: [], page: 1, hasMore: true, loading: false, loaded: false }
});

const searchQuery = ref('');
const filterTopic = ref(null);

const refreshAllTabs = () => {
  Object.keys(tabData).forEach(key => {
    tabData[key].loaded = false;
    tabData[key].posts = [];
  });
  loadPosts(true);
};

const onSearch = () => {
  refreshAllTabs();
};

const clearSearch = () => {
  searchQuery.value = '';
  refreshAllTabs();
};

const clearTopicFilter = () => {
  filterTopic.value = null;
  uni.removeStorageSync('filterTopic');
  refreshAllTabs();
};

// 计算当前 swiper 的 index
// 0 对应 "推荐"，1 对应 "全部"，2 对应 categories[0]，以此类推
const currentSwiperIndex = computed(() => {
  if (currentCategory.value === 'recommend') return 0;
  if (currentCategory.value === 0) return 1;
  const index = categories.value.findIndex(c => c.id === currentCategory.value);
  return index + 2;
});

onMounted(async () => {
  await loadCategories();
  // 初始加载
  loadPosts(true);

  // 监听来自其他页面的刷新请求
  uni.$on('refreshIndex', () => {
    checkFilterTopic();
  });
});

const checkFilterTopic = () => {
  // 兼容老的 filterTopicId 逻辑和新的 filterTopic 逻辑
  const storedTopic = uni.getStorageSync('filterTopic');
  const storedTopicId = uni.getStorageSync('filterTopicId');

  if (storedTopic) {
    if (!filterTopic.value || filterTopic.value.id !== storedTopic.id) {
      filterTopic.value = storedTopic;
      refreshAllTabs();
    }
  } else if (storedTopicId) {
    if (!filterTopic.value || filterTopic.value.id !== storedTopicId) {
      filterTopic.value = { id: storedTopicId, name: '未命名话题' };
      refreshAllTabs();
    }
  } else if (filterTopic.value) {
    filterTopic.value = null;
    refreshAllTabs();
  } else {
    // 首次加载或者切回来，如果没有加载过当前分类，则加载
    const currentTab = tabData[currentCategory.value];
    if (currentTab && !currentTab.loaded && !currentTab.loading) {
      loadPosts(true);
    }
  }
};

onShow(() => {
    const likeUpdate = uni.getStorageSync('postLikeUpdated');
    if (likeUpdate && likeUpdate.id) {
        // 更新所有 tab 中对应的帖子
        Object.keys(tabData).forEach(key => {
          const target = tabData[key].posts.find(p => p.id === likeUpdate.id);
          if (target) {
              target.liked = likeUpdate.liked;
              target.likeCount = likeUpdate.likeCount;
          }
        });
        uni.removeStorageSync('postLikeUpdated');
    }

    checkFilterTopic();
});

onPullDownRefresh(() => {
  loadPosts(true).then(() => {
    uni.stopPullDownRefresh();
  });
});

const onScrollToLower = () => {
  const tab = tabData[currentCategory.value];
  if (tab && tab.hasMore) {
    tab.page++;
    loadPosts();
  }
};

const loadCategories = async () => {
  try {
    const res = await getCategories();
    categories.value = res.data.list;
    // 为每个分类初始化数据结构
    categories.value.forEach(c => {
      tabData[c.id] = { posts: [], page: 1, hasMore: true, loading: false, loaded: false };
    });
  } catch (e) {
    console.error(e);
  }
};

const changeCategory = (id) => {
  if (currentCategory.value === id) return;
  currentCategory.value = id;
  // loadPosts 会在 onSwiperChange 中触发，或者这里直接触发
  if (!tabData[id].loaded) {
    loadPosts(true);
  }
};

const onSwiperChange = (e) => {
  const index = e.detail.current;
  let targetCatId = 0;
  if (index === 0) {
    targetCatId = 'recommend';
  } else if (index === 1) {
    targetCatId = 0;
  } else {
    targetCatId = categories.value[index - 2].id;
  }

  if (currentCategory.value !== targetCatId) {
    currentCategory.value = targetCatId;
    if (!tabData[targetCatId].loaded) {
      loadPosts(true);
    }
  }
};

const loadPosts = async (refresh = false) => {
  const catId = currentCategory.value;
  const tab = tabData[catId];
  if (!tab) return;

  if (tab.loading && !refresh) return;
  tab.loading = true;

  if (refresh) {
    tab.page = 1;
    tab.hasMore = true;
    tab.posts = []; // 清空，显示 loading
  }

  try {
    const res = await getPostList({
      categoryId: (catId === 'recommend' || catId === 0) ? undefined : catId,
      isRecommend: catId === 'recommend' ? 1 : undefined,
      topicId: filterTopic.value?.id || undefined,
      keyword: searchQuery.value || '',
      page: tab.page,
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
      tab.posts = list;
    } else {
      tab.posts = [...tab.posts, ...list];
    }
    
    tab.loaded = true;
    if (list.length < 10) {
      tab.hasMore = false;
    }
  } catch (e) {
    console.error(e);
  } finally {
    tab.loading = false;
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
  Object.keys(tabData).forEach(key => {
    tabData[key].posts = tabData[key].posts.filter(p => p.id !== postId);
  });
};

const onFollowChange = ({ petId, isFollowing }) => {
  Object.keys(tabData).forEach(key => {
    tabData[key].posts.forEach(post => {
      if (post.pet.id === petId) {
        post.isFollowing = isFollowing;
      }
    });
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

.search-container {
  padding: 20rpx;
  background-color: #fff;
  flex-shrink: 0;

  .search-box {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    padding: 10rpx 24rpx;
    height: 70rpx;
    box-sizing: border-box;

    .search-icon {
      font-size: 28rpx;
      margin-right: 16rpx;
      color: #999;
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .clear-icon {
      font-size: 24rpx;
      color: #ccc;
      padding: 10rpx;
    }
  }
}

.topic-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 30rpx;
  background-color: #E8F6FA;
  
  .topic-filter-text {
    font-size: 26rpx;
    color: #71C5DA;
    font-weight: 500;
  }
  
  .topic-filter-clear {
    font-size: 24rpx;
    color: #999;
    padding: 6rpx 16rpx;
    background-color: #fff;
    border-radius: 20rpx;
  }
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
