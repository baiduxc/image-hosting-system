import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useSystemConfig } from '@/composables/useSystemConfig'
import { apiService } from '@/services/api'

// 导入页面组件
import Upload from '@/views/Upload.vue'
import Manage from '@/views/Manage.vue'
import Stats from '@/views/Stats.vue'
import Settings from '@/views/Settings.vue'
import Profile from '@/views/Profile.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Layout from '@/components/Layout.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '登录',
      requiresAuth: false 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      title: '注册',
      requiresAuth: false 
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/upload',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'upload',
        name: 'Upload',
        component: Upload,
        meta: { 
          title: '上传图片',
          requiresAuth: true,
          icon: 'upload'
        }
      },
      {
        path: 'manage',
        name: 'Manage',
        component: Manage,
        meta: { 
          title: '图片管理',
          requiresAuth: true,
          icon: 'folder'
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats,
        meta: { 
          title: '存储统计',
          requiresAuth: true,
          requiresAdmin: true,
          icon: 'chart'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { 
          title: '系统配置',
          requiresAuth: true,
          requiresAdmin: true,
          icon: 'settings'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { 
          title: '个人中心',
          requiresAuth: true,
          icon: 'user'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 获取认证状态
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  let user = null
  
  try {
    user = userData ? JSON.parse(userData) : null
  } catch (error) {

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  
  const isAuthenticated = !!(token && user)
  const userRole = user?.role || 'guest'
  
  // 设置页面标题
  const { siteName } = useSystemConfig()
  const defaultSiteName = siteName.value || '图床管理系统'
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${defaultSiteName}`
  } else {
    document.title = defaultSiteName
  }
  
  // 检查注册页面访问权限
  if (to.name === 'Register') {
    try {
      const configResponse = await apiService.getSystemConfig()
      if (configResponse.success && configResponse.data) {
        const allowRegister = configResponse.data.allow_register !== false
        if (!allowRegister) {
          MessagePlugin.warning('注册功能已关闭')
          next('/login')
          return
        }
      }
    } catch (error) {
      // 如果获取配置失败，默认允许访问注册页面
    }
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    MessagePlugin.warning('请先登录')
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    MessagePlugin.error('权限不足，需要管理员权限')
    next('/upload')
    return
  }
  
  // 如果已登录用户访问登录/注册页面，重定向到首页
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  MessagePlugin.error('页面加载失败')
})

export default router