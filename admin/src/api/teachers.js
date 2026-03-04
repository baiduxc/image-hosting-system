import { request } from './index'
import { API_CONFIG } from './config'

// 讲师管理API
export const teachersApi = {
  // 获取讲师列表
  async getTeachers(params = {}) {
    return await request.get(API_CONFIG.ENDPOINTS.TEACHERS, params)
  },
  
  // 获取讲师详情
  async getTeacher(id) {
    const url = API_CONFIG.ENDPOINTS.TEACHER_DETAIL.replace('{id}', id)
    return await request.get(url)
  },
  
  // 创建讲师
  async createTeacher(data) {
    return await request.post(API_CONFIG.ENDPOINTS.TEACHERS, data)
  },
  
  // 更新讲师
  async updateTeacher(id, data) {
    const url = API_CONFIG.ENDPOINTS.TEACHER_DETAIL.replace('{id}', id)
    return await request.put(url, data)
  },
  
  // 删除讲师
  async deleteTeacher(id) {
    const url = API_CONFIG.ENDPOINTS.TEACHER_DETAIL.replace('{id}', id)
    return await request.delete(url)
  },
  
  // 获取所有讲师（下拉选择）
  async getAllTeachers() {
    return await request.get(API_CONFIG.ENDPOINTS.TEACHERS_ALL)
  }
}

export default teachersApi 