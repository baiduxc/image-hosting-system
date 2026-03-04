import { request } from './index'

// 订单管理API
export const ordersApi = {
  // 获取订单列表
  async getOrders(params = {}) {
    return await request.get('/orders', { params })
  },
  
  // 获取订单详情
  async getOrder(id) {
    return await request.get(`/orders/${id}`)
  },
  
  // 创建订单
  async createOrder(data) {
    return await request.post('/orders', data)
  },
  
  // 更新订单
  async updateOrder(id, data) {
    return await request.put('/orders', { id, ...data })
  },
  
  // 更新订单状态
  async updateOrderStatus(id, data) {
    return await request.put(`/orders/${id}/status`, data)
  },
  
  // 处理退款
  async processRefund(id, data) {
    return await request.post(`/orders/${id}/refund`, data)
  },
  
  // 获取订单支付记录
  async getOrderPayments(id) {
    return await request.get('/orders/payments', { params: { id } })
  },
  
  // 删除订单
  async deleteOrder(id) {
    return await request.delete(`/orders/${id}`)
  },
  
  // 取消订单
  async cancelOrder(id) {
    return await request.patch(`/api/orders/${id}/cancel`)
  },
  
  // 批量删除订单
  async batchDeleteOrders(data) {
    return await request.delete('/orders/batch', { data })
  },
  
  // 订单统计
  async getOrderStatistics(params = {}) {
    return await request.get('/orders/statistics', { params })
  },
  
  // 导出订单
  async exportOrders(params = {}) {
    return await request.get('/orders/export', { 
      params,
      responseType: 'blob'
    })
  }
}

// 支付管理API (前端API，保持/api前缀)
export const paymentApi = {
  // 创建支付
  async createPayment(data) {
    return await request.post('/api/payments', data)
  },
  
  // 查询支付状态
  async getPaymentStatus(orderNo, params = {}) {
    return await request.get(`/api/payments/${orderNo}/status`, { params })
  },
  
  // 查询订单支付状态
  async getOrderPaymentStatus(id, params = {}) {
    return await request.get(`/api/orders/${id}/payment-status`, { params })
  }
}

export default ordersApi 