<template>
  <view class="container">
    <view v-if="status === 'none'">
      <view class="section-title">申请成为商家</view>
      <view class="form-card">
        <view class="cell">
          <text class="cell-label">商家名称</text>
          <input class="cell-input" v-model="form.businessName" placeholder="请输入商家名称" placeholder-class="ph" />
        </view>
        <view class="cell">
          <text class="cell-label">联系电话</text>
          <input class="cell-input" v-model="form.contactPhone" type="number" placeholder="请输入联系电话" placeholder-class="ph" />
        </view>
        <view class="cell">
          <text class="cell-label">地址</text>
          <input class="cell-input" v-model="form.address" placeholder="请输入商家地址" placeholder-class="ph" />
        </view>
        <view class="cell cell-textarea">
          <text class="cell-label">简介</text>
          <textarea class="textarea" v-model="form.description" placeholder="介绍一下您的商家（选填）" placeholder-class="ph" />
        </view>
        <view class="cell cell-upload">
          <text class="cell-label">营业执照</text>
          <view class="upload-area" @click="chooseImage">
            <image v-if="form.licenseImage" :src="form.licenseImage" class="license-img" mode="aspectFill" />
            <view v-else class="upload-placeholder">
              <text class="upload-icon">+</text>
              <text class="upload-text">上传图片</text>
            </view>
          </view>
        </view>
      </view>

      <button class="submit-btn" :disabled="submitting" @click="submit">
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>

    <view v-else class="status-card">
      <view v-if="status === 'pending'">
        <text class="status-icon">⏳</text>
        <text class="status-title">申请审核中</text>
        <text class="status-desc">管理员将在1-3个工作日内审核您的申请</text>
      </view>
      <view v-else-if="status === 'approved'">
        <text class="status-icon">✅</text>
        <text class="status-title">申请已通过</text>
        <text class="status-desc">您已成为商家，可以发布礼品和活动</text>
        <view class="merchant-actions">
          <button class="action-btn" @click="goGifts">管理礼品</button>
          <button class="action-btn" @click="goActivities">管理活动</button>
        </view>
      </view>
      <view v-else-if="status === 'rejected'">
        <text class="status-icon">❌</text>
        <text class="status-title">申请已拒绝</text>
        <text class="status-desc reason">拒绝原因：{{ rejectReason }}</text>
        <button class="submit-btn" style="margin-top:40rpx" @click="status = 'none'">重新申请</button>
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
.license-img { width: 180rpx; height: 130rpx; border-radius: 8rpx; }
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

/* 状态页 */
.status-card { background: #fff; border-radius: 12rpx; padding: 80rpx 30rpx; text-align: center; }
.status-icon { font-size: 80rpx; display: block; margin-bottom: 24rpx; }
.status-title { font-size: 34rpx; font-weight: bold; display: block; margin-bottom: 16rpx; color: #333; }
.status-desc { font-size: 28rpx; color: #888; display: block; line-height: 1.6; }
.reason { color: #e74c3c; }
.merchant-actions { display: flex; gap: 20rpx; justify-content: center; margin-top: 48rpx; }
.action-btn {
  background: #71C5DA;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 0 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
}

.ph { color: #bbb; }
</style>
