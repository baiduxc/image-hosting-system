import { ref, reactive } from 'vue'
import { apiService } from '@/services/api'

export interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  url?: string
  error?: string
}

export function useUpload() {
  const uploadFiles = ref<UploadFile[]>([])
  const isUploading = ref(false)
  const uploadProgress = ref(0)

  // 添加文件到上传队列
  const addFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending' as const,
      progress: 0
    }))
    uploadFiles.value.push(...newFiles)
  }

  // 移除文件
  const removeFile = (id: string) => {
    const index = uploadFiles.value.findIndex(f => f.id === id)
    if (index > -1) {
      uploadFiles.value.splice(index, 1)
    }
  }

  // 清空文件列表
  const clearFiles = () => {
    uploadFiles.value = []
  }

  // 上传文件到对象存储
  const upload = async (storageId?: string) => {
    if (uploadFiles.value.length === 0) return

    if (!storageId) {
      return
    }

    isUploading.value = true
    uploadProgress.value = 0

    try {
      // 只上传pending状态的文件
      const pendingFiles = uploadFiles.value.filter(f => f.status === 'pending')
      if (pendingFiles.length === 0) {
        isUploading.value = false
        return
      }

      // 更新状态为uploading
      pendingFiles.forEach(f => {
        f.status = 'uploading'
        f.progress = 0
      })

      // 将文件转换为base64格式
      const filesData = await Promise.all(
        pendingFiles.map(async (uploadFile) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: uploadFile.file.name,
                size: uploadFile.file.size,
                type: uploadFile.file.type,
                data: reader.result
              })
            }
            reader.readAsDataURL(uploadFile.file)
          })
        })
      )

      // 调用新的对象存储上传API
      const response = await apiService.uploadToStorage(filesData, storageId)

      if (response.success && response.data) {
        // 更新上传成功的文件状态
        response.data.forEach((uploadedFile, index) => {
          const fileItem = pendingFiles[index]
          if (fileItem) {
            fileItem.status = 'success'
            fileItem.progress = 100
            fileItem.url = uploadedFile.url
          }
        })
      } else {
        // 上传失败
        pendingFiles.forEach(f => {
          f.status = 'error'
          f.error = response.message || '上传失败'
        })
      }

    } catch (error: any) {
      console.error('上传错误:', error)
      // 更新所有uploading状态的文件为error
      uploadFiles.value.forEach(f => {
        if (f.status === 'uploading') {
          f.status = 'error'
          f.error = error.message || '上传失败'
        }
      })
    } finally {
      isUploading.value = false
      uploadProgress.value = 100
    }
  }

  // 重试上传
  const retryUpload = (id: string) => {
    const file = uploadFiles.value.find(f => f.id === id)
    if (file && file.status === 'error') {
      file.status = 'pending'
      file.progress = 0
      file.error = undefined
    }
  }

  // 获取上传统计
  const getUploadStats = () => {
    const total = uploadFiles.value.length
    const success = uploadFiles.value.filter(f => f.status === 'success').length
    const error = uploadFiles.value.filter(f => f.status === 'error').length
    const pending = uploadFiles.value.filter(f => f.status === 'pending').length
    const uploading = uploadFiles.value.filter(f => f.status === 'uploading').length

    return { total, success, error, pending, uploading }
  }

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    upload,
    retryUpload,
    getUploadStats
  }
}