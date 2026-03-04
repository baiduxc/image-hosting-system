import { request } from './index'
import { API_CONFIG, getApiUrl } from './config'

// 课程管理API
export const coursesApi = {
  // 获取课程列表
  async getCourses(params = {}) {
    return await request.get(API_CONFIG.ENDPOINTS.COURSES, params)
  },
  
  // 获取课程详情
  async getCourse(id) {
    const url = API_CONFIG.ENDPOINTS.COURSE_DETAIL.replace('{id}', id)
    return await request.get(url)
  },
  
  // 创建课程
  async createCourse(data) {
    return await request.post(API_CONFIG.ENDPOINTS.COURSES, data)
  },
  
  // 更新课程
  async updateCourse(id, data) {
    const url = API_CONFIG.ENDPOINTS.COURSE_DETAIL.replace('{id}', id)
    return await request.put(url, data)
  },
  
  // 删除课程
  async deleteCourse(id) {
    const url = API_CONFIG.ENDPOINTS.COURSE_DETAIL.replace('{id}', id)
    return await request.delete(url)
  },
  
  // 获取课程章节列表
  async getChapters(courseId) {
    const url = API_CONFIG.ENDPOINTS.COURSE_CHAPTERS.replace('{id}', courseId)
    return await request.get(url)
  },
  
  // 添加章节
  async createChapter(courseId, data) {
    const url = API_CONFIG.ENDPOINTS.COURSE_CHAPTERS.replace('{id}', courseId)
    return await request.post(url, data)
  },
  
  // 更新章节
  async updateChapter(courseId, chapterId, data) {
    const url = API_CONFIG.ENDPOINTS.COURSE_CHAPTER_DETAIL
      .replace('{id}', courseId)
      .replace('{chapterId}', chapterId)
    return await request.put(url, data)
  },
  
  // 删除章节
  async deleteChapter(courseId, chapterId) {
    const url = API_CONFIG.ENDPOINTS.COURSE_CHAPTER_DETAIL
      .replace('{id}', courseId)
      .replace('{chapterId}', chapterId)
    return await request.delete(url)
  }
}

// 课程分类API
export const courseCategoriesApi = {
  // 获取分类列表
  async getCategories(params = {}) {
    return await request.get(API_CONFIG.ENDPOINTS.COURSE_CATEGORIES, params)
  },
  
  // 获取所有分类（下拉选择）
  async getAllCategories() {
    return await request.get(API_CONFIG.ENDPOINTS.COURSE_CATEGORIES_ALL)
  },
  
  // 创建分类
  async createCategory(data) {
    return await request.post(API_CONFIG.ENDPOINTS.COURSE_CATEGORIES, data)
  },
  
  // 更新分类
  async updateCategory(id, data) {
    return await request.put(`${API_CONFIG.ENDPOINTS.COURSE_CATEGORIES}/${id}`, data)
  },
  
  // 删除分类
  async deleteCategory(id) {
    return await request.delete(`${API_CONFIG.ENDPOINTS.COURSE_CATEGORIES}/${id}`)
  }
}

export default coursesApi 