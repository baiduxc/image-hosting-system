import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  
  // 初始化用户状态
  const initUserState = () => {
    const token = localStorage.getItem('access_token')
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const storedUserInfo = authApi.getLocalUserInfo()
    
    isLoggedIn.value = !!(token && storedIsLoggedIn)
    userInfo.value = storedUserInfo
  }
  
  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    if (info) {
      localStorage.setItem('user_info', JSON.stringify(info))
    }
  }
  
  // 设置登录状态
  const setLoginStatus = (status) => {
    isLoggedIn.value = status
    localStorage.setItem('isLoggedIn', status.toString())
  }
  
  // 获取用户信息
  const fetchUserInfo = async (forceRefresh = false) => {
    // 如果正在加载中，返回现有信息
    if (isLoading.value) {
      return userInfo.value
    }
    
    // 如果已有用户信息且不强制刷新，直接返回
    if (userInfo.value && !forceRefresh) {
      return userInfo.value
    }
    
    try {
      isLoading.value = true
      
      // 如果本地有用户信息，先使用本地信息
      if (!userInfo.value) {
        const localUserInfo = authApi.getLocalUserInfo()
        if (localUserInfo) {
          userInfo.value = localUserInfo
        }
      }
      
      // 从API获取最新信息
      const response = await authApi.getUserInfo()
      if (response) {
        setUserInfo(response)
      }
      
      return userInfo.value
    } catch (error) {
      console.warn('获取用户信息失败:', error)
      
      // 如果是401错误，清除登录状态
      if (error.response?.status === 401) {
        logout()
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 登录
  const login = async (credentials) => {
    try {
      isLoading.value = true
      const response = await authApi.login(credentials)
      
      if (response && response.token) {
        setLoginStatus(true)
        if (response.user) {
          setUserInfo(response.user)
        }
      }
      
      return response
    } catch (error) {
      setLoginStatus(false)
      setUserInfo(null)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.warn('登出API调用失败:', error)
    } finally {
      // 无论API调用是否成功，都清除本地状态
      setLoginStatus(false)
      setUserInfo(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }
  
  // 更新个人信息
  const updateProfile = async (data) => {
    try {
      const response = await authApi.updateProfile(data)
      if (response) {
        setUserInfo(response)
      }
      return response
    } catch (error) {
      throw error
    }
  }
  
  // 检查登录状态
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token')
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    
    if (!token || !storedIsLoggedIn) {
      setLoginStatus(false)
      setUserInfo(null)
      return false
    }
    
    try {
      await fetchUserInfo()
      setLoginStatus(true)
      return true
    } catch (error) {
      setLoginStatus(false)
      setUserInfo(null)
      return false
    }
  }
  
  return {
    userInfo,
    isLoggedIn,
    isLoading,
    initUserState,
    setUserInfo,
    setLoginStatus,
    fetchUserInfo,
    login,
    logout,
    updateProfile,
    checkAuthStatus
  }
}) 