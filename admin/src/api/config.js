import { currentConfig } from '../config/env'

// API配置文件
export const API_CONFIG = {
  // 基础URL - 从环境配置获取
  BASE_URL: currentConfig.API_BASE_URL,
  
  // 是否使用演示数据（默认false，使用真实API）
  USE_MOCK_DATA: false,
  
  // 请求超时时间
  TIMEOUT: 10000,
  
  // API版本
  VERSION: 'v1',
  
  // 认证相关
  AUTH: {
    TOKEN_KEY: 'access_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_INFO_KEY: 'user_info'
  },
  
  // 上传配置
  UPLOAD: {
    MAX_SIZE: currentConfig.UPLOAD_MAX_SIZE,
    ALLOWED_TYPES: currentConfig.UPLOAD_ALLOWED_TYPES
  },
  
  // API端点
  ENDPOINTS: {
    // 认证相关
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    USER_INFO: '/auth/info',
    
    // 配置管理
    CONFIGS: '/configs',
    CONFIGS_BATCH: '/configs/batch',
    CONFIGS_SITE_INFO: '/configs/site/info',
    CONFIGS_SITE_SAVE: '/configs/site/save',
    CONFIGS_SEO_INFO: '/configs/seo/info',
    CONFIGS_SEO_SAVE: '/configs/seo/save',
    CONFIGS_SYSTEM_INFO: '/configs/system/info',
    CONFIGS_SYSTEM_SAVE: '/configs/system/save',
    CONFIGS_EMAIL_INFO: '/configs/email/info',
    CONFIGS_EMAIL_SAVE: '/configs/email/save',
    CONFIGS_EMAIL_TEST: '/configs/email/test',
    
    // 讲师管理
    TEACHERS: '/teachers',
    TEACHER_DETAIL: '/teachers/{id}',
    TEACHERS_ALL: '/teachers/all',
    
    // 课程管理
    COURSES: '/courses',
    COURSE_DETAIL: '/courses/{id}',
    COURSE_CATEGORIES: '/course-categories',
    COURSE_CATEGORIES_ALL: '/course-categories/all',
    COURSE_CATEGORIES_TREE: '/course-categories/tree',
    COURSE_CHAPTERS: '/courses/{id}/chapters',
    COURSE_CHAPTER_DETAIL: '/courses/{id}/chapters/{chapterId}',
    
    // 直播课管理
    LIVE_COURSES: '/live-courses',
    LIVE_COURSE_DETAIL: '/live-courses/{id}',
    LIVE_COURSE_START: '/live-courses/{id}/start',
    LIVE_COURSE_END: '/live-courses/{id}/end',
    
    // 直播配置管理
    LIVE_CONFIGS: '/live-configs',
    LIVE_CONFIG_DETAIL: '/live-configs/{id}',
    LIVE_CONFIGS_ALL: '/live-configs/all',
    LIVE_CONFIG_SET_DEFAULT: '/live-configs/{id}/set-default',
    LIVE_CONFIG_TEST: '/live-configs/{id}/test-connection',
    
    // 直播流管理
    LIVE_STREAMS: '/live-streams',
    LIVE_STREAM_DETAIL: '/live-streams/{id}',
    LIVE_STREAM_PUSH_URL: '/live-streams/{id}/push-url',
    LIVE_STREAM_PLAY_URLS: '/live-streams/{id}/play-urls',
    LIVE_STREAM_START: '/live-streams/{id}/start',
    LIVE_STREAM_STOP: '/live-streams/{id}/stop',
    LIVE_STREAM_UPDATE_VIEWER: '/live-streams/{id}/update-viewer-count',
    
    // 直播回调管理
    LIVE_CALLBACK_LOGS: '/live-callbacks/logs',
    LIVE_CALLBACK_LOG_DETAIL: '/live-callbacks/logs/{id}',
    LIVE_CALLBACK_CLEAR: '/live-callbacks/clear-logs',
    
    // 会员管理
    MEMBERS: '/members',
    MEMBER_DETAIL: '/members/{id}',
    MEMBER_LEVELS: '/member-levels',
    MEMBER_LEVELS_ALL: '/member-levels/all',
    MEMBER_RECHARGE: '/members/{id}/recharge',
    MEMBER_SET_LEVEL: '/members/{id}/set-level',
    MEMBER_RESET_PASSWORD: '/members/{id}/reset-password',
    MEMBER_TOGGLE_STATUS: '/members/{id}/toggle-status',
    MEMBER_ENABLE: '/members/{id}/enable',
    MEMBER_DISABLE: '/members/{id}/disable',
    
    // 存储设置
    STORAGE: '/storage',
    STORAGE_DETAIL: '/storage/{id}',
    STORAGE_DEFAULT: '/storage/{id}/default',
    STORAGE_TEST: '/storage/{id}/test',
    
    // 文件管理
    FILES: '/storage/files',
    FILE_DETAIL: '/storage/files/{id}',
    UPLOAD: '/storage/upload',
    UPLOAD_IMAGE: '/storage/upload',
    UPLOAD_VIDEO: '/storage/upload',
    UPLOAD_DOCUMENT: '/storage/upload',
    
    // 文章管理
    ARTICLES: '/articles',
    ARTICLE_DETAIL: '/articles/{id}',
    ARTICLE_CATEGORIES: '/article-categories',
    ARTICLE_CATEGORIES_ALL: '/article-categories/all',
    ARTICLE_TAGS: '/article-tags',
    ARTICLE_TAGS_ALL: '/article-tags/all',
    
    // 活动管理
    ACTIVITIES: '/activities',
    ACTIVITY_DETAIL: '/activities/{id}',
    ACTIVITY_CATEGORIES: '/activity-categories',
    ACTIVITY_CATEGORIES_ALL: '/activity-categories/all',
    ACTIVITY_SIGNUPS: '/activities/{id}/signups',
    ACTIVITY_SIGNUP_DETAIL: '/activities/{id}/signups/{signupId}',
    ACTIVITY_SIGNUP_AUDIT: '/activities/{id}/signups/{signupId}/audit',
    ACTIVITY_SIGNUP_CHECKIN: '/activities/{id}/signups/{signupId}/checkin',
    
    // 订单管理
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/{id}',
    ORDER_UPDATE_STATUS: '/orders/{id}/update-status',
    ORDER_PAY: '/orders/{id}/pay',
    ORDER_REFUND: '/orders/{id}/refund',
    ORDER_PAYMENTS: '/orders/{id}/payments',
    ORDER_STATISTICS: '/orders/statistics',
    ORDER_EXPORT: '/orders/export',
    
    // 支付配置管理
    PAYMENT_CONFIGS: '/payment-configs',
    PAYMENT_CONFIG_DETAIL: '/payment-configs/{id}',
    PAYMENT_CONFIG_SET_DEFAULT: '/payment-configs/{id}/set-default',
    PAYMENT_CONFIG_TEST: '/payment-configs/{id}/test',
    
    // 支付订单管理
    PAYMENT_ORDERS: '/payment-orders',
    PAYMENT_ORDER_DETAIL: '/payment-orders/{id}',
    PAYMENT_ORDER_CANCEL: '/payment-orders/{id}/cancel',
    PAYMENT_ORDER_REFUND: '/payment-orders/{id}/refund',
    PAYMENT_REFUNDS: '/payment-refunds',
    PAYMENT_REFUND_DETAIL: '/payment-refunds/{id}',
    PAYMENT_STATISTICS: '/payment-orders/statistics',
    PAYMENT_NOTIFY_LOGS: '/payment-notify-logs'
  }
}

// 获取完整的API URL
export function getApiUrl(endpoint, params = {}) {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  // 替换URL中的参数占位符
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key])
  })
  
  return url
}

// 获取认证token
export function getAuthToken() {
  return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)
}

// 设置认证token
export function setAuthToken(token) {
  localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, token)
}

// 清除认证信息
export function clearAuthInfo() {
  localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY)
  localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY)
  localStorage.removeItem(API_CONFIG.AUTH.USER_INFO_KEY)
  localStorage.removeItem('isLoggedIn')
} 