<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-content">
        <!-- Logo和标题 -->
        <div class="header-left" @click="goToHome">
          <div class="logo" :class="{ 'logo-with-background': !siteLogo || logoError }">
            <img 
              v-if="siteLogo && !logoError" 
              :src="siteLogo" 
              :alt="siteName"
              class="logo-image"
              @error="logoError = true"
            />
            <ImageIcon v-else class="logo-icon" />
          </div>
          <h1 class="title">{{ siteName }}</h1>
        </div>

        <!-- 主导航 -->
        <nav class="main-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.name"
            :to="item.path"
            class="nav-item"
            active-class="nav-item-active"
          >
            <component :is="getIcon(item.icon)" class="nav-icon" />
            {{ item.title }}
          </router-link>
        </nav>

        <!-- 用户操作区 -->
        <div class="header-right">
          <!-- 服务状态 -->
          <div class="server-status">
            <div :class="['status-dot', serverStatus ? 'status-online' : 'status-offline']"></div>
            <span class="status-text">{{ serverStatus ? '服务正常' : '服务异常' }}</span>
          </div>

          <!-- 用户菜单 -->
          <t-dropdown :options="userMenuOptions" @click="handleUserMenuClick">
            <t-button theme="default" variant="text" class="user-menu-trigger">
              <UserIcon class="user-icon" />
              <span class="username">{{ user?.username || '用户' }}</span>
              <ChevronDownIcon class="dropdown-icon" />
            </t-button>
          </t-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="layout-main">
      <div class="main-content">
        <router-view />
      </div>
    </main>

    <!-- 全局加载状态 -->
    <t-loading 
      v-if="globalLoading" 
      attach="body" 
      text="加载中..."
      size="large"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ImageIcon,
  UploadIcon,
  FolderIcon,
  BarChart3Icon,
  SettingsIcon,
  UserIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserCogIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'
import { useAuth } from '@/composables/useAuth'
import { useSystemConfig } from '@/composables/useSystemConfig'

const router = useRouter()
const route = useRoute()
const { user, logout, isAdmin } = useAuth()
const { siteName, siteLogo, loadSystemConfig, updatePageTitle, updateFavicon } = useSystemConfig()

// Logo错误状态
const logoError = ref(false)

// 响应式数据
const serverStatus = ref(false)
const globalLoading = ref(false)

// 导航项配置
const navItems = computed(() => {
  const items = [
    { name: 'Upload', path: '/upload', title: '上传', icon: 'upload' },
    { name: 'Manage', path: '/manage', title: '管理', icon: 'folder' }
  ]
  
  // 只有管理员才能看到统计和设置页面
  if (isAdmin.value) {
    items.push({ name: 'Stats', path: '/stats', title: '统计', icon: 'chart' })
    items.push({ name: 'Settings', path: '/settings', title: '设置', icon: 'settings' })
  }
  
  return items
})

// 用户菜单选项
const userMenuOptions = computed(() => {
  const options = [
    {
      content: '个人资料',
      value: 'profile',
      prefixIcon: () => h(UserCogIcon, { class: "w-4 h-4" })
    },
    {
      content: '退出登录',
      value: 'logout',
      prefixIcon: () => h(LogOutIcon, { class: "w-4 h-4" })
    }
  ]
  
  return options
})

// 获取图标组件
const getIcon = (iconName: string) => {
  const iconMap = {
    upload: UploadIcon,
    folder: FolderIcon,
    chart: BarChart3Icon,
    settings: SettingsIcon
  }
  return (iconMap as any)[iconName] || UploadIcon
}

// 处理用户菜单点击
const handleUserMenuClick = (data: any) => {
  switch (data.value) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  await logout()
}

// 返回首页
const goToHome = () => {
  router.push('/upload')
}

// 检查服务器状态
const checkServerStatus = async () => {
  try {
    await apiService.healthCheck()
    serverStatus.value = true
  } catch (error) {

    serverStatus.value = false
  }
}

let statusCheckInterval: number | null = null

// 组件挂载时执行
onMounted(async () => {
  checkServerStatus()
  
  // 加载系统配置
  await loadSystemConfig()
  
  // 更新页面标题和图标
  updatePageTitle()
  updateFavicon()
  
  // 定期检查服务器状态，但只在用户活跃时进行
  statusCheckInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      checkServerStatus()
    }
  }, 60000) // 改为60秒检查一次，减少频率
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
    statusCheckInterval = null
  }
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: transparent;
}

.layout-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.header-left:hover {
  opacity: 0.8;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 只有在显示默认图标时才显示背景 */
.logo-with-background {
  background: linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover));
}

.logo-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: var(--td-bg-color-container-hover);
  color: var(--td-text-color-primary);
}

.nav-item-active {
  background-color: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

.nav-icon {
  width: 16px;
  height: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-online {
  background-color: var(--td-success-color);
}

.status-offline {
  background-color: var(--td-error-color);
}

.status-text {
  font-size: 12px;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
}

.user-icon {
  width: 16px;
  height: 16px;
}

.username {
  font-size: 14px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  width: 14px;
  height: 14px;
}

.layout-main {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .main-nav {
    display: none;
  }
  
  .title {
    font-size: 18px;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>