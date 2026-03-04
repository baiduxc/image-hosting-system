import { request } from './index'
import { API_CONFIG } from './config'

// 直播课管理API
export const liveCoursesApi = {
  // 获取直播课列表
  async getLiveCourses(params = {}) {
    return await request.get(API_CONFIG.ENDPOINTS.LIVE_COURSES, { params })
  },
  
  // 获取直播课详情
  async getLiveCourse(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_COURSE_DETAIL.replace('{id}', id)
    return await request.get(url)
  },
  
  // 创建直播课
  async createLiveCourse(data) {
    return await request.post(API_CONFIG.ENDPOINTS.LIVE_COURSES, data)
  },
  
  // 更新直播课
  async updateLiveCourse(id, data) {
    const url = API_CONFIG.ENDPOINTS.LIVE_COURSE_DETAIL.replace('{id}', id)
    return await request.put(url, data)
  },
  
  // 删除直播课
  async deleteLiveCourse(id) {
    const url = API_CONFIG.ENDPOINTS.LIVE_COURSE_DETAIL.replace('{id}', id)
    return await request.delete(url)
  },
  
  // 开始直播
  async startLive(id, data = {}) {
    const url = API_CONFIG.ENDPOINTS.LIVE_COURSE_START.replace('{id}', id)

    return await request.post(url, data)
  },
  
  // 结束直播
  async endLive(id, data = {}) {
    const url = API_CONFIG.ENDPOINTS.LIVE_COURSE_END.replace('{id}', id)

    return await request.post(url, data)
  }
}

export default liveCoursesApi 