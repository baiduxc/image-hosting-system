import { request } from './index'
import { API_CONFIG, setAuthToken, clearAuthInfo } from './config'

// 认证相关API
export const authApi = {
  // 登录
  async login(data) {
    const response = await request.post(API_CONFIG.ENDPOINTS.LOGIN, data)
    

    
    // 🎯 响应拦截器已经解包数据，response直接是data部分
    if (response && response.token) {

      
      // 保存token和用户信息
      setAuthToken(response.token)
      localStorage.setItem(API_CONFIG.AUTH.USER_INFO_KEY, JSON.stringify(response.user))
      localStorage.setItem('isLoggedIn', 'true')
      
    } else {
      console.warn('⚠️ 登录响应中缺少token或格式异常:', response)
    }
    
    return response
  },
  
  // 退出登录
  async logout() {
    try {
      await request.post(API_CONFIG.ENDPOINTS.LOGOUT)
    } catch (error) {

    } finally {
      // 无论API调用是否成功，都清除本地存储
      clearAuthInfo()
    }
  },
  
  // 获取当前用户信息
  async getUserInfo() {
    try {
      const response = await request.get(API_CONFIG.ENDPOINTS.USER_INFO)
      
      // 如果获取成功，更新本地存储
      if (response) {
        localStorage.setItem(API_CONFIG.AUTH.USER_INFO_KEY, JSON.stringify(response))
      }
      
      return response
    } catch (error) {
      // 如果是401错误，清除本地认证信息
      if (error.response?.status === 401) {
        clearAuthInfo()
      }
      throw error
    }
  },
  
  // 更新个人信息
  async updateProfile(data) {
    const response = await request.put('/auth/profile', data)
    
    // 🎯 响应拦截器已经解包数据，response直接是data部分
    if (response) {
      localStorage.setItem(API_CONFIG.AUTH.USER_INFO_KEY, JSON.stringify(response))
    }
    
    return response
  },
  
  // 修改密码
  async changePassword(data) {
    return await request.post('/auth/change-password', data)
  },
  
  // 刷新token
  async refreshToken() {
    const refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await request.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
      refresh_token: refreshToken
    })
    
    // 🎯 响应拦截器已经解包数据，response直接是data部分
    if (response && response.token) {
      setAuthToken(response.token)
      if (response.refresh_token) {
        localStorage.setItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, response.refresh_token)
      }
    }
    
    return response
  },
  
  // 检查登录状态
  isLoggedIn() {
    const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    return !!(token && isLoggedIn)
  },
  
  // 获取本地用户信息
  getLocalUserInfo() {
    try {
      const userInfo = localStorage.getItem(API_CONFIG.AUTH.USER_INFO_KEY)
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      return null
    }
  }
}

export default authApi 