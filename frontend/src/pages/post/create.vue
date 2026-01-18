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
  background-color: #fff;
  min-height: 100vh;
}

.content-input {
  width: 100%;
  height: 300rpx;
  font-size: 30rpx;
  line-height: 1.5;
  margin-bottom: 30rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40rpx;
  
  .image-item {
    position: relative;
    width: 220rpx;
    height: 220rpx;
    margin-right: 15rpx;
    margin-bottom: 15rpx;
    
    &:nth-child(3n) {
      margin-right: 0;
    }
    
    .img {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
    }
    
    .delete {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background-color: rgba(0,0,0,0.5);
      color: #fff;
      text-align: center;
      line-height: 36rpx;
      border-radius: 50%;
      font-size: 30rpx;
    }
  }
  
  .upload-btn {
    width: 220rpx;
    height: 220rpx;
    background-color: #f8f8f8;
    border: 2rpx dashed #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8rpx;
    
    .icon {
      font-size: 60rpx;
      color: #ccc;
    }
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-top: 1rpx solid #f5f5f5;
  border-bottom: 1rpx solid #f5f5f5;
  
  .label {
    font-size: 30rpx;
    color: #333;
  }
  
  .value {
    font-size: 30rpx;
    color: #666;
    display: flex;
    align-items: center;
    
    .arrow {
      margin-left: 10rpx;
      color: #999;
    }
  }
}

.submit-btn {
  margin-top: 60rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
}
</style>
