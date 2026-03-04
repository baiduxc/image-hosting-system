import request from './index'

// 支付配置管理
export const paymentConfigApi = {
  // 获取配置列表
  getList(params) {
    return request.get('/pay-configs', { params })
  },

  // 获取所有启用的配置
  getAllEnabled() {
    return request.get('/pay-configs/enabled')
  },

  // 获取配置详情
  getDetail(id) {
    return request.get(`/pay-configs/${id}`)
  },

  // 创建配置
  create(data) {
    return request.post('/pay-configs', data)
  },

  // 更新配置
  update(id, data) {
    return request.put(`/pay-configs/${id}`, data)
  },

  // 删除配置
  delete(id) {
    return request.delete(`/pay-configs/${id}`)
  },

  // 更新配置状态
  updateStatus(id, data) {
    return request.put(`/pay-configs/${id}/status`, data)
  },

  // 设置默认配置
  setDefault(id) {
    return request.put(`/pay-configs/${id}/default`)
  }
}

// 支付通知日志管理
export const payNotifyLogApi = {
  // 获取通知日志列表
  getList(params) {
    return request.get('/pay-notify-logs', { params })
  },

  // 获取通知日志详情
  getDetail(id) {
    return request.get(`/pay-notify-logs/${id}`)
  },

  // 删除通知日志
  delete(id) {
    return request.delete(`/pay-notify-logs/${id}`)
  },

  // 批量删除通知日志
  batchDelete(data) {
    return request.delete('/pay-notify-logs/batch', { data })
  },

  // 清空通知日志
  clear() {
    return request.delete('/pay-notify-logs')
  }
}

// 支付订单管理
export const paymentOrderApi = {
  // 获取支付订单列表
  getList(params) {
    return request.get('/payment-orders', { params })
  },

  // 获取支付订单详情
  getDetail(id) {
    return request.get(`/payment-orders/${id}`)
  },

  // 创建支付订单
  create(data) {
    return request.post('/payment-orders', data)
  },

  // 更新支付订单状态
  updateStatus(id, data) {
    return request.post(`/payment-orders/${id}/update-status`, data)
  },

  // 删除支付订单
  delete(id) {
    return request.delete(`/payment-orders/${id}`)
  },

  // 支付统计
  getStatistics(params) {
    return request.get('/payment-orders/statistics', { params })
  }
}

// 会员余额管理
export const memberBalanceApi = {
  // 获取余额变动记录
  getList(params) {
    return request.get('/member-balance', { params })
  },

  // 会员充值
  recharge(data) {
    return request.post('/member-balance/recharge', data)
  },

  // 扣除余额
  deduct(data) {
    return request.post('/member-balance/deduct', data)
  },

  // 余额统计
  getStatistics(params) {
    return request.get('/member-balance/statistics', { params })
  }
}

export default { paymentConfigApi, payNotifyLogApi } 