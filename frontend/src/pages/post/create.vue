<template>
  <view class="container">
    <textarea class="content-input" v-model="content" placeholder="分享宠物的趣事..." maxlength="500" />
    
    <view class="image-list">
      <view class="image-item" v-for="(img, index) in images" :key="index">
        <image :src="img" mode="aspectFill" class="img" />
        <view class="delete" @click="deleteImage(index)">×</view>
      </view>
      
      <view class="upload-btn" @click="chooseImage" v-if="images.length < 9">
        <text class="icon">+</text>
      </view>
    </view>
    
    <view class="setting-item">
      <text class="label">选择分类</text>
      <picker :range="categories" range-key="name" @change="onCategoryChange">
        <view class="value">
          {{ selectedCategory ? selectedCategory.name : '请选择' }}
          <text class="arrow">></text>
        </view>
      </picker>
    </view>
    
    <button class="btn-primary submit-btn" @click="handleSubmit" :loading="loading">发布</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCategories, createPost, uploadImages } from '@/api/index';

const content = ref('');
const images = ref([]); // 本地预览路径
const categories = ref([]);
const selectedCategory = ref(null);
const loading = ref(false);

onMounted(async () => {
  try {
    const res = await getCategories();
    categories.value = res.data.list;
  } catch (e) {
    console.error(e);
  }
});

const chooseImage = () => {
  // uni.chooseImage({
  //   count: 9 - images.value.length,
  //   success: (res) => {
  //     images.value = [...images.value, ...res.tempFilePaths];
  //   }
  // });

  // 兼容处理 低版本：uni.chooseImage; 高版本：uni.chooseMedia
  if(uni.chooseImage) {
    uni.chooseImage({
      count: 9 - images.value.length,
      success: (res) => {
        images.value = [...images.value, ...res.tempFilePaths];
      }
    });
  } else if(uni.chooseMedia) {
    uni.chooseMedia({
      count: 9 - images.value.length,
      success: (res) => {
        images.value = [...images.value, ...res.tempFilePaths];
      }
    });
  }

};

const deleteImage = (index) => {
  images.value.splice(index, 1);
};

const onCategoryChange = (e) => {
  selectedCategory.value = categories.value[e.detail.value];
};

const handleSubmit = async () => {
  if (!content.value && images.value.length === 0) {
    uni.showToast({ title: '写点什么吧', icon: 'none' });
    return;
  }
  if (!selectedCategory.value) {
    uni.showToast({ title: '请选择分类', icon: 'none' });
    return;
  }
  
  loading.value = true;
  try {
    // 方案一：先上传图片，获取 URL 后再发布帖子
    let uploadedUrls = [];
    if (images.value.length > 0) {
      console.log('images.value', images.value);
      uploadedUrls = await uploadImages(images.value);
    }

    await createPost({
      content: content.value,
      images: uploadedUrls,
      categoryId: selectedCategory.value.id
    });
    
    uni.showToast({ title: '发布成功' });
    setTimeout(() => {
      // 重置并跳转
      content.value = '';
      images.value = [];
      selectedCategory.value = null;
      uni.switchTab({ url: '/pages/index/index' });
    }, 1500);
    
  } catch (e) {
    console.error(e);
    uni.showToast({ title: typeof e === 'string' ? e : '发布失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  background-color: #FFFBF0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-input {
  width: 100%;
  height: 300rpx;
  font-size: 32rpx;
  line-height: 1.6;
  margin-bottom: 40rpx;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: transparent;
  color: #333;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 60rpx;
  gap: 20rpx;
  
  .image-item {
    position: relative;
    width: 210rpx;
    height: 210rpx;
    // margin-right: 15rpx; margin-bottom: 15rpx; 使用 gap 代替
    
    .img {
      width: 100%;
      height: 100%;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
    }
    
    .delete {
      position: absolute;
      top: -16rpx;
      right: -16rpx;
      width: 48rpx;
      height: 48rpx;
      background-color: #FF6B81;
      color: #fff;
      text-align: center;
      line-height: 44rpx; // 视觉修正
      border-radius: 50%;
      font-size: 32rpx;
      border: 4rpx solid #fff;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
    }
  }
  
  .upload-btn {
    width: 210rpx;
    height: 210rpx;
    background-color: #fff;
    border: 4rpx dashed #FFD180;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20rpx;
    box-sizing: border-box;
    
    .icon {
      font-size: 80rpx;
      color: #FFD180;
      font-weight: 300;
    }
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx 30rpx;
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  margin-bottom: 40rpx;
  
  .label {
    font-size: 30rpx;
    color: #333;
    font-weight: 600;
    display: flex;
    align-items: center;
    
    &::before {
      content: '#';
      color: #FF9800;
      font-size: 36rpx;
      margin-right: 10rpx;
      font-weight: 800;
    }
  }
  
  .value {
    font-size: 30rpx;
    color: #666;
    display: flex;
    align-items: center;
    
    .arrow {
      margin-left: 16rpx;
      color: #ccc;
      font-weight: 700;
    }
  }
}

.submit-btn {
  margin-top: auto; // 推到底部
  margin-bottom: 40rpx;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: 600;
  background: linear-gradient(90deg, #FFB74D, #FF9800);
  box-shadow: 0 8rpx 20rpx rgba(255, 152, 0, 0.3);
  border: none;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>
