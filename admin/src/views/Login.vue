<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>
    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <div class="login-logo">🐾</div>
        <h2 class="login-title">宠遇管理后台</h2>
        <p class="login-subtitle">请使用管理员邮箱登录</p>
      </div>
      <el-form :model="loginForm" @keyup.enter="handleLogin" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.email"
            placeholder="请输入管理员邮箱"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <div class="code-row">
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              size="large"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <el-button
              size="large"
              class="send-code-btn"
              @click="handleSendCode"
              :disabled="countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
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
import { Message, Lock } from '@element-plus/icons-vue'

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
  background: linear-gradient(135deg, #1d2b3a 0%, #2c3e50 50%, #1a3a4a 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
  background: #409eff;
}
.circle-1 { width: 400px; height: 400px; top: -100px; right: -100px; }
.circle-2 { width: 300px; height: 300px; bottom: -80px; left: -80px; }
.circle-3 { width: 200px; height: 200px; top: 50%; left: 50%; transform: translate(-50%, -50%); }

.login-card {
  width: 420px;
  border-radius: 16px;
  border: none;
  position: relative;
  z-index: 1;
}
:deep(.el-card__body) {
  padding: 40px 36px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-logo {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 12px;
}
.login-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1px;
}
.login-subtitle {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.login-form {
  margin-top: 8px;
}
:deep(.el-form-item) {
  margin-bottom: 18px;
}

.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.code-row .el-input {
  flex: 1;
}
.send-code-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 15px;
  letter-spacing: 4px;
  border-radius: 8px;
}
</style>