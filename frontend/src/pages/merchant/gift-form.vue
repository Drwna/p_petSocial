<template>
  <view class="container">
    <view class="form-item">
      <text class="label">礼品名称</text>
      <input class="input" v-model="form.name" placeholder="请输入礼品名称" />
    </view>
    <view class="form-item">
      <text class="label">所需积分</text>
      <input class="input" v-model.number="form.pointCost" type="number" placeholder="兑换所需积分" />
    </view>
    <view class="form-item">
      <text class="label">库存数量</text>
      <input class="input" v-model.number="form.stock" type="number" placeholder="库存数量" />
    </view>
    <view class="form-item">
      <text class="label">礼品图片</text>
      <view class="upload-area" @click="chooseImage">
        <image v-if="form.image" :src="form.image" class="preview-img" mode="aspectFill" />
        <view v-else class="upload-placeholder">
          <text class="upload-icon">+</text>
          <text class="upload-text">上传图片（选填）</text>
        </view>
      </view>
    </view>
    <view class="form-item">
      <text class="label">礼品描述（选填）</text>
      <textarea class="textarea" v-model="form.description" placeholder="介绍一下这个礼品" />
    </view>

    <button class="submit-btn" :disabled="submitting" @click="submit">
      {{ submitting ? '提交中...' : (form.id ? '保存修改' : '发布礼品') }}
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { createGift, updateGift, getGiftDetail, uploadImages } from '@/api/index';

const submitting = ref(false);
const form = ref({ id: null, name: '', pointCost: '', stock: '', image: '', description: '' });

onLoad(async ({ id }) => {
  if (id) {
    uni.setNavigationBarTitle({ title: '编辑礼品' });
    try {
      const res = await getGiftDetail(id);
      if (res.code === 0) {
        const { id: gId, name, description, image, pointCost, stock, isActive } = res.data;
        form.value = { id: gId, name, description, image, pointCost, stock, isActive };
      }
    } catch (e) {}
  }
});

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: async ({ tempFilePaths }) => {
      try {
        const urls = await uploadImages(tempFilePaths);
        form.value.image = urls[0];
      } catch (e) {
        uni.showToast({ title: '上传失败', icon: 'none' });
      }
    }
  });
};

const submit = async () => {
  const { name, pointCost, stock } = form.value;
  if (!name || !pointCost || stock === '') {
    return uni.showToast({ title: '请填写名称、积分和库存', icon: 'none' });
  }
  submitting.value = true;
  try {
    const fn = form.value.id ? updateGift : createGift;
    const payload = form.value.id
      ? { giftId: form.value.id, ...form.value }
      : form.value;
    const res = await fn(payload);
    if (res.code === 0) {
      uni.showToast({ title: form.value.id ? '已保存' : '发布成功' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.form-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.label { font-size: 28rpx; color: #555; display: block; margin-bottom: 12rpx; }
.input { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; box-sizing: border-box; }
.textarea { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; min-height: 120rpx; box-sizing: border-box; }
.upload-area { width: 200rpx; height: 150rpx; border: 2rpx dashed #ccc; border-radius: 10rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.preview-img { width: 200rpx; height: 150rpx; border-radius: 10rpx; }
.upload-icon { font-size: 48rpx; color: #ccc; }
.upload-text { font-size: 24rpx; color: #999; }
.submit-btn { background: #71C5DA; color: #fff; border-radius: 50rpx; margin: 30rpx 0; font-size: 30rpx; height: 90rpx; line-height: 90rpx; }
</style>
