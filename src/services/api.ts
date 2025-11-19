import axios from 'axios'

// 创建axios实例
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'


const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {

    // 添加JWT token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    return response
  },
  (error) => {
    
    // 如果是401错误，清除token并跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberMe')
      // 如果当前不在登录页，则跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// API接口定义
export interface UploadResponse {
  success: boolean
  message: string
  data?: {
    originalName: string
    filename: string
    size: number
    mimetype: string
    path: string
    url: string
  }[]
}

export interface TransferResponse {
  success: boolean
  message: string
  data?: {
    originalUrl: string
    success: boolean
    newUrl?: string
    message: string
  }[]
}

export interface ImageListResponse {
  success: boolean
  data?: {
    images: {
      id: number
      filename: string
      originalName: string
      filePath: string
      url: string
      size: number
      mimeType: string
      width?: number
      height?: number
      uploadType: string
      originalUrl?: string
      tags?: string[]
      description?: string
      createdAt: string
      updatedAt: string
    }[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface StatsResponse {
  success: boolean
  data?: {
    totalImages: number
    totalSize: number
    monthlyUploads: number
    totalTraffic: number
  }
}

// 用户认证相关接口类型
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: number
      username: string
      email: string
      role: string
      avatarUrl?: string
      lastLoginAt?: string
      createdAt: string
      updatedAt?: string
    }
    token: string
  }
}

export interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

// API方法
export const apiService = {
  // 用户认证相关
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async forgotPassword(data: { email: string }): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post('/auth/forgot-password', data)
    return response.data
  },

  async resendVerification(data: { email: string }): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post('/auth/resend-verification', data)
    return response.data
  },

  async getRegistrationStatus(): Promise<{
    success: boolean
    data?: {
      allowRegistration: boolean
    }
    message?: string
  }> {
    const response = await api.get('/auth/registration-status')
    return response.data
  },
  // 上传文件
  async uploadFiles(files: File[]): Promise<UploadResponse> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 验证图片URL
  async validateUrls(urls: string[]): Promise<{
    success: boolean
    message: string
    data?: {
      url: string
      valid: boolean
      contentType?: string
      contentLength?: number
      error?: string
    }[]
  }> {
    const response = await api.post('/validate-urls', { urls })
    return response.data
  },

  // 转存网络图片
  async transferImages(urls: string[]): Promise<TransferResponse> {
    const response = await api.post('/transfer', { urls })
    return response.data
  },

  // 获取图片列表
  async getImages(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<ImageListResponse> {
    // 添加时间戳防止缓存
    const paramsWithTimestamp = {
      ...params,
      _t: Date.now()
    }
    const response = await api.get('/images', { 
      params: paramsWithTimestamp,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    return response.data
  },

  // 删除图片
  async deleteImage(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/images/${id}`)
    return response.data
  },

  // 批量删除图片
  async batchDeleteImages(ids: number[]): Promise<{
    success: boolean
    message: string
    data?: {
      total: number
      success: number
      failed: number
      results: Array<{
        id: number
        success: boolean
        message: string
      }>
    }
  }> {
    const response = await api.delete('/images', {
      data: { ids }
    })
    return response.data
  },

  // 获取统计数据
  async getStats(): Promise<StatsResponse> {
    const response = await api.get('/stats')
    return response.data
  },

  // 健康检查
  async healthCheck(): Promise<any> {
    const response = await api.get('/health')
    return response.data
  },

  // 获取系统配置
  async getConfig(): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    const response = await api.get('/config')
    return response.data
  },

  // 获取特定配置项
  async getConfigItem(key: string): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    const response = await api.get(`/config/${key}`)
    return response.data
  },

  // 保存系统配置
  async saveConfig(config: any): Promise<{
    success: boolean
    message: string
    data?: any
    errors?: string[]
  }> {
    const response = await api.post('/config', config)
    return response.data
  },

  // 设置单个配置项
  async setConfigItem(key: string, value: any, description?: string): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    const response = await api.post(`/config/${key}`, { value, description })
    return response.data
  },

  // 删除配置项
  async deleteConfigItem(key: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.delete(`/config/${key}`)
    return response.data
  },

  // 测试存储连接
  async testStorageConnection(storageType: string, config: any): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post('/config/test-storage', { 
      storageType, 
      config 
    })
    return response.data
  },

  // 测试邮件发送
  async testEmailConnection(emailConfig: any): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post('/config/test-email', emailConfig)
    return response.data
  },

  // 创建系统备份
  async createBackup(): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    // TODO: 实现系统备份功能
    return {
      success: true,
      message: '备份功能待实现'
    }
  },

  // 清理系统缓存
  async clearCache(): Promise<{
    success: boolean
    message: string
  }> {
    // TODO: 实现缓存清理功能
    return {
      success: true,
      message: '缓存清理功能待实现'
    }
  },

  // 优化数据库
  async optimizeDatabase(): Promise<{
    success: boolean
    message: string
  }> {
    // TODO: 实现数据库优化功能
    return {
      success: true,
      message: '数据库优化功能待实现'
    }
  },

  // 重置系统
  async resetSystem(): Promise<{
    success: boolean
    message: string
  }> {
    // TODO: 实现系统重置功能
    return {
      success: true,
      message: '系统重置功能待实现'
    }
  },

  // 获取数据统计
  async getDataStats(): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    // 使用现有的统计接口
    return this.getStats()
  },

  // ============ 存储配置相关 ============
  
  // 获取所有存储配置
  async getAllStorages(): Promise<{
    success: boolean
    data?: any[]
    message?: string
  }> {
    const response = await api.get('/storage')
    return response.data
  },

  // 获取存储配置
  async getStorage(id: string): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    const response = await api.get(`/storage/${id}`)
    return response.data
  },

  // 创建存储配置
  async createStorage(name: string, type: string, config: any): Promise<{
    success: boolean
    data?: any
    message: string
  }> {
    const response = await api.post('/storage', { name, type, config })
    return response.data
  },

  // 更新存储配置
  async updateStorage(id: string, name: string, type: string, config: any): Promise<{
    success: boolean
    data?: any
    message: string
  }> {
    const response = await api.put(`/storage/${id}`, { name, type, config })
    return response.data
  },

  // 设置默认存储
  async setDefaultStorage(id: number): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.put(`/storage/${id}/default`)
    return response.data
  },

  // 获取用户个人资料
  async getUserProfile(): Promise<{
    success: boolean
    data?: any
    message: string
  }> {
    const response = await api.get('/users/profile')
    return response.data
  },

  // 别名方法
  async getProfile(): Promise<{
    success: boolean
    data?: any
    message: string
  }> {
    return this.getUserProfile()
  },

  // 更新用户个人资料
  async updateProfile(profileData: any): Promise<{
    success: boolean
    data?: any
    message: string
  }> {
    const response = await api.put('/users/profile', profileData)
    return response.data
  },

  // 修改密码
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post('/users/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  // 获取用户统计信息
  async getUserStats(): Promise<{
    success: boolean
    data?: any
    message: string
  }> {
    const response = await api.get('/users/stats')
    return response.data
  },

  // 删除存储配置
  async deleteStorage(id: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.delete(`/storage/${id}`)
    return response.data
  },

  // 获取默认存储信息
  async getDefaultStorage(): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    const response = await api.get('/storage/default/info')
    return response.data
  },

  // 获取可用存储配置列表（所有认证用户）
  async getAvailableStorages(): Promise<{
    success: boolean
    data?: any[]
    message?: string
  }> {
    const response = await api.get('/storage/available')
    return response.data
  },

  // 上传文件到对象存储
  async uploadToStorage(files: any[], storageId: string): Promise<{
    success: boolean
    data?: any[]
    message: string
  }> {
    const response = await api.post('/upload-to-storage', { files, storageId })
    return response.data
  },

  // 获取公开的系统配置（无需认证）
  async getSystemConfig(): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    const response = await api.get('/config/system')
    return response.data
  },

  // ============ 图片硬删除管理相关 ============
  
  // 获取已软删除的图片列表（仅管理员）
  async getDeletedImages(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<ImageListResponse> {
    const response = await api.get('/images/deleted', { params })
    return response.data
  },

  // 恢复软删除的图片（仅管理员）
  async restoreImage(id: number): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    const response = await api.post(`/images/${id}/restore`)
    return response.data
  },

  // 硬删除图片（永久删除，仅管理员）
  async permanentDeleteImage(id: number): Promise<{
    success: boolean
    message: string
    data?: any
    storageDeleted?: boolean
  }> {
    const response = await api.delete(`/images/${id}/permanent`)
    return response.data
  },

  // 批量硬删除图片（永久删除，仅管理员）
  async batchPermanentDeleteImages(ids: number[]): Promise<{
    success: boolean
    message: string
    data?: {
      deleted: number[]
      errors: string[]
    }
  }> {
    const response = await api.delete('/images/permanent', {
      data: { ids }
    })
    return response.data
  },

  // 清理指定天数前的软删除记录（仅管理员）
  async cleanupDeletedImages(daysOld: number = 30): Promise<{
    success: boolean
    message: string
    data?: {
      cleanedRecords: number
      storageFilesDeleted: number
      localFilesDeleted: number
      daysOld: number
    }
  }> {
    const response = await api.post('/images/cleanup', { daysOld })
    return response.data
  },

  // ============ 数据库管理相关 ============
  
  // 获取数据库信息
  async getDatabaseInfo(): Promise<{
    success: boolean
    data?: {
      type: string
      path?: string
      size?: number
    }
    message?: string
  }> {
    const response = await api.get('/database/info')
    return response.data
  },

  // 备份数据库（仅SQLite）
  async backupDatabase(): Promise<{
    success: boolean
    message: string
    data?: {
      fileName: string
      filePath: string
      fileSize: number
      timestamp: string
    }
  }> {
    const response = await api.post('/database/backup')
    return response.data
  },

  // 获取备份列表
  async getDatabaseBackups(): Promise<{
    success: boolean
    data?: Array<{
      fileName: string
      fileSize: number
      createdAt: string
      modifiedAt: string
    }>
    message?: string
  }> {
    const response = await api.get('/database/backups')
    return response.data
  },

  // 下载备份文件
  async downloadBackup(fileName: string): Promise<Blob> {
    const response = await api.get(`/database/backup/download/${fileName}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // 删除备份文件
  async deleteBackup(fileName: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.delete(`/database/backup/${fileName}`)
    return response.data
  },

  // PostgreSQL 转 SQLite
  async migratePostgresToSqlite(databaseUrl: string): Promise<{
    success: boolean
    message: string
    data?: {
      fileName: string
      filePath: string
      fileSize: number
      recordsCopied: {
        users: number
        images: number
        storages: number
        stats: number
        configs: number
      }
    }
  }> {
    const response = await api.post('/database/migrate/pg-to-sqlite', { databaseUrl })
    return response.data
  },

  // 下载迁移后的数据库文件
  async downloadMigratedDatabase(fileName: string): Promise<Blob> {
    const response = await api.get(`/database/migrate/download/${fileName}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default api