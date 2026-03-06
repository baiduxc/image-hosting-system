<template>
  <div class="admin-layout">
    <!-- 左侧侧边栏 -->
    <aside class="admin-sidebar" :class="{ 'collapsed': collapsed }">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo" @click="goToHome">
          <img v-if="siteLogo" :src="siteLogo" class="logo-img" alt="logo" />
          <ImageIcon v-else class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">{{ siteTitle }}管理后台</span>
        </div>
      </div>
      
      <!-- 菜单 -->
      <nav class="sidebar-menu">
        <div 
          v-for="item in menuItems" 
          :key="item.path"
          class="menu-item"
          :class="{ 'active': isActive(item.path) }"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" class="menu-icon" />
          <span v-if="!collapsed" class="menu-text">{{ item.title }}</span>
        </div>
      </nav>

      <!-- 折叠按钮 -->
      <div class="sidebar-footer" @click="toggleCollapsed">
        <MenuIcon v-if="!collapsed" class="fold-icon" />
        <MenuIcon v-else class="fold-icon" />
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="admin-main" :class="{ 'expanded': collapsed }">
      <!-- 顶部栏 -->
      <header class="admin-header">
        <div class="breadcrumb">
          <span class="current-page">{{ currentPageTitle }}</span>
        </div>
        <div class="header-actions">
          <t-button variant="text" @click="goToHome">
            <HomeIcon class="action-icon" />
            返回前台
          </t-button>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ImageIcon,
  HardDriveIcon,
  SettingsIcon,
  MailIcon,
  ShieldIcon,
  DatabaseIcon,
  UsersIcon,
  MenuIcon,
  HomeIcon,
  CrownIcon
} from 'lucide-vue-next'
import { apiService } from '@/services/api'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const siteLogo = ref('')
const siteTitle = ref('')

const menuItems = [
  { path: '/admin/storage', title: '存储管理', icon: HardDriveIcon },
  { path: '/admin/system', title: '系统设置', icon: SettingsIcon },
  { path: '/admin/mail', title: '邮件服务', icon: MailIcon },
  { path: '/admin/security', title: '安全管理', icon: ShieldIcon },
  { path: '/admin/database', title: '数据库', icon: DatabaseIcon },
  { path: '/admin/users', title: '用户管理', icon: UsersIcon },
  { path: '/admin/user-groups', title: '用户组管理', icon: CrownIcon }
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => route.path === m.path || route.path.startsWith(m.path))
  return item?.title || '管理后台'
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const navigate = (path: string) => {
  router.push(path)
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

const goToHome = () => {
  router.push('/upload')
}

// 加载网站配置
const loadSiteConfig = async () => {
  try {
    const res = await apiService.getSystemConfig()
    if (res.success && res.data) {
      siteLogo.value = res.data.site_logo || ''
      siteTitle.value = res.data.site_title || ''
    }
  } catch (error) {
    console.error('加载网站配置失败', error)
  }
}

onMounted(() => {
  loadSiteConfig()
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* 侧边栏 - 深色风格 */
.admin-sidebar {
  width: 220px;
  background: #232324;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.3s;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--td-brand-color);
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

/* 菜单 */
.sidebar-menu {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 4px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.menu-item.active {
  background: var(--td-brand-color);
  color: #fff;
}

.menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.menu-text {
  font-size: 14px;
  white-space: nowrap;
}

/* 折叠按钮 */
.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}

.sidebar-footer:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.fold-icon {
  width: 18px;
  height: 18px;
}

/* 主内容区 */
.admin-main {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s;
}

.admin-main.expanded {
  margin-left: 64px;
}

/* 顶部栏 */
.admin-header {
  height: 64px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.current-page {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.action-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

/* 内容区 */
.admin-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 64px;
  }
  
  .menu-text,
  .logo-text {
    display: none;
  }
  
  .admin-main {
    margin-left: 64px;
  }
}
</style>
