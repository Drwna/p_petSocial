<template>
  <view class="container">
    <!-- 分类 Tab -->
    <scroll-view scroll-x class="category-tabs" :scroll-into-view="'tab-' + currentCategory">
      <view 
        class="tab-item" 
        :class="{ active: currentCategory === 0 }" 
        @click="changeCategory(0)"
        id="tab-0"
      >
        全部
      </view>
      <view 
        v-for="cat in categories" 
        :key="cat.id" 
        class="tab-item"
        :class="{ active: currentCategory === cat.id }"
        @click="changeCategory(cat.id)"
        :id="'tab-' + cat.id"
      >
        {{ cat.name }}
      </view>
    </scroll-view>
    
    <!-- 帖子列表 -->
    <view class="post-list">
      <post-card 
        v-for="post in posts" 
        :key="post.id" 
        :post="post" 
        @click="goDetail(post.id)"
        @like="handleLike(post)"
      />
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="!loading && posts.length === 0" class="empty">暂无内容</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
import { getCategories, getPostList, likePost } from '@/api/index';
import PostCard from '@/components/PostCard.vue';

const categories = ref([]);
const currentCategory = ref(0);
const posts = ref([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);

onMounted(async () => {
  await loadCategories();
  // 初始加载
  loadPosts(true);
});

onShow(() => {
    // 简单策略：如果列表空则加载，否则这里不主动刷新，依赖用户下拉
    if (posts.value.length === 0 && !loading.value) {
        loadPosts(true);
    }
});

onPullDownRefresh(() => {
  loadPosts(true).then(() => {
    uni.stopPullDownRefresh();
  });
});

onReachBottom(() => {
  if (hasMore.value) {
    page.value++;
    loadPosts();
  }
});

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
  loadPosts(true);
};

const loadPosts = async (refresh = false) => {
  if (loading.value) return;
  loading.value = true;
  
  if (refresh) {
    page.value = 1;
    hasMore.value = true;
  }
  
  try {
    const res = await getPostList({
      categoryId: currentCategory.value || undefined,
      page: page.value,
      pageSize: 10
    });
    
    const list = res.data.list;

    // 处理图片 URL，如果是相对路径可能需要拼接 BaseURL，这里假设是完整路径或者不需要
    // 如果 images 是字符串，需要 parse
    list.forEach(item => {
        if (typeof item.images === 'string') {
            try {
                item.images = JSON.parse(item.images);
            } catch(e) {
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
    await likePost(post.id); // 接口逻辑是 toggle
    // 本地更新
    if (post.liked) {
        post.liked = false;
        post.likeCount--;
    } else {
        post.liked = true;
        post.likeCount++;
    }
  } catch (e) {
    if (e.code === 401) {
        // 未登录
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
</script>

<style lang="scss">
.container {
  padding-top: 100rpx; 
  min-height: 100vh;
  background-color: #f5f5f5;
}

.category-tabs {
  position: fixed;
  top: 0; 
  /* #ifdef H5 */
  top: 44px;
  /* #endif */
  left: 0;
  width: 100%;
  height: 90rpx;
  background-color: #fff;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .tab-item {
    display: inline-block;
    padding: 0 30rpx;
    line-height: 90rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #FF9800;
      font-weight: bold;
      font-size: 30rpx;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 10rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: #FF9800;
        border-radius: 2rpx;
      }
    }
  }
}

.post-list {
  padding: 20rpx;
  .loading, .empty {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 26rpx;
  }
}
</style>
