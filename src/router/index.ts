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

// 用于缓存token验证结果，避免频繁验证
let tokenValidationCache: { token: string; validated: boolean; timestamp: number } | null = null
const TOKEN_VALIDATION_TTL = 5 * 60 * 1000 // 5分钟缓存

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
  
  // 设置页面标题
  const { siteName } = useSystemConfig()
  const defaultSiteName = siteName.value
  
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
  
  // 如果已登录用户访问登录/注册页面，重定向到首页
  if ((to.name === 'Login' || to.name === 'Register') && token && user) {
    next('/')
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!token || !user) {
      // 没有token或用户信息，直接跳转登录
      MessagePlugin.warning('请先登录')
      next('/login')
      return
    }
    
    // 检查是否需要验证token
    const now = Date.now()
    const needValidation = !tokenValidationCache || 
                          tokenValidationCache.token !== token ||
                          (now - tokenValidationCache.timestamp) > TOKEN_VALIDATION_TTL
    
    if (needValidation) {
      // 需要验证token
      try {
        const response = await apiService.getUserProfile()
        if (!response.success || !response.data) {
          // token无效，清除并跳转登录
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          tokenValidationCache = null
          MessagePlugin.warning('登录已过期，请重新登录')
          next('/login')
          return
        }
        
        // token有效，缓存验证结果
        tokenValidationCache = {
          token: token,
          validated: true,
          timestamp: now
        }
        
        // 更新用户信息
        const currentUser = response.data
        localStorage.setItem('user', JSON.stringify(currentUser))
        
        const userRole = currentUser.role || 'guest'
        
        // 检查是否需要管理员权限
        if (to.meta.requiresAdmin && userRole !== 'admin') {
          MessagePlugin.error('权限不足，需要管理员权限')
          next('/upload')
          return
        }
      } catch (error) {
        // 验证失败，清除token并跳转登录
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        tokenValidationCache = null
        MessagePlugin.warning('登录验证失败，请重新登录')
        next('/login')
        return
      }
    } else {
      // 使用缓存的验证结果，只检查管理员权限
      const userRole = user?.role || 'guest'
      if (to.meta.requiresAdmin && userRole !== 'admin') {
        MessagePlugin.error('权限不足，需要管理员权限')
        next('/upload')
        return
      }
    }
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  MessagePlugin.error('页面加载失败')
})

export default router