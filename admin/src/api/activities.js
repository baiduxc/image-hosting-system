import request from './index'

// 活动分类管理API
export const categoryApi = {
  // 获取分类列表
  getList(params) {
    return request.get('/activity-categories', { params })
  },
  
  // 获取所有分类
  getAll() {
    return request.get('/activity-categories/all')
  },
  
  // 获取分类详情
  getDetail(id) {
    return request.get(`/activity-categories/${id}`)
  },
  
  // 添加分类
  create(data) {
    return request.post('/activity-categories', data)
  },
  
  // 更新分类
  update(id, data) {
    return request.put(`/activity-categories/${id}`, data)
  },
  
  // 删除分类
  delete(id) {
    return request.delete(`/activity-categories/${id}`)
  }
}

// 活动管理API
export const activityApi = {
  // 获取活动列表
  getList(params) {
    return request.get('/activities', { params })
  },
  
  // 获取活动详情
  getDetail(id) {
    return request.get(`/activities/${id}`)
  },
  
  // 添加活动
  create(data) {
    return request.post('/activities', data)
  },
  
  // 更新活动
  update(id, data) {
    return request.put(`/activities/${id}`, data)
  },
  
  // 删除活动
  delete(id) {
    return request.delete(`/activities/${id}`)
  },
  
  // 批量操作活动
  batchAction(data) {
    return request.post('/activities/batch', data)
  },
  
  // 获取活动报名列表
  getSignups(id, params) {
    return request.get(`/activities/${id}/signups`, { params })
  }
}

// 活动报名管理API
export const signupApi = {
  // 获取报名列表
  getList(params) {
    return request.get('/activity-signups', { params })
  },
  
  // 获取报名详情
  getDetail(id) {
    return request.get(`/activity-signups/${id}`)
  },
  
  // 审核报名
  audit(id, data) {
    return request.post(`/activity-signups/${id}/audit`, data)
  },
  
  // 批量审核报名
  batchAudit(data) {
    return request.post('/activity-signups/batch-audit', data)
  },
  
  // 签到
  checkin(id) {
    return request.post(`/activity-signups/${id}/checkin`)
  },
  
  // 取消签到
  cancelCheckin(id) {
    return request.post(`/activity-signups/${id}/cancel-checkin`)
  },
  
  // 删除报名记录
  delete(id) {
    return request.delete(`/activity-signups/${id}`)
  }
} 