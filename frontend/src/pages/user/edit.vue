<template>
  <view class="container">
    <view class="avatar-wrapper" @click="chooseAvatar">
      <image class="avatar" :src="form.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      <text class="tip">点击更换头像</text>
    </view>

    <view class="form-item">
      <text class="label">名称</text>
      <input class="input" v-model="form.petName" />
    </view>

    <view class="form-item">
      <text class="label">简介</text>
      <textarea class="textarea" v-model="form.intro" auto-height="true" placeholder="介绍一下你的宠物" />
    </view>

    <view class="form-item">
      <text class="label">类型</text>
      <picker :range="petTypes.map(item => item.label)" @change="onTypeChange">
        <view class="picker-value">{{petTypes.find(item => item.value === form.petType)?.label || '选择类型'}}</view>
      </picker>
    </view>

    <view class="form-item">
      <text class="label">生日</text>
      <picker mode="date" @change="onDateChange">
        <view class="picker-value">{{ form.birthday?.split('T')?.[0] || '选择生日' }}</view>
      </picker>
    </view>

    <button class="btn-primary save-btn" @click="handleSave" :loading="loading">保存</button>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getCurrentUser, updatePetInfo, uploadImages } from '@/api/index';

const petTypes = [
  { label: '狗', value: '1' },
  { label: '猫', value: '2' },
  { label: '鸟', value: '3' },
  { label: '爬行动物', value: '4' },
  { label: '其他', value: '5' }
];
const loading = ref(false);
const form = reactive({
  petName: '',
  intro: '',
  petType: '',
  birthday: '',
  avatar: ''
});

// 是否更新头像
const isUpdateAvatar = ref(false);

onMounted(async () => {
  try {
    const res = await getCurrentUser();
    const data = res.data;
    // 简单的属性赋值
    form.petName = data.petName;
    form.intro = data.intro;
    form.petType = data.petType;
    form.birthday = data.birthday; // 假设是 'YYYY-MM-DD' 格式
    form.avatar = data.avatar;
  } catch (e) {
    console.error(e);
  }
});

const chooseAvatar = () => {
  isUpdateAvatar.value = true;
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 只能选择以下类型图片： JPEG、PNG、GIF和WEBP
      const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!validTypes.includes(res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('.') + 1))) {
        uni.showToast({ title: '请选择jpg、jpeg、png、gif或webp格式的图片', icon: 'none' });
        return;
      }
      // 同样需要上传逻辑，这里直接赋值预览
      form.avatar = res.tempFilePaths[0];
    }
  });
};

const onTypeChange = (e) => {
  form.petType = petTypes[e.detail.value].value;
};

const onDateChange = (e) => {
  form.birthday = e.detail.value;
};

const handleSave = async () => {
  loading.value = true;
  try {

    // 检查名字字符个数，最多为20个
    if (form.petName.length > 20) {
      uni.showToast({ title: '名字最多为30个字符', icon: 'none' });
      return;
    }

    if (isUpdateAvatar.value) {
      const uploadRes = await uploadImages([form.avatar]);
      form.avatar = uploadRes[0];
    }

    await updatePetInfo(form);
    uni.showToast({ title: '保存成功' });

    // 更新本地缓存
    const userInfo = uni.getStorageSync('userInfo') || {};
    Object.assign(userInfo, form);
    uni.setStorageSync('userInfo', userInfo);

    // 同步更新 accounts 列表中的信息
    let accounts = uni.getStorageSync('accounts') || [];
    const currentId = userInfo.id;
    if (currentId) {
      accounts = accounts.map(acc => {
        if (acc.pet && acc.pet.id === currentId) {
          return {
            ...acc,
            pet: {
              ...acc.pet,
              ...form
            }
          };
        }
        return acc;
      });
      uni.setStorageSync('accounts', accounts);
    }

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e) {
    console.error(e);
    uni.showToast(e)
  } finally {
    loading.value = false;
    isUpdateAvatar.value = false;
  }
};
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;

  .avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
    background-color: #eee;
  }

  .tip {
    font-size: 24rpx;
    color: #999;
  }
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  .label {
    width: 120rpx;
    font-size: 30rpx;
    color: #333;
  }

  .input,
  .picker-value {
    flex: 1;
    font-size: 30rpx;
    color: #333;
  }

  .textarea {
    padding: 0;
    min-height: 80rpx;
  }

  .picker-value {
    color: #666;
  }
}

.save-btn {
  margin-top: 60rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
}
</style>
