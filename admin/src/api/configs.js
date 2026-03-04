import { request } from './index'

// 配置管理API
export const configsApi = {
  // 获取配置列表
  async getConfigs(params = {}) {
    return await request.get('/configs', { params })
  },
  
  // 获取配置组列表
  async getConfigGroups() {
    return await request.get('/configs/groups')
  },
  
  // 按分组获取配置
  async getConfigsByGroup(group) {
    return await request.get(`/configs/group/${group}`)
  },
  
  // 获取配置详情
  async getConfigDetail(id) {
    return await request.get(`/configs/${id}`)
  },
  
  // 创建配置
  async createConfig(data) {
    return await request.post('/configs', data)
  },
  
  // 更新配置
  async updateConfig(id, data) {
    return await request.put(`/configs/${id}`, data)
  },
  
  // 删除配置
  async deleteConfig(id) {
    return await request.delete(`/configs/${id}`)
  },
  
  // 批量保存配置
  async batchSaveConfigs(data) {
    return await request.post('/configs/batch', data)
  },
  
  // 获取网站配置
  async getSiteConfig() {
    return await request.get('/configs/site/info')
  },
  
  // 保存网站配置
  async saveSiteConfig(data) {
    return await request.post('/configs/site/save', data)
  },
  
  // 获取SEO配置
  async getSeoConfig() {
    return await request.get('/configs/seo/info')
  },
  
  // 保存SEO配置
  async saveSeoConfig(data) {
    return await request.post('/configs/seo/save', data)
  },
  
  // 获取系统参数配置
  async getSystemConfig() {
    return await request.get('/configs/system/info')
  },
  
  // 保存系统参数配置
  async saveSystemConfig(data) {
    return await request.post('/configs/system/save', data)
  },
  
  // 获取邮箱配置
  async getEmailConfig() {
    return await request.get('/configs/email/info')
  },
  
  // 保存邮箱配置
  async saveEmailConfig(data) {
    return await request.post('/configs/email/save', data)
  },
  
  // 测试邮箱配置
  async testEmailConfig(data) {
    return await request.post('/configs/email/test', data)
  },
  
  // 获取安全配置
  async getSecurityConfig() {
    return await request.get('/configs/security/info')
  },
  
  // 保存安全配置
  async saveSecurityConfig(data) {
    return await request.post('/configs/security/save', data)
  }
}

export default configsApi 