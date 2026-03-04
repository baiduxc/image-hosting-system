<template>
  <!-- 加载状态 -->
  <div v-if="isInitialLoading" class="loading-container">
    <a-spin size="large">
      <div class="loading-text">正在加载用户信息...</div>
    </a-spin>
  </div>
  
  <!-- 主布局 -->
  <a-layout v-else class="main-layout">
    <!-- 左侧菜单栏 -->
    <a-layout-sider
      :collapsed="collapsed"
      :width="240"
      :collapsed-width="48"
      collapsible
      breakpoint="lg"
      @collapse="onCollapse"
      class="layout-sider"
    >
      <!-- Logo区域 -->
      <div class="logo">
        <img src="/logo.svg" alt="Logo" v-if="!collapsed" />
        <img src="/logo-mini.svg" alt="Logo" v-else />
        <span v-if="!collapsed" class="logo-text">摆渡云后台管理系统</span>
      </div>
      
      <!-- 菜单 -->
      <a-menu
        v-model:selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
        mode="vertical"
        theme="dark"
        class="menu"
        :collapsed="collapsed"
        @menu-item-click="handleMenuItemClick"
      >
        <template v-for="item in menuData" :key="item.key">
          <!-- 有子菜单的项 -->
          <a-sub-menu v-if="item.children" :key="`sub-${item.key}`">
            <template #icon><component :is="resolveIcon(item.icon)" /></template>
            <template #title>
              {{ item.title }}
            </template>
            <a-menu-item
              v-for="child in item.children"
              :key="child.key"
            >
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
          
          <!-- 无子菜单的项 -->
          <a-menu-item v-else :key="`item-${item.key}`">
            <template #icon><component :is="resolveIcon(item.icon)" /></template>
            {{ item.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 头部 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <a-button
            type="text"
            @click="toggleCollapsed"
            class="collapse-btn"
          >
            <template #icon>
              <icon-menu-fold v-if="!collapsed" />
              <icon-menu-unfold v-else />
            </template>
          </a-button>
          
          <!-- 面包屑 -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbData" :key="item.key">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 用户信息 -->
          <a-dropdown trigger="click">
            <div class="user-info">
              <a-avatar>
                <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" alt="用户头像" />
                <img v-else src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp" alt="默认头像" />
              </a-avatar>
              <span class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '管理员' }}</span>
              <icon-down />
            </div>
            <template #content>
              <a-doption @click="handleProfile">
                <template #icon>
                  <icon-user />
                </template>
                个人中心
              </a-doption>
              <a-doption>
                <template #icon>
                  <icon-settings />
                </template>
                系统设置
              </a-doption>
              <a-doption @click="handleLogout">
                <template #icon>
                  <icon-export />
                </template>
                退出登录
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 主体内容区 -->
      <a-layout-content class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>

      <!-- 底部 -->
      <a-layout-footer class="layout-footer">
        <div class="footer-content">
          © 2024 摆渡云后台管理系统. All Rights Reserved.
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { Message } from '@arco-design/web-vue'
import {
  IconMenuFold,
  IconMenuUnfold,
  IconDown,
  IconUser,
  IconSettings,
  IconExport,
  IconApps,
  IconDashboard,
  IconUserGroup,
  IconFile,
  IconStorage
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'MainLayout',
  components: {
    IconMenuFold,
    IconMenuUnfold,
    IconDown,
    IconUser,
    IconSettings,
    IconExport,
    IconApps,
    IconDashboard,
    IconUserGroup,
    IconFile,
    IconStorage
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const menuStore = useMenuStore()
    const userStore = useUserStore()
    
    const collapsed = ref(false)
    const selectedKeys = ref([])
    const openKeys = ref([])
    const isInitialLoading = ref(true)
    
    // 获取用户信息
    const loadUserInfo = async () => {
      try {
        isInitialLoading.value = true
        
        // 初始化用户状态
        userStore.initUserState()
        
        // 如果没有用户信息且用户已登录，尝试获取
        if (!userStore.userInfo && userStore.isLoggedIn) {
          await userStore.fetchUserInfo()
        }
      } catch (error) {
        console.warn('获取用户信息失败:', error)
      } finally {
        isInitialLoading.value = false
      }
    }

    const resolveIcon = (iconName) => {
      return {
        IconApps,
        IconDashboard,
        IconUserGroup,
        IconFile,
        IconStorage,
        IconSettings
      }[iconName] || IconApps;
    };
    
    // 菜单数据 - 更新为通用后台管理菜单
    const menuData = ref([
      {
        key: 'dashboard',
        title: '仪表盘',
        path: '/dashboard',
        icon: 'IconDashboard'
      },
      {
        key: 'users',
        title: '用户管理',
        icon: 'IconUserGroup',
        children: [
          {
            key: 'user-list',
            title: '用户列表',
            path: '/users/list'
          },
          {
            key: 'user-levels',
            title: '用户等级',
            path: '/users/levels'
          }
        ]
      },
      {
        key: 'content',
        title: '内容管理',
        icon: 'IconFile',
        children: [
          {
            key: 'articles',
            title: '文章管理',
            path: '/content/articles'
          },
          {
            key: 'add-article',
            title: '添加文章',
            path: '/content/add-article'
          }
        ]
      },
      {
        key: 'system',
        title: '系统管理',
        icon: 'IconSettings',
        children: [
          {
            key: 'storage',
            title: '存储设置',
            path: '/system/storage'
          },
          {
            key: 'files',
            title: '文件管理',
            path: '/system/files'
          },
          {
            key: 'api-config',
            title: 'API配置',
            path: '/system/api-config'
          },
          {
            key: 'site-config',
            title: '站点配置',
            path: '/system/site-config'
          }
        ]
      }
    ])
    
    // 面包屑数据
    const breadcrumbData = computed(() => {
      return menuStore.breadcrumbs || []
    })
    
    // 切换折叠状态
    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value
    }
    
    const onCollapse = (val) => {
      collapsed.value = val
    }
    
    // 处理菜单项点击
    const handleMenuItemClick = async (key) => {
      try {
        // 移除key前缀获取真实的菜单key
        let realKey = key
        if (key.startsWith('item-')) {
          realKey = key.replace('item-', '')
        }
        
        // 直接根据key映射到路径
        const pathMap = {
          'dashboard': '/dashboard',
          'user-list': '/users/list',
          'user-levels': '/users/levels',
          'articles': '/content/articles',
          'add-article': '/content/add-article',
          'storage': '/system/storage',
          'files': '/system/files',
          'api-config': '/system/api-config',
          'site-config': '/system/site-config'
        }
        
        const targetPath = pathMap[realKey]
        
        if (targetPath && targetPath !== route.path) {
          await router.push(targetPath)
        }
      } catch (error) {
        console.warn('菜单点击处理失败:', error)
      }
    }
    
    // 个人中心
    const handleProfile = () => {
      router.push('/profile')
    }
    
    // 退出登录
    const handleLogout = async () => {
      try {
        await userStore.logout()
        Message.success('退出登录成功')
      } catch (error) {
        Message.warning('退出登录请求失败，但已清除本地登录状态')
      } finally {
        // 跳转到登录页
        router.push('/login')
      }
    }
    
    // 监听路由变化，更新选中的菜单项和面包屑
    watch(
      () => route.path,
      async (newPath) => {
        try {
          // 使用nextTick确保DOM更新完成
          await nextTick()
          
          // 更新面包屑
          menuStore.generateBreadcrumbs(newPath)
          
          const findMenuKey = (items, path) => {
            for (const item of items) {
              if (item.path === path) {
                return { key: item.key, parentKey: null, hasChildren: false }
              }
              if (item.children) {
                for (const child of item.children) {
                  if (child.path === path) {
                    return { key: child.key, parentKey: item.key, hasChildren: true }
                  }
                }
              }
            }
            return null
          }
          
          const result = findMenuKey(menuData.value, newPath)
          if (result) {
            // 根据菜单项类型设置正确的selectedKeys
            if (result.hasChildren) {
              // 子菜单项直接使用key
              selectedKeys.value = [result.key]
            } else {
              // 无子菜单的项需要添加item-前缀
              selectedKeys.value = [`item-${result.key}`]
            }
            
            if (result.parentKey && !openKeys.value.includes(result.parentKey)) {
              openKeys.value = [...openKeys.value, result.parentKey]
            }
          }
        } catch (error) {
          console.warn('路由监听处理失败:', error)
        }
      },
      { immediate: true }
    )
    
    // 组件挂载时加载用户信息
    onMounted(async () => {
      await loadUserInfo()
    })
    
    return {
      collapsed,
      selectedKeys,
      openKeys,
      menuData,
      breadcrumbData,
      isInitialLoading,
      toggleCollapsed,
      onCollapse,
      handleMenuItemClick,
      handleProfile,
      handleLogout,
      userStore,
      resolveIcon,
      toggleCollapse: () => { collapsed.value = !collapsed.value; },
    }
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.layout-sider {
  background: #232324;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 1px;
}

.logo img {
  height: 32px;
  width: 32px;
}

.logo-text {
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-left: 12px;
}

.menu {
  border-right: none;
}

.layout-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 16px;
  font-size: 16px;
}

.breadcrumb {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.layout-content {
  background: #f0f2f5;
  padding: 24px;
  overflow: auto;
}

.content-wrapper {
  background: #fff;
  border-radius: 6px;
  min-height: calc(100vh - 64px - 48px - 48px);
}

.layout-footer {
  background: #fff;
  text-align: center;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
}

.footer-content {
  color: #666;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}
</style> 