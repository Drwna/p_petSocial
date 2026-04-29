<template>
  <view></view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';

// merchant/status redirects to the combined apply/status page
onLoad(() => {
  uni.redirectTo({ url: '/pages/merchant/apply' });
});
</script>
