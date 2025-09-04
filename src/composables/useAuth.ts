import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService, type UserProfile } from '@/services/api'

// 全局用户状态
const user = ref<UserProfile | null>(null)
const isAuthenticated = ref(false)
const isLoading = ref(false)

// 初始化用户状态
const initializeAuth = () => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  
  if (token && userData) {
    try {
      user.value = JSON.parse(userData)
      isAuthenticated.value = true
    } catch (error) {
      console.error('解析用户数据失败:', error)
      clearAuth()
    }
  }
}

// 清除认证状态
const clearAuth = () => {
  user.value = null
  isAuthenticated.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('rememberMe')
}

export const useAuth = () => {
  const router = useRouter()

  // 计算属性
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userRole = computed(() => user.value?.role || 'guest')
  const userName = computed(() => user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')

  // 登录
  const login = async (credentials: {
    username: string
    password: string
    rememberMe?: boolean
  }) => {
    isLoading.value = true

    
    try {
      const response = await apiService.login(credentials)

      
      if (response.success && response.data) {
        const { user: userData, token } = response.data

        
        // 更新状态
        user.value = {
          ...userData,
          updatedAt: userData.updatedAt || userData.createdAt
        }
        isAuthenticated.value = true
        
        // 保存到localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
        
        MessagePlugin.success('登录成功')
        return { success: true }
      } else {
        console.error('❌ 登录失败:', response.message)
        MessagePlugin.error(response.message || '登录失败')
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('❌ 登录异常:', error)
      console.error('错误详情:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      const message = error.response?.data?.message || error.message || '登录失败'
      MessagePlugin.error(message)
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    isLoading.value = true
    try {
      const response = await apiService.register(userData)
      
      if (response.success) {
        MessagePlugin.success('注册成功')
        return { success: true, data: response.data }
      } else {
        MessagePlugin.error(response.message || '注册失败')
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      const message = error.response?.data?.message || error.message || '注册失败'
      MessagePlugin.error(message)
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      clearAuth()
      MessagePlugin.success('已退出登录')
      router.push('/login')
    }
  }

  // 获取用户资料
  const fetchProfile = async () => {
    try {
      const response = await apiService.getProfile()
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('获取用户资料失败:', error)
      return { success: false, message: error.message }
    }
  }

  // 更新用户资料
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    isLoading.value = true
    try {
      const response = await apiService.updateProfile(profileData)
      
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        MessagePlugin.success('资料更新成功')
        return { success: true, data: response.data }
      } else {
        MessagePlugin.error(response.message || '更新失败')
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('更新用户资料失败:', error)
      const message = error.response?.data?.message || error.message || '更新失败'
      MessagePlugin.error(message)
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 修改密码
  const changePassword = async (passwordData: {
    currentPassword: string
    newPassword: string
  }) => {
    isLoading.value = true
    try {
      const response = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (response.success) {
        MessagePlugin.success('密码修改成功')
        return { success: true }
      } else {
        MessagePlugin.error(response.message || '密码修改失败')
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('修改密码失败:', error)
      const message = error.response?.data?.message || error.message || '密码修改失败'
      MessagePlugin.error(message)
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 检查权限
  const hasPermission = (requiredRole: string) => {
    if (!isAuthenticated.value) return false
    
    const roleHierarchy = {
      'guest': 0,
      'user': 1,
      'admin': 2
    }
    
    const userRoleLevel = roleHierarchy[userRole.value as keyof typeof roleHierarchy] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
    
    return userRoleLevel >= requiredRoleLevel
  }

  // 路由守卫
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      MessagePlugin.warning('请先登录')
      router.push('/login')
      return false
    }
    return true
  }

  const requireAdmin = () => {
    if (!requireAuth()) return false
    
    if (!isAdmin.value) {
      MessagePlugin.error('权限不足')
      router.push('/')
      return false
    }
    return true
  }

  return {
    // 状态
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    isAdmin,
    userRole,
    userName,
    userEmail,
    
    // 方法
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    hasPermission,
    requireAuth,
    requireAdmin,
    
    // 工具方法
    initializeAuth,
    clearAuth
  }
}

// 初始化认证状态
initializeAuth()