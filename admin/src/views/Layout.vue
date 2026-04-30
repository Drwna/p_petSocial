<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapsed ? '64px' : '210px'" class="aside">
      <div class="sidebar-logo" :class="{ collapsed: isCollapsed }">
        <span class="logo-icon">🐾</span>
        <span v-if="!isCollapsed" class="logo-text">宠遇管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        :collapse="isCollapsed"
        :collapse-transition="false"
      >
        <el-menu-item index="/posts">
          <el-icon><Document /></el-icon>
          <template #title>帖子管理</template>
        </el-menu-item>
        <el-menu-item index="/comments">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Collection /></el-icon>
          <template #title>分类配置</template>
        </el-menu-item>
        <el-menu-item index="/topics">
          <el-icon><Tickets /></el-icon>
          <template #title>话题配置</template>
        </el-menu-item>
        <el-menu-item index="/merchants">
          <el-icon><Shop /></el-icon>
          <template #title>商家管理</template>
        </el-menu-item>
        <el-menu-item index="/activities">
          <el-icon><Calendar /></el-icon>
          <template #title>活动审核</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta?.title || '管理' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-icon class="header-icon"><Bell /></el-icon>
          <el-divider direction="vertical" />
          <span class="admin-email">{{ adminEmail }}</span>
          <el-button link type="danger" @click="handleLogout" style="margin-left: 12px">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, ChatDotRound, Collection, Tickets, Shop, Calendar, Fold, Expand, Bell, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)
const isCollapsed = ref(false)

const adminEmail = computed(() => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return '管理员'
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email || '管理员'
  } catch {
    return '管理员'
  }
})

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f0f2f5;
}

.aside {
  background-color: #1d2b3a;
  transition: width 0.25s;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  white-space: nowrap;
  overflow: hidden;
}
.sidebar-logo.collapsed {
  padding: 0;
  justify-content: center;
}
.logo-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.logo-text {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.el-menu {
  border-right: none;
  background-color: transparent;
}
:deep(.el-menu-item) {
  color: #a8b8c8;
  height: 52px;
  margin: 2px 8px;
  border-radius: 8px;
}
:deep(.el-menu-item:hover) {
  background-color: rgba(255,255,255,0.08);
  color: #fff;
}
:deep(.el-menu-item.is-active) {
  color: #fff;
  background-color: #409eff;
}
:deep(.el-menu--collapse) {
  width: 64px;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0,21,41,0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}
.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-icon {
  font-size: 18px;
  color: #606266;
  cursor: pointer;
  padding: 4px;
}
.header-icon:hover {
  color: #409eff;
}
.admin-email {
  font-size: 13px;
  color: #606266;
  margin-left: 4px;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}
</style>