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

  // 上传文件到对象存储 - 前端分批异步上传版本
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

      const batchSize = 3 // 每批上传3个文件
      let completedCount = 0
      let successCount = 0

      // 分批处理文件
      for (let i = 0; i < pendingFiles.length; i += batchSize) {
        const batch = pendingFiles.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(pendingFiles.length / batchSize)
        


        try {
          // 将当前批次的文件转换为base64格式
          const batchFilesData = await Promise.all(
            batch.map(async (uploadFile, batchIndex) => {
              return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = () => {
                  const globalIndex = i + batchIndex + 1
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



          // 调用后端API上传当前批次
          const response = await apiService.uploadToStorage(batchFilesData, storageId)

          if (response.success && response.data) {
            
            // 处理当前批次的上传结果
            response.data.forEach((uploadedFile, batchIndex) => {
              const fileItem = batch[batchIndex]
              if (fileItem) {
                if (uploadedFile.success !== false && uploadedFile.url) {
                  // 上传成功
                  fileItem.status = 'success'
                  fileItem.progress = 100
                  fileItem.url = uploadedFile.url
                  successCount++
                } else {
                  // 上传失败
                  fileItem.status = 'error'
                  fileItem.progress = 0
                  fileItem.error = uploadedFile.error || '上传失败'
                }
                completedCount++
              }
            })
            
          } else {
            // 当前批次上传失败
            batch.forEach(f => {
              f.status = 'error'
              f.progress = 0
              f.error = response.message || '上传失败'
              completedCount++
            })
          }

        } catch (error: any) {
          
          // 当前批次出错
          batch.forEach(f => {
            f.status = 'error'
            f.progress = 0
            f.error = error.message || '网络错误或请求超时'
            completedCount++
          })
        }

        // 更新总体进度
        uploadProgress.value = Math.round((completedCount / pendingFiles.length) * 100)

        // 如果不是最后一批，稍微延迟一下避免请求过于频繁
        if (i + batchSize < pendingFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

    } catch (error: any) {
      
      // 更新所有uploading状态的文件为error
      uploadFiles.value.forEach(f => {
        if (f.status === 'uploading') {
          f.status = 'error'
          f.progress = 0
          f.error = error.message || '网络错误或请求超时'
        }
      })
      uploadProgress.value = 0
    } finally {
      isUploading.value = false
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