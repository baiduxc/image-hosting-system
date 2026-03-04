import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import { API_CONFIG, getAuthToken, setAuthToken, clearAuthInfo, getApiUrl } from './config'

// 创建一个全局的路由跳转函数，将在main.js中设置
let globalRouter = null

export const setGlobalRouter = (router) => {
  globalRouter = router
}

// 创建axios实例
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    

    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    
    // 统一处理响应数据格式
    const { data } = response
    
    // 如果后端返回的是标准格式 { code, msg, data }
    if (data && typeof data === 'object' && 'code' in data) {
      // 检查业务层面的401错误
      if (data.code === 401) {
        handleUnauthorized()
        return Promise.reject(new Error(data.msg || data.message || '登录已过期'))
      }
      
      // 检查业务层面的成功状态码
      if (data.code === 200 || data.code === 201) {
        // ⚠️ 直接返回data部分，不是完整响应
        return data.data
      } else {
        // 业务错误，抛出异常
        throw new Error(data.msg || data.message || '请求失败')
      }
    }
    
    // 如果不是标准格式，直接返回数据
    return data
  },
  (error) => {
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // HTTP层面的401错误
          handleUnauthorized()
          break
          
        case 403:
          Message.error('没有权限访问该资源')
          break
          
        case 404:
          Message.error('请求的资源不存在')
          break
          
        case 422:
          // 表单验证错误
          if (data && data.errors) {
            const firstError = Object.values(data.errors)[0]
            Message.error(Array.isArray(firstError) ? firstError[0] : firstError)
          } else {
            Message.error(data.message || data.msg || '数据验证失败')
          }
          break
          
        case 500:
          Message.error('服务器内部错误')
          break
          
        default:
          Message.error(data?.message || data?.msg || `请求失败 (${status})`)
      }
    } else if (error.request) {
      // 网络错误
      Message.error('网络连接失败，请检查网络设置')
    } else {
      Message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 统一处理未授权错误的函数
let isRedirecting = false // 防止重复跳转
let redirectTimeout = null // 重定向超时定时器

function handleUnauthorized() {
  if (isRedirecting) {
    return // 如果正在跳转，避免重复处理
  }
  
  // 检查当前是否已经在登录页
  if (window.location.pathname === '/login') {
    return // 已经在登录页，不需要重复跳转
  }
  
  isRedirecting = true
  
  // 清除之前的重定向超时
  if (redirectTimeout) {
    clearTimeout(redirectTimeout)
  }
  
  // 显示错误消息
  Message.error('登录已过期，请重新登录')
  
  // 清除认证信息
  clearAuthInfo()
  
  // 设置重定向超时，避免无限等待
  redirectTimeout = setTimeout(() => {
    isRedirecting = false
  }, 3000)
  
  // 优先使用Vue Router进行跳转
  if (globalRouter && globalRouter.currentRoute.value.path !== '/login') {
    globalRouter.push('/login').then(() => {
      isRedirecting = false
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
        redirectTimeout = null
      }
    }).catch((error) => {
      console.warn('Vue Router跳转失败，使用window.location:', error)
      // 如果路由跳转失败，使用window.location作为备选
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      isRedirecting = false
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
        redirectTimeout = null
      }
    })
  } else {
    // 如果没有设置全局路由或已经在登录页，检查当前页面
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    isRedirecting = false
    if (redirectTimeout) {
      clearTimeout(redirectTimeout)
      redirectTimeout = null
    }
  }
}

// 通用请求方法
export const request = {
  get: (url, params = {}) => api.get(url, { params }),
  post: (url, data = {}) => api.post(url, data),
  put: (url, data = {}) => api.put(url, data),
  patch: (url, data = {}) => api.patch(url, data),
  delete: (url) => api.delete(url)
}

// 文件上传方法
export const uploadFile = (url, file, onProgress = null) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

// 上传API配置
export const uploadApi = {
  // 获取上传URL
  getUploadUrl() {
    return `${API_CONFIG.BASE_URL}/upload`
  },
  
  // 获取上传请求头
  getUploadHeaders() {
    const token = getAuthToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

// 重新导出常用函数
export { getApiUrl, getAuthToken, setAuthToken, clearAuthInfo, API_CONFIG }

export default api 