// 上传工具函数
import { Message } from '@arco-design/web-vue'

/**
 * 处理文件上传响应
 * @param {Object} fileItem - 上传文件项
 * @param {Function} onSuccess - 成功回调，参数为文件URL
 * @param {Function} onError - 错误回调，可选
 */
export const handleUploadResponse = (fileItem, onSuccess, onError) => {

  
  if (fileItem.response) {

  }

  
  if (fileItem.status === 'done' && fileItem.response) {
    // 🎯 根据控制台调试信息，上传组件收到的是完整响应格式：
    // { code: 200, msg: "上传成功", data: { url: "...", path: "...", ... } }
    // 需要手动解包数据
    
    let actualData = fileItem.response
    
    // 如果是标准API响应格式，解包data字段
    if (actualData && actualData.code === 200 && actualData.data) {
      actualData = actualData.data

    }
    
    if (actualData && actualData.url) {
      const fileUrl = actualData.url

      onSuccess && onSuccess(fileUrl, actualData)
      return fileUrl
    } else {
      console.error('❌ 文件上传响应格式错误，期望包含url字段')
      console.error('解包后的数据:', JSON.stringify(actualData, null, 2))
      const errorMsg = '文件上传失败：响应格式错误'
      Message.error(errorMsg)
      onError && onError(errorMsg, fileItem.response)
      return null
    }
  } else if (fileItem.status === 'error') {
    console.error('❌ 文件上传失败，状态为error:', fileItem.response)
    const errorMsg = '文件上传失败，请重试'
    Message.error(errorMsg)
    onError && onError(errorMsg, fileItem.response)
    return null
  }
  
  return null
}

/**
 * 创建上传配置
 * @param {string} uploadUrl - 上传URL
 * @param {Object} headers - 请求头
 * @param {string} accept - 接受的文件类型
 * @returns {Object} 上传配置对象
 */
export const createUploadConfig = (uploadUrl, headers, accept = 'image/*') => {
  return {
    action: uploadUrl,
    headers,
    accept,
    showFileList: false,
    limit: 1
  }
}

/**
 * 验证文件类型和大小
 * @param {File} file - 文件对象
 * @param {Array} allowedTypes - 允许的文件类型
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 验证结果
 */
export const validateFile = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 10 * 1024 * 1024) => {
  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    Message.error(`不支持的文件类型，请上传 ${allowedTypes.map(type => type.split('/')[1]).join('、')} 格式的文件`)
    return false
  }
  
  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024)
    Message.error(`文件大小不能超过 ${maxSizeMB}MB`)
    return false
  }
  
  return true
}

/**
 * 图片上传处理器
 * @param {Object} fileItem - 上传文件项
 * @param {Function} onSuccess - 成功回调
 * @param {string} successMessage - 成功提示消息
 */
export const handleImageUpload = (fileItem, onSuccess, successMessage = '图片上传成功') => {
  return handleUploadResponse(
    fileItem,
    (url) => {
      Message.success(successMessage)
      onSuccess && onSuccess(url)
    },
    (error) => {
      console.error('图片上传失败:', error)
    }
  )
}

/**
 * 头像上传处理器
 * @param {Array} fileList - 文件列表
 * @param {Function} onSuccess - 成功回调
 */
export const handleAvatarUpload = (fileList, onSuccess) => {
  if (fileList.length > 0) {
    const file = fileList[0]
    return handleImageUpload(file, onSuccess, '头像上传成功')
  }
}

/**
 * Logo上传处理器
 * @param {Array} fileList - 文件列表
 * @param {Function} onSuccess - 成功回调
 */
export const handleLogoUpload = (fileList, onSuccess) => {
  if (fileList.length > 0) {
    const file = fileList[0]
    return handleImageUpload(file, onSuccess, 'Logo上传成功')
  }
}

/**
 * 封面上传处理器
 * @param {Array} fileList - 文件列表
 * @param {Object} fileItem - 当前文件项
 * @param {Function} onSuccess - 成功回调
 */
export const handleCoverUpload = (fileList, fileItem, onSuccess) => {
  return handleImageUpload(fileItem, onSuccess, '封面上传成功')
} 