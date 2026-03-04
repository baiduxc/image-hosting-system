import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { 
        requiresAuth: false,
        title: '登录 - 摆渡云后台管理系统'
      }
    },
    {
      path: '/',
      redirect: '/dashboard',
      component: () => import('../components/Layout/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: {
            title: '仪表盘 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue'),
          meta: {
            title: '个人中心 - 摆渡云后台管理系统'
          }
        },
        // 用户管理
        {
          path: 'users/list',
          name: 'UserList',
          component: () => import('../views/users/UserList.vue'),
          meta: {
            title: '用户列表 - 用户管理 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'users/levels',
          name: 'UserLevels',
          component: () => import('../views/users/UserLevels.vue'),
          meta: {
            title: '用户等级 - 用户管理 - 摆渡云后台管理系统'
          }
        },
        // 内容管理
        {
          path: 'content/articles',
          name: 'Articles',
          component: () => import('../views/content/Articles.vue'),
          meta: {
            title: '文章管理 - 内容管理 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'content/add-article',
          name: 'AddArticle',
          component: () => import('../views/content/AddArticle.vue'),
          meta: {
            title: '添加文章 - 内容管理 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'content/edit-article/:id',
          name: 'EditArticle',
          component: () => import('../views/content/AddArticle.vue'),
          meta: {
            title: '编辑文章 - 内容管理 - 摆渡云后台管理系统'
          }
        },
        // 系统管理
        {
          path: 'system/storage',
          name: 'Storage',
          component: () => import('../views/system/Storage.vue'),
          meta: {
            title: '存储设置 - 系统管理 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'system/files',
          name: 'FileManager',
          component: () => import('../views/system/FileManager.vue'),
          meta: {
            title: '文件管理 - 系统管理 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'system/api-config',
          name: 'ApiConfig',
          component: () => import('../views/system/ApiConfig.vue'),
          meta: {
            title: 'API配置 - 系统管理 - 摆渡云后台管理系统'
          }
        },
        {
          path: 'system/site-config',
          name: 'SiteConfig',
          component: () => import('../views/system/SiteConfig.vue'),
          meta: {
            title: '站点配置 - 系统管理 - 摆渡云后台管理系统'
          }
        }
      ]
    }
  ]
})

// 用于防止重复验证的标志
let isValidating = false
let validationPromise = null

// 验证用户登录状态的异步函数
async function validateUserAuth() {
  // 如果正在验证中，返回现有的Promise
  if (isValidating && validationPromise) {
    return validationPromise
  }
  
  isValidating = true
  
  validationPromise = (async () => {
    try {
      const userStore = useUserStore()
      
      // 初始化用户状态
      userStore.initUserState()
      
      // 如果本地没有登录状态，直接返回false
      if (!userStore.isLoggedIn) {
        return false
      }
      
      // 检查认证状态（包括API验证）
      const isValid = await userStore.checkAuthStatus()
      return isValid
    } catch (error) {
      console.error('用户认证验证失败:', error)
      return false
    } finally {
      isValidating = false
      validationPromise = null
    }
  })()
  
  return validationPromise
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '摆渡云后台管理系统'
  }
  
  // 如果目标页面不需要认证，直接通过
  if (to.meta.requiresAuth === false) {
    // 如果已登录用户访问登录页，重定向到仪表盘
    if (to.path === '/login') {
      try {
        const isValid = await validateUserAuth()
        if (isValid) {
          next('/dashboard')
          return
        }
      } catch (error) {
        console.warn('登录页面验证失败:', error)
      }
    }
    next()
    return
  }
  
  // 需要认证的页面，验证用户登录状态
  try {
    const isValid = await validateUserAuth()
    
    if (isValid) {
      next()
    } else {
      // 认证失败，跳转到登录页
      next('/login')
    }
  } catch (error) {
    console.error('路由守卫验证失败:', error)
    // 验证过程出错，为了安全起见跳转到登录页
    next('/login')
  }
})

export default router
