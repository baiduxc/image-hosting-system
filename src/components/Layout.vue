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

        <!-- 右侧操作区 -->
        <div class="header-right">
          <!-- 存储选择器 -->
          <t-dropdown 
            v-if="storageOptions.length > 0"
            :options="storageDropdownOptions" 
            @click="handleStorageSelect"
          >
            <div class="nav-item">
              <span class="nav-text">{{ selectedStorageName || '选择存储' }}</span>
              <ChevronDownIcon class="nav-arrow" />
            </div>
          </t-dropdown>

          <!-- 用户菜单 -->
          <t-dropdown 
            :options="userMenuOptions" 
            @click="handleUserMenuClick"
          >
            <div class="nav-item">
              <span class="nav-text">{{ user?.username || '用户' }}</span>
              <ChevronDownIcon class="nav-arrow" />
            </div>
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
import { ref, computed, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ImageIcon,
  UploadIcon,
  FolderIcon,
  BarChart3Icon,
  SettingsIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserCogIcon,
  CodeIcon
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useSystemConfig } from '@/composables/useSystemConfig'
import { useStorage } from '@/composables/useStorage'

const router = useRouter()
const route = useRoute()
const { user, logout, isAdmin } = useAuth()
const { siteName, siteLogo, loadSystemConfig, updatePageTitle, updateFavicon } = useSystemConfig()
const { 
  storageOptions,
  selectedStorageId,
  selectedStorageName,
  setSelectedStorageId,
  loadStorageOptions 
} = useStorage()

// Logo错误状态
const logoError = ref(false)

// 响应式数据
const globalLoading = ref(false)

// 导航项配置
const navItems = computed(() => {
  const items = [
    { name: 'Upload', path: '/upload', title: '上传', icon: 'upload' },
    { name: 'Manage', path: '/manage', title: '管理', icon: 'folder' },
    { name: 'Api', path: '/api', title: 'API', icon: 'code' }
  ]
  
  // 只有管理员才能看到统计和管理后台入口
  if (isAdmin.value) {
    items.push({ name: 'Stats', path: '/stats', title: '统计', icon: 'chart' })
    items.push({ name: 'Admin', path: '/admin', title: '后台管理', icon: 'settings' })
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

// 存储下拉选项（带选中状态）
const storageDropdownOptions = computed(() => {
  return storageOptions.value.map(storage => {
    const isSelected = storage.id.toString() === selectedStorageId.value
    return {
      content: storage.name,
      value: storage.id.toString(),
      class: isSelected ? 'storage-option-active' : ''
    }
  })
})

// 处理存储选择
const handleStorageSelect = (data: any) => {
  setSelectedStorageId(data.value)
}

// 获取图标组件
const getIcon = (iconName: string) => {
  const iconMap = {
    upload: UploadIcon,
    folder: FolderIcon,
    chart: BarChart3Icon,
    settings: SettingsIcon,
    code: CodeIcon
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

// 组件挂载时执行
onMounted(async () => {
  // 加载系统配置
  await loadSystemConfig()
  
  // 更新页面标题和图标
  updatePageTitle()
  updateFavicon()
  
  // 加载存储选项
  await loadStorageOptions()
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
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

/* 深色模式下的毛玻璃效果 */
:global([theme-mode="dark"]) .layout-header {
  background: rgba(30, 30, 30, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

/* 右侧操作区 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 下拉菜单项样式（和主导航一致） */
.header-right .nav-item {
  cursor: pointer;
}

.nav-text {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-arrow {
  width: 16px;
  height: 16px;
}

/* 存储选项选中状态 - 浅蓝色背景 */
:global(.storage-option-active) {
  background-color: var(--td-brand-color-light) !important;
  color: var(--td-brand-color) !important;
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
  
  .action-text {
    max-width: 60px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>
