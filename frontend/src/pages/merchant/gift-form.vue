<template>
  <view class="container">
    <view class="section-title">{{ form.id ? '编辑礼品' : '发布礼品' }}</view>
    <view class="form-card">
      <view class="cell">
        <text class="cell-label">礼品名称</text>
        <input class="cell-input" v-model="form.name" placeholder="请输入礼品名称" placeholder-class="ph" />
      </view>
      <view class="cell">
        <text class="cell-label">所需积分</text>
        <input class="cell-input" v-model.number="form.pointCost" type="number" placeholder="兑换所需积分" placeholder-class="ph" />
      </view>
      <view class="cell">
        <text class="cell-label">库存数量</text>
        <input class="cell-input" v-model.number="form.stock" type="number" placeholder="库存数量" placeholder-class="ph" />
      </view>
      <view class="cell cell-upload">
        <text class="cell-label">礼品图片</text>
        <view class="upload-area" @click="chooseImage">
          <image v-if="form.image" :src="form.image" class="preview-img" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片（选填）</text>
          </view>
        </view>
      </view>
      <view class="cell cell-textarea">
        <text class="cell-label">礼品描述</text>
        <textarea class="textarea" v-model="form.description" placeholder="介绍一下这个礼品（选填）" placeholder-class="ph" />
      </view>
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
.container { padding: 24rpx; background: #f5f5f5; min-height: 100vh; }

.section-title { font-size: 28rpx; color: #999; padding: 0 8rpx 16rpx; }

.form-card { background: #fff; border-radius: 12rpx; overflow: hidden; }

.cell {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.cell:last-child { border-bottom: none; }

.cell-label {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
  flex-shrink: 0;
}

.cell-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  min-height: 44rpx;
}

.cell-textarea { align-items: flex-start; }
.textarea {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  min-height: 120rpx;
  line-height: 1.6;
}

.cell-upload { align-items: flex-start; }
.upload-area {
  width: 180rpx;
  height: 130rpx;
  border: 1rpx dashed #ccc;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.preview-img { width: 180rpx; height: 130rpx; border-radius: 8rpx; }
.upload-icon { font-size: 48rpx; color: #bbb; line-height: 1; }
.upload-text { font-size: 22rpx; color: #bbb; margin-top: 6rpx; }

.submit-btn {
  margin-top: 40rpx;
  background: #71C5DA;
  color: #fff;
  border-radius: 8rpx;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
}
.submit-btn[disabled] { opacity: 0.6; }

.ph { color: #bbb; }
</style>
