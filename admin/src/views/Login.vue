<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-title">宠遇管理员登录</div>
      </template>
      <el-form :model="loginForm" @keyup.enter="handleLogin">
        <el-form-item label="邮箱">
          <el-input v-model="loginForm.email" placeholder="请输入管理员邮箱" />
        </el-form-item>
        <el-form-item label="验证码">
          <div style="display: flex; width: 100%; gap: 10px;">
            <el-input v-model="loginForm.code" placeholder="验证码" />
            <el-button @click="handleSendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取' }}
            </el-button>
          </div>
        </el-form-item>
        <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginForm = ref({ email: '', code: '' })
const loading = ref(false)
const countdown = ref(0)

const handleSendCode = async () => {
  if (!loginForm.value.email) return ElMessage.warning('请输入邮箱')
  try {
    await request.post('/account/send-code', { email: loginForm.value.email, type: 'login' })
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {}
}

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.code) return ElMessage.warning('请填写完整')
  loading.value = true
  try {
    const res = await request.post('/account/login-code', loginForm.value)
    if (res.data.role !== 'admin') {
      ElMessage.error('该账号不是管理员账号')
      return
    }
    localStorage.setItem('admin_token', res.data.token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2d3a4b;
}
.login-card {
  width: 400px;
}
.login-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
</style>