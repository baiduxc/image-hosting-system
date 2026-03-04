import { request } from './index'
import { API_CONFIG } from './config'

// 直播配置管理
export const liveConfigApi = {
  // 获取配置列表
  getList(params) {
    return request.get(API_CONFIG.ENDPOINTS.LIVE_CONFIGS, { params })
  },

  // 获取所有启用的配置
  getAllEnabled() {
    return request.get(API_CONFIG.ENDPOINTS.LIVE_CONFIGS_ALL)
  },

  // 获取配置详情
  getDetail(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CONFIG_DETAIL.replace('{id}', id)
    return request.get(url)
  },

  // 创建配置
  create(data) {
    return request.post(API_CONFIG.ENDPOINTS.LIVE_CONFIGS, data)
  },

  // 更新配置
  update(id, data) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CONFIG_DETAIL.replace('{id}', id)
    return request.put(url, data)
  },

  // 删除配置
  delete(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CONFIG_DETAIL.replace('{id}', id)
    return request.delete(url)
  },

  // 设置默认配置
  setDefault(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CONFIG_SET_DEFAULT.replace('{id}', id)
    return request.post(url)
  },

  // 测试连接
  testConnection(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CONFIG_TEST.replace('{id}', id)
    return request.post(url)
  }
}

// 直播流管理
export const liveStreamApi = {
  // 获取直播流列表
  getList(params) {
    return request.get(API_CONFIG.ENDPOINTS.LIVE_STREAMS, { params })
  },

  // 获取直播流详情
  getDetail(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_DETAIL.replace('{id}', id)
    return request.get(url)
  },

  // 创建直播流
  create(data) {
    return request.post(API_CONFIG.ENDPOINTS.LIVE_STREAMS, data)
  },

  // 更新直播流
  update(id, data) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_DETAIL.replace('{id}', id)
    return request.put(url, data)
  },

  // 删除直播流
  delete(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_DETAIL.replace('{id}', id)
    return request.delete(url)
  },

  // 获取推流地址
  getPushUrl(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_PUSH_URL.replace('{id}', id)
    return request.get(url)
  },

  // 获取播放地址
  getPlayUrls(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_PLAY_URLS.replace('{id}', id)
    return request.get(url)
  },

  // 开始推流
  start(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_START.replace('{id}', id)
    return request.post(url)
  },

  // 停止推流
  stop(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_STOP.replace('{id}', id)
    return request.post(url)
  },

  // 更新观看人数
  updateViewerCount(id, data) {
    const url = API_CONFIG.ENDPOINTS.LIVE_STREAM_UPDATE_VIEWER.replace('{id}', id)
    return request.post(url, data)
  }
}

// 直播回调日志管理
export const liveCallbackApi = {
  // 获取回调日志列表
  getLogs(params) {
    return request.get(API_CONFIG.ENDPOINTS.LIVE_CALLBACK_LOGS, { params })
  },

  // 获取回调日志详情
  getLogDetail(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CALLBACK_LOG_DETAIL.replace('{id}', id)
    return request.get(url)
  },

  // 删除回调日志
  deleteLog(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_CALLBACK_LOG_DETAIL.replace('{id}', id)
    return request.delete(url)
  },

  // 清空回调日志
  clearLogs(data) {
    return request.post(API_CONFIG.ENDPOINTS.LIVE_CALLBACK_CLEAR, data)
  }
} 