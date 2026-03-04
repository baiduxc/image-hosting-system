import { API_CONFIG } from '../api/config'
import { Message } from '@arco-design/web-vue'

// API状态检查器
export class ApiChecker {
  constructor() {
    this.isApiAvailable = null
    this.lastCheckTime = null
    this.checkInterval = 30000 // 30秒检查一次
  }
  
  // 检查API是否可用
  async checkApiStatus() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时
      
      // 使用认证信息接口来检查API状态，这个接口在所有系统中都应该存在
      const response = await fetch(`${API_CONFIG.BASE_URL}/api`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      
      // 检查响应状态，200-299范围内都认为是成功，401也算API可用（只是未登录）
      this.isApiAvailable = (response.status >= 200 && response.status < 300) || response.status === 401
      this.lastCheckTime = Date.now()
      
      return this.isApiAvailable
    } catch (error) {
      this.isApiAvailable = false
      this.lastCheckTime = Date.now()
      return false
    }
  }
  
  // 获取API状态（带缓存）
  async getApiStatus(forceCheck = false) {
    const now = Date.now()
    
    // 如果没有检查过或者超过检查间隔，重新检查
    if (forceCheck || !this.lastCheckTime || (now - this.lastCheckTime) > this.checkInterval) {
      await this.checkApiStatus()
    }
    
    return this.isApiAvailable
  }
  
  // 显示API状态提示
  showApiStatusMessage() {
    if (this.isApiAvailable === false) {
      Message.warning({
        content: '后端API服务不可用，请检查后端服务是否正常运行',
        duration: 5000
      })
    } else if (this.isApiAvailable === true) {
      Message.success({
        content: '后端API服务连接正常',
        duration: 3000
      })
    }
  }
  
  // 自动切换到演示数据模式
  enableMockMode() {
    // 动态修改API配置
    API_CONFIG.USE_MOCK_DATA = true
  }
  
  // 切换回真实API模式
  enableApiMode() {
    API_CONFIG.USE_MOCK_DATA = false
  }
}

// 创建全局实例
export const apiChecker = new ApiChecker()

// 初始化API检查
export async function initApiChecker() {
  const isAvailable = await apiChecker.getApiStatus(true)
  
  if (!isAvailable && !API_CONFIG.USE_MOCK_DATA) {
    // 如果API不可用，显示提示信息
    apiChecker.showApiStatusMessage()
  }
  
  return isAvailable
}

// 定期检查API状态
export function startApiMonitoring() {
  setInterval(async () => {
    const wasAvailable = apiChecker.isApiAvailable
    const isAvailable = await apiChecker.getApiStatus(true)
    
    // 状态发生变化时提示用户
    if (wasAvailable !== isAvailable) {
      if (isAvailable) {
        Message.success('API服务已恢复连接')
      } else {
        Message.warning('API服务连接中断')
      }
    }
  }, apiChecker.checkInterval)
} 