import { request, uploadFile } from './index'
import { API_CONFIG } from './config'

// 存储配置管理API
export const storageApi = {
  // 获取存储配置列表
  async getStorageConfigs(params = {}) {
    return await request.get(API_CONFIG.ENDPOINTS.STORAGE, params)
  },
  
  // 获取存储配置详情
  async getStorageConfig(id) {
    const url = API_CONFIG.ENDPOINTS.STORAGE_DETAIL.replace('{id}', id)
    return await request.get(url)
  },
  
  // 创建存储配置
  async createStorageConfig(data) {
    return await request.post(API_CONFIG.ENDPOINTS.STORAGE, data)
  },
  
  // 更新存储配置
  async updateStorageConfig(id, data) {
    const url = API_CONFIG.ENDPOINTS.STORAGE_DETAIL.replace('{id}', id)
    return await request.put(url, data)
  },
  
  // 删除存储配置
  async deleteStorageConfig(id) {
    const url = API_CONFIG.ENDPOINTS.STORAGE_DETAIL.replace('{id}', id)
    return await request.delete(url)
  },
  
  // 设置默认存储
  async setDefaultStorage(id) {
    const url = API_CONFIG.ENDPOINTS.STORAGE_DEFAULT.replace('{id}', id)
    return await request.post(url)
  }
}

// 文件上传API
export const uploadApi = {
  // 通用文件上传
  async upload(file, onProgress) {
    return await uploadFile(API_CONFIG.ENDPOINTS.UPLOAD, file, onProgress)
  }
}

// 文件管理API
export const filesApi = {
  // 获取文件列表
  async getFiles(params = {}) {
    return await request.get(API_CONFIG.ENDPOINTS.FILES, params)
  },
  
  // 删除文件
  async deleteFile(id) {
    const url = API_CONFIG.ENDPOINTS.FILE_DETAIL.replace('{id}', id)
    return await request.delete(url)
  }
}

export default storageApi 