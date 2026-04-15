<template>
  <view class="container">
    <!-- 搜索区域 -->
    <view class="search-header">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="keyword" placeholder="输入宠物名称，如：拉布拉多" @confirm="handleSearch" confirm-type="search" />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="state-container">
      <view class="loading-spinner"></view>
      <text class="state-text">正在寻找宠物信息...</text>
    </view>

    <!-- 搜索结果展示 -->
    <scroll-view scroll-y class="result-container" v-if="petData && !loading">
      <view class="pet-card">
        <view class="pic-wrapper">
          <image v-if="petData.pic" class="pet-pic" :src="petData.pic" mode="aspectFill"></image>
          <view v-else class="no-pic-placeholder">
            <text class="no-pic-icon">📷</text>
            <text class="no-pic-text">未找到相关图片</text>
          </view>
          <view class="pic-overlay"></view>
        </view>
        
        <view class="pet-header">
          <text class="pet-name">{{ petData.name }}</text>
          <text class="pet-engname">{{ petData.engname }}</text>
        </view>

        <view class="info-grid">
          <view class="info-item">
            <text class="label">祖籍</text>
            <text class="value">{{ petData.nation || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="label">寿命</text>
            <text class="value">{{ petData.life || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="label">价格</text>
            <text class="value">{{ petData.price || '未知' }}</text>
          </view>
        </view>

        <view class="traits-section">
          <view class="section-title">
            <text class="title-text">特点评分</text>
          </view>
          <view class="traits-grid">
            <view class="trait-item" v-for="(trait, index) in traits" :key="index">
              <text class="trait-label">{{ trait.label }}</text>
              <view class="stars">
                <text v-for="n in 5" :key="n" class="star" :class="{ active: n <= trait.value }">★</text>
              </view>
            </view>
          </view>
        </view>

        <view class="detail-section">
          <view class="section-title">
            <text class="title-text">基本特征</text>
          </view>
          <view class="detail-content">
            <text class="detail-text">{{ petData.message }}</text>
          </view>
        </view>

        <view class="detail-section">
          <view class="section-title">
            <text class="title-text">喂养提示</text>
          </view>
          <view class="detail-content">
            <text class="detail-text">{{ petData.feed }}</text>
          </view>
        </view>

        <view class="detail-section" v-if="petData.relative">
          <view class="section-title">
            <text class="title-text">外貌特征</text>
          </view>
          <view class="detail-content">
            <text class="detail-text">{{ petData.relative }}</text>
          </view>
        </view>

        <view class="detail-section" v-if="petData.pick">
          <view class="section-title">
            <text class="title-text">挑选建议</text>
          </view>
          <view class="detail-content">
            <text class="detail-text">{{ petData.pick }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态/初始状态 -->
    <view v-if="!petData && !loading" class="state-container empty-state">
      <text class="empty-icon">🐾</text>
      <text class="state-text">{{ hasSearched ? '未找到相关宠物百科信息' : '探索你最喜爱的宠物百科' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const keyword = ref('');
const loading = ref(false);
const petData = ref(null);
const hasSearched = ref(false);

const traits = computed(() => {
  if (!petData.value) return [];
  const data = petData.value;
  return [
    { label: '粘人程度', value: data.sticky },
    { label: '喜叫程度', value: data.shout },
    { label: '友善程度', value: data.friendly },
    { label: '掉毛程度', value: data.lint },
    { label: '美容需求', value: data.beauty },
    { label: '体味程度', value: data.odour },
    { label: '口水程度', value: data.saliva },
    { label: '可训程度', value: data.active }
  ];
});

const handleSearch = () => {
  if (!keyword.value.trim()) {
    uni.showToast({ title: '请输入搜索关键字', icon: 'none' });
    return;
  }

  loading.value = true;
  hasSearched.value = true;
  petData.value = null;

  uni.request({
    url: 'https://api.jisuapi.com/pet/query',
    method: 'GET',
    data: {
      appkey: '1e866d42294f12bb',
      name: keyword.value.trim()
    },
    success: (res) => {
      // 极速数据接口返回的 status 可能为字符串或数字的 '0' 代表成功
      if (res.data && (res.data.status === 0 || res.data.status === '0')) {
        petData.value = res.data.result;
        petData.value.pic = '';

        // 尝试从 message 中提取“（英语：xxx）”格式的英文名，如果没有则使用返回的 engname
        let engName = petData.value.engname || '';
        const match = petData.value.message?.match(/[（\(]英语[：:](.*?)[）\)]/);
        if (match && match[1]) {
          engName = match[1].trim();
        }

        if (engName) {
          // 清理可能包含的特殊符号以优化搜索
          const queryName = engName.replace(/[-\s]/g, '');
          
          // 判断是否包含中文字符
          const hasChinese = /[\u4e00-\u9fa5]/.test(queryName);
          const requestData = {
            query: queryName,
            per_page: 1,
            client_id: 'U7HcWBj7tAPpc0eath3_1XKpfQa2gh-kcjuMScHO_lo'
          };
          
          if (hasChinese) {
            requestData.lang = 'zh-Hans';
          }

          uni.request({
            url: 'https://api.unsplash.com/search/photos',
            method: 'GET',
            data: requestData,
            success: (unsplashRes) => {
              if (unsplashRes.data && unsplashRes.data.results && unsplashRes.data.results.length > 0) {
                // 使用 Unsplash 的高质量图片替换默认的极速数据图片
                petData.value.pic = unsplashRes.data.results[0].urls.small;
              }
            },
            fail: (err) => {
              console.error('Unsplash 图片获取失败', err);
            }
          });
        }
      } else {
        petData.value = null;
        uni.showToast({
          title: res.data?.msg || '未找到相关信息',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('搜索失败', err);
      uni.showToast({ title: '网络请求失败', icon: 'none' });
    },
    complete: () => {
      loading.value = false;
    }
  });
};
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #eef9fb, #f5f7fa);
}

.search-header {
  padding: 30rpx 40rpx;
  background: transparent;
  z-index: 10;
}

.search-box {
  display: flex;
  background-color: #fff;
  align-items: center;
  border-radius: 50rpx;
  padding: 10rpx;
  box-shadow: 0 8rpx 24rpx rgba(113, 197, 218, 0.15);
  
  .search-icon {
    font-size: 32rpx;
    margin-left: 20rpx;
    color: #999;
  }

  .search-input {
    flex: 1;
    height: 70rpx;
    background-color: transparent;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }
  
  .search-btn {
    margin-left: 10rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: linear-gradient(135deg, #71C5DA, #5ab5cc);
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 40rpx;
    padding: 0 40rpx;
    box-shadow: 0 4rpx 10rpx rgba(113, 197, 218, 0.3);
    &::after {
      border: none;
    }
  }
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #e0e0e0;
    border-top-color: #71C5DA;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 30rpx;
  }

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 30rpx;
    opacity: 0.8;
  }

  .state-text {
    color: #888;
    font-size: 28rpx;
    letter-spacing: 2rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-container {
  flex: 1;
  padding: 0 30rpx 40rpx;
  box-sizing: border-box;
}

.pet-card {
  background-color: #fff;
  border-radius: 30rpx;
  overflow: hidden;
  padding-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);

  .pic-wrapper {
    position: relative;
    width: 100%;
    height: 460rpx;

    .pet-pic {
      width: 100%;
      height: 100%;
      background-color: #eee;
    }

    .no-pic-placeholder {
      width: 100%;
      height: 100%;
      background-color: #f0f4f8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      
      .no-pic-icon {
        font-size: 80rpx;
        margin-bottom: 20rpx;
        opacity: 0.6;
      }
      
      .no-pic-text {
        font-size: 28rpx;
        letter-spacing: 2rpx;
      }
    }

    .pic-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100rpx;
      background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
    }
  }

  .pet-header {
    position: relative;
    margin-top: -30rpx;
    padding: 20rpx 40rpx 30rpx;
    text-align: center;

    .pet-name {
      display: block;
      font-size: 46rpx;
      font-weight: 800;
      color: #333;
      margin-bottom: 8rpx;
      letter-spacing: 2rpx;
    }

    .pet-engname {
      display: block;
      font-size: 26rpx;
      color: #999;
      font-style: italic;
    }
  }

  .info-grid {
    display: flex;
    padding: 0 30rpx 40rpx;

    .info-item {
      flex: 1;
      text-align: center;
      background: #f4fbfc;
      border-radius: 20rpx;
      padding: 24rpx 10rpx;
      margin: 0 10rpx;

      .label {
        display: block;
        font-size: 24rpx;
        color: #888;
        margin-bottom: 12rpx;
      }

      .value {
        display: block;
        font-size: 28rpx;
        color: #444;
        font-weight: bold;
      }
    }
  }

  .section-title {
    margin-bottom: 24rpx;
    padding: 0 40rpx;

    .title-text {
      position: relative;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      padding-left: 24rpx;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 28rpx;
        background: #71C5DA;
        border-radius: 6rpx;
      }
    }
  }

  .traits-section {
    padding-top: 10rpx;
    margin-bottom: 40rpx;

    .traits-grid {
      display: flex;
      flex-wrap: wrap;
      padding: 0 40rpx;

      .trait-item {
        width: 50%;
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;

        .trait-label {
          font-size: 26rpx;
          color: #666;
          width: 130rpx;
        }

        .stars {
          display: flex;
          .star {
            color: #e6e6e6;
            font-size: 28rpx;
            margin-right: 6rpx;
            &.active {
              color: #ffca28;
              text-shadow: 0 2rpx 4rpx rgba(255, 202, 40, 0.4);
            }
          }
        }
      }
    }
  }

  .detail-section {
    margin-bottom: 40rpx;

    &:last-child {
      margin-bottom: 20rpx;
    }

    .detail-content {
      padding: 0 40rpx;

      .detail-text {
        display: block;
        background: #f9f9f9;
        padding: 30rpx;
        border-radius: 20rpx;
        font-size: 28rpx;
        color: #555;
        line-height: 1.7;
        text-align: justify;
        letter-spacing: 1rpx;
      }
    }
  }
}
</style>