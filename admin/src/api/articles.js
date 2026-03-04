import request from './index'

// 文章管理
export const articleApi = {
  // 获取文章列表
  getList(params) {
    return request.get('/articles', { params })
  },

  // 获取文章详情
  getDetail(id) {
    return request.get(`/articles/${id}`)
  },

  // 新增文章
  create(data) {
    return request.post('/articles', data)
  },

  // 更新文章
  update(id, data) {
    return request.put(`/articles/${id}`, data)
  },

  // 删除文章
  delete(id) {
    return request.delete(`/articles/${id}`)
  },

  // 批量操作文章
  batchAction(data) {
    return request.post('/articles/batch', data)
  }
}

// 文章分类管理
export const categoryApi = {
  // 获取分类列表
  getList(params) {
    return request.get('/article-categories', { params })
  },

  // 获取所有分类（扁平）
  getAll() {
    return request.get('/article-categories/all')
  },

  // 获取分类树
  getTree() {
    return request.get('/article-categories/tree')
  },

  // 获取分类详情
  getDetail(id) {
    return request.get(`/article-categories/${id}`)
  },

  // 新增分类
  create(data) {
    return request.post('/article-categories', data)
  },

  // 更新分类
  update(id, data) {
    return request.put(`/article-categories/${id}`, data)
  },

  // 删除分类
  delete(id) {
    return request.delete(`/article-categories/${id}`)
  }
}

// 文章标签管理
export const tagApi = {
  // 获取标签列表
  getList(params) {
    return request.get('/article-tags', { params })
  },

  // 获取所有标签
  getAll() {
    return request.get('/article-tags/all')
  },

  // 获取标签详情
  getDetail(id) {
    return request.get(`/article-tags/${id}`)
  },

  // 新增标签
  create(data) {
    return request.post('/article-tags', data)
  },

  // 更新标签
  update(id, data) {
    return request.put(`/article-tags/${id}`, data)
  },

  // 删除标签
  delete(id) {
    return request.delete(`/article-tags/${id}`)
  },

  // 批量删除标签
  batchDelete(ids) {
    return request.post('/article-tags/batch-delete', { ids })
  }
} 