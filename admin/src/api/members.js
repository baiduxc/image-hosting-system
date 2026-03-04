import { request } from './index'
import { API_CONFIG } from './config'

// 会员等级管理API
export const memberLevelApi = {
  // 获取会员等级列表
  getList(params = {}) {
    return request.get(API_CONFIG.ENDPOINTS.MEMBER_LEVELS, params)
  },

  // 获取所有会员等级
  getAll() {
    return request.get(API_CONFIG.ENDPOINTS.MEMBER_LEVELS_ALL)
  },

  // 获取会员等级详情
  getDetail(id) {
    return request.get(API_CONFIG.ENDPOINTS.MEMBER_LEVELS.replace('{id}', id))
  },

  // 创建会员等级
  create(data) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_LEVELS, data)
  },

  // 更新会员等级
  update(id, data) {
    return request.put(API_CONFIG.ENDPOINTS.MEMBER_LEVELS + `/${id}`, data)
  },

  // 删除会员等级
  delete(id) {
    return request.delete(API_CONFIG.ENDPOINTS.MEMBER_LEVELS + `/${id}`)
  }
}

// 会员管理API
export const memberApi = {
  // 获取会员列表
  getList(params = {}) {
    return request.get(API_CONFIG.ENDPOINTS.MEMBERS, params)
  },

  // 获取会员详情
  getDetail(id) {
    return request.get(API_CONFIG.ENDPOINTS.MEMBER_DETAIL.replace('{id}', id))
  },

  // 创建会员
  create(data) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBERS, data)
  },

  // 更新会员信息
  update(id, data) {
    return request.put(API_CONFIG.ENDPOINTS.MEMBER_DETAIL.replace('{id}', id), data)
  },

  // 删除会员
  delete(id) {
    return request.delete(API_CONFIG.ENDPOINTS.MEMBER_DETAIL.replace('{id}', id))
  },

  // 会员充值
  recharge(id, data) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_RECHARGE.replace('{id}', id), data)
  },

  // 重置会员密码
  resetPassword(id, data) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_RESET_PASSWORD.replace('{id}', id), data)
  },

  // 设置会员等级
  setLevel(id, data) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_SET_LEVEL.replace('{id}', id), data)
  },

  // 启用/禁用会员
  toggleStatus(id) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_TOGGLE_STATUS.replace('{id}', id))
  },

  // 启用会员
  enable(id) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_DETAIL.replace('{id}', id) + '/enable')
  },

  // 禁用会员
  disable(id) {
    return request.post(API_CONFIG.ENDPOINTS.MEMBER_DETAIL.replace('{id}', id) + '/disable')
  }
}

// 会员余额管理API
export const memberBalanceApi = {
  // 获取余额记录
  getList(params = {}) {
    return request.get('/member-balance', params)
  },

  // 余额统计
  getStatistics(params = {}) {
    return request.get('/member-balance/statistics', params)
  },

  // 会员充值
  recharge(data) {
    return request.post('/member-balance/recharge', data)
  },

  // 余额扣除
  deduct(data) {
    return request.post('/member-balance/deduct', data)
  }
}

export default memberApi 