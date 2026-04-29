<template>
  <view class="container">
    <view v-if="status === 'none'">
      <view class="form-section">
        <view class="form-title">申请成为商家</view>

        <view class="form-item">
          <text class="label">商家名称</text>
          <input class="input" v-model="form.businessName" placeholder="请输入商家名称" />
        </view>
        <view class="form-item">
          <text class="label">联系电话</text>
          <input class="input" v-model="form.contactPhone" type="number" placeholder="请输入联系电话" />
        </view>
        <view class="form-item">
          <text class="label">地址</text>
          <input class="input" v-model="form.address" placeholder="请输入商家地址" />
        </view>
        <view class="form-item">
          <text class="label">简介</text>
          <textarea class="textarea" v-model="form.description" placeholder="介绍一下您的商家（选填）" />
        </view>
        <view class="form-item">
          <text class="label">营业执照</text>
          <view class="upload-area" @click="chooseImage">
            <image v-if="form.licenseImage" :src="form.licenseImage" class="license-img" mode="aspectFill" />
            <view v-else class="upload-placeholder">
              <text class="upload-icon">+</text>
              <text class="upload-text">上传营业执照</text>
            </view>
          </view>
        </view>

        <button class="submit-btn" :disabled="submitting" @click="submit">
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </view>
    </view>

    <view v-else class="status-card">
      <view v-if="status === 'pending'" class="status-pending">
        <text class="status-icon">⏳</text>
        <text class="status-title">申请审核中</text>
        <text class="status-desc">管理员将在1-3个工作日内审核您的申请</text>
      </view>
      <view v-else-if="status === 'approved'" class="status-approved">
        <text class="status-icon">✅</text>
        <text class="status-title">申请已通过</text>
        <text class="status-desc">您已成为商家，可以发布礼品和活动</text>
        <view class="merchant-actions">
          <button class="action-btn" @click="goGifts">管理礼品</button>
          <button class="action-btn" @click="goActivities">管理活动</button>
        </view>
      </view>
      <view v-else-if="status === 'rejected'" class="status-rejected">
        <text class="status-icon">❌</text>
        <text class="status-title">申请已拒绝</text>
        <text class="status-desc reason">拒绝原因：{{ rejectReason }}</text>
        <button class="submit-btn" @click="status = 'none'">重新申请</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { applyMerchant, getMerchantStatus, uploadImages } from '@/api/index';

const status = ref('none');
const rejectReason = ref('');
const submitting = ref(false);
const form = ref({
  businessName: '',
  contactPhone: '',
  address: '',
  description: '',
  licenseImage: ''
});

onMounted(async () => {
  try {
    const res = await getMerchantStatus();
    if (res.code === 0) {
      status.value = res.data.status;
      rejectReason.value = res.data.rejectReason || '';
    }
  } catch (e) {}
});

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: async ({ tempFilePaths }) => {
      try {
        const urls = await uploadImages(tempFilePaths);
        form.value.licenseImage = urls[0];
      } catch (e) {
        uni.showToast({ title: '上传失败', icon: 'none' });
      }
    }
  });
};

const submit = async () => {
  const { businessName, contactPhone, address, licenseImage } = form.value;
  if (!businessName || !contactPhone || !address || !licenseImage) {
    return uni.showToast({ title: '请填写完整信息并上传营业执照', icon: 'none' });
  }
  submitting.value = true;
  try {
    const res = await applyMerchant(form.value);
    if (res.code === 0) {
      status.value = res.data.status;
      uni.showToast({ title: '申请已提交' });
    }
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const goGifts = () => uni.navigateTo({ url: '/pages/merchant/gifts' });
const goActivities = () => uni.navigateTo({ url: '/pages/merchant/activities' });
</script>

<style scoped>
.container { padding: 20rpx; background: #f8f8f8; min-height: 100vh; }
.form-section { background: #fff; border-radius: 16rpx; padding: 30rpx; }
.form-title { font-size: 36rpx; font-weight: bold; margin-bottom: 30rpx; color: #333; }
.form-item { margin-bottom: 24rpx; }
.label { display: block; font-size: 28rpx; color: #555; margin-bottom: 10rpx; }
.input { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; box-sizing: border-box; }
.textarea { border: 1rpx solid #e0e0e0; border-radius: 10rpx; padding: 16rpx; font-size: 28rpx; width: 100%; min-height: 120rpx; box-sizing: border-box; }
.upload-area { width: 200rpx; height: 150rpx; border: 2rpx dashed #ccc; border-radius: 10rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.license-img { width: 200rpx; height: 150rpx; border-radius: 10rpx; }
.upload-icon { font-size: 48rpx; color: #ccc; }
.upload-text { font-size: 24rpx; color: #999; }
.submit-btn { background: #71C5DA; color: #fff; border-radius: 50rpx; margin-top: 30rpx; font-size: 30rpx; height: 90rpx; line-height: 90rpx; }
.status-card { background: #fff; border-radius: 16rpx; padding: 60rpx 30rpx; text-align: center; }
.status-icon { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.status-title { font-size: 36rpx; font-weight: bold; display: block; margin-bottom: 16rpx; }
.status-desc { font-size: 28rpx; color: #666; display: block; }
.reason { color: #e74c3c; margin-top: 16rpx; }
.merchant-actions { display: flex; gap: 20rpx; justify-content: center; margin-top: 40rpx; }
.action-btn { background: #71C5DA; color: #fff; border-radius: 50rpx; font-size: 28rpx; padding: 0 40rpx; height: 80rpx; line-height: 80rpx; }
</style>
