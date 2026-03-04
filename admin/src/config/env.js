// 环境配置
export const ENV_CONFIG = {
  // 开发环境
  development: {
    API_BASE_URL: 'https://api.8yun.cc/admin',
    USE_MOCK_DATA: false, // 默认使用真实API
    UPLOAD_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    UPLOAD_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
  },
  
  // 生产环境
  production: {
    API_BASE_URL: 'https://api.8yun.cc/admin',
    USE_MOCK_DATA: false, // 生产环境使用真实API
    UPLOAD_MAX_SIZE: 10 * 1024 * 1024,
    UPLOAD_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
  }
}

// 获取当前环境配置
export function getCurrentEnvConfig() {
  const env = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[env] || ENV_CONFIG.development
}

// 导出当前环境配置
export const currentConfig = getCurrentEnvConfig() 