<template>
  <div class="upload-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">上传媒体</h1>
      <p class="page-description">上传图片/视频到对象存储，支持网络链接转存</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 上传区域卡片 -->
      <t-card class="upload-card">
        <!-- 拖拽上传区域 -->
        <div 
          class="upload-area"
          :class="{ 'drag-over': isDragOver, 'has-files': uploadFiles.length > 0 }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <div class="upload-content">
            <UploadIcon class="upload-icon" />
            <h3 class="upload-title">拖拽文件到此处上传</h3>
            <p class="upload-desc">支持图片与视频（JPG/PNG/GIF/WebP/MP4/WebM/MOV），单个文件最大 200MB</p>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,video/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <t-button theme="primary" size="large" @click="fileInput?.click()">
              选择文件
            </t-button>
          </div>
        </div>

        <!-- 上传队列区域（紧凑列表） -->
        <div v-if="uploadFiles.length > 0" class="upload-queue">
          <!-- 列表头部工具栏 -->
          <div class="queue-toolbar">
            <div class="toolbar-left">
              <span class="queue-count">{{ uploadFiles.length }} 个文件</span>
              <span v-if="uploadStats.success > 0" class="status-badge success">
                <CheckCircleIcon class="badge-icon" />{{ uploadStats.success }}
              </span>
              <span v-if="uploadStats.error > 0" class="status-badge error">
                <XCircleIcon class="badge-icon" />{{ uploadStats.error }}
              </span>
              <span v-if="uploadStats.pending > 0" class="status-badge pending">
                <ClockIcon class="badge-icon" />{{ uploadStats.pending }}
              </span>
            </div>
            <div class="toolbar-right">
              <t-button 
                theme="primary" 
                size="small"
                :loading="isUploading"
                :disabled="uploadStats.pending === 0 || !selectedStorageId"
                @click="handleUpload"
              >
                {{ isUploading ? '上传中...' : '开始上传' }}
              </t-button>
              <t-button variant="outline" size="small" @click="clearFiles">
                清空
              </t-button>
            </div>
          </div>

          <!-- 紧凑文件列表 -->
          <div class="file-list">
            <div 
              v-for="file in uploadFiles" 
              :key="file.id"
              class="file-item"
              :class="file.status"
            >
              <!-- 缩略图 -->
              <div class="file-thumb">
                <img v-if="file.preview && file.previewType === 'image'" :src="file.preview" alt="" />
                <video
                  v-else-if="file.preview && file.previewType === 'video'"
                  :src="file.preview"
                  muted
                  preload="metadata"
                  playsinline
                ></video>
                <div v-else class="thumb-placeholder">
                  <VideoIcon v-if="file.file.type.startsWith('video/')" class="placeholder-icon" />
                  <ImageIcon v-else class="placeholder-icon" />
                </div>
                <!-- 状态覆盖层 -->
                <div v-if="file.status === 'uploading'" class="thumb-overlay">
                  <span class="progress-text">{{ file.progress }}%</span>
                </div>
                <div v-else-if="file.status === 'success'" class="thumb-overlay success">
                  <CheckCircleIcon class="overlay-icon" />
                </div>
                <div v-else-if="file.status === 'error'" class="thumb-overlay error">
                  <XCircleIcon class="overlay-icon" />
                </div>
              </div>

              <!-- 文件信息 -->
              <div class="file-meta">
                <p class="file-name" :title="file.file.name">{{ file.file.name }}</p>
                <p class="file-size">{{ formatFileSize(file.file.size) }}</p>
              </div>

              <!-- 操作按钮 -->
              <div class="file-ops">
                <t-button 
                  v-if="file.status === 'success' && file.url"
                  size="small"
                  variant="text"
                  @click="copyToClipboard(file.url!)"
                >
                  <CopyIcon class="op-icon" />
                </t-button>
                <t-button 
                  v-if="file.status === 'error'"
                  size="small"
                  variant="text"
                  @click="retryUpload(file.id)"
                >
                  <RefreshCwIcon class="op-icon" />
                </t-button>
                <t-button 
                  size="small"
                  variant="text"
                  @click="removeFile(file.id)"
                >
                  <XIcon class="op-icon" />
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </t-card>

      <!-- URL转存区域 -->
      <t-card class="transfer-card">
        <template #header>
          <h3 class="card-title">网络媒体转存</h3>
        </template>

        <div class="transfer-content">
          <t-textarea
            v-model="urlList"
            placeholder="请输入媒体URL，每行一个链接（最多20个）&#10;支持图片、视频直链及 YouTube/X.com/抖音分享链接"
            :rows="3"
            class="url-input"
          />
          
          <div class="transfer-toolbar">
            <span class="transfer-hint">支持图片/视频批量转存，支持 YouTube、X.com、抖音分享链接</span>
            <div class="transfer-actions">
              <t-button 
                variant="outline"
                size="small"
                :loading="validating"
                :disabled="!urlList.trim()"
                @click="validateUrls"
              >
                验证
              </t-button>
              <t-button 
                theme="primary"
                size="small"
                :loading="isTransferring"
                :disabled="!urlList.trim()"
                @click="handleTransfer"
              >
                转存
              </t-button>
            </div>
          </div>

          <!-- 验证/转存结果（紧凑列表） -->
          <div v-if="validationResults.length > 0 || transferProgress.length > 0" class="result-list">
            <div 
              v-for="(item, index) in (transferProgress.length > 0 ? transferProgress : validationResults)" 
              :key="index"
              class="result-item"
              :class="getResultClass(item)"
            >
              <div class="result-icon">
                <CheckCircleIcon v-if="isSuccess(item)" class="icon-success" />
                <XCircleIcon v-else-if="isError(item)" class="icon-error" />
                <div v-else class="loading-dot"></div>
              </div>
              <div class="result-info">
                <p class="result-url">{{ item.url || item.originalUrl }}</p>
                <p v-if="item.newUrl" class="result-new">{{ item.newUrl }}</p>
                <p v-else-if="item.error || item.message" class="result-msg">{{ item.error || item.message }}</p>
              </div>
              <t-button 
                v-if="item.newUrl"
                size="small"
                variant="text"
                @click="copyToClipboard(item.newUrl)"
              >
                <CopyIcon class="op-icon" />
              </t-button>
            </div>
          </div>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  UploadIcon,
  ImageIcon,
  VideoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CopyIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUpload } from '@/composables/useUpload'
import { useStorage } from '@/composables/useStorage'
import { apiService } from '@/services/api'

// 使用上传组合式函数
const {
  uploadFiles,
  isUploading,
  addFiles,
  removeFile,
  clearFiles,
  upload,
  retryUpload,
  getUploadStats
} = useUpload()

// 使用存储组合式函数
const { selectedStorageId, loadStorageOptions } = useStorage()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const urlList = ref('')
const isTransferring = ref(false)
const validating = ref(false)
const validationResults = ref<any[]>([])
const transferProgress = ref<any[]>([])

// 计算属性
const uploadStats = computed(() => getUploadStats())

// 结果状态判断
const getResultClass = (item: any) => {
  if (item.status === 'success' || item.valid === true) return 'success'
  if (item.status === 'error' || item.valid === false) return 'error'
  if (item.status === 'processing') return 'processing'
  return ''
}

const isSuccess = (item: any) => {
  return item.status === 'success' || item.valid === true
}

const isError = (item: any) => {
  return item.status === 'error' || item.valid === false
}

// 拖拽处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const isSupportedMediaFile = (file: File) => {
  return file.type.startsWith('image/') || file.type.startsWith('video/')
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  const mediaFiles = files.filter(isSupportedMediaFile)

  if (mediaFiles.length > 0) {
    addFilesWithPreview(mediaFiles)
  } else {
    MessagePlugin.error('请拖拽图片或视频文件')
  }
}

// 文件选择处理
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length > 0) {
    addFilesWithPreview(files)
  }
  
  target.value = ''
}

// 添加文件并生成预览
const addFilesWithPreview = (files: File[]) => {
  const mediaFiles = files.filter(isSupportedMediaFile)

  if (mediaFiles.length === 0) {
    MessagePlugin.error('未检测到可上传的图片或视频文件')
    return
  }

  addFiles(mediaFiles)

  mediaFiles.forEach((file, index) => {
    const fileIndex = uploadFiles.value.length - mediaFiles.length + index
    if (fileIndex < 0 || !uploadFiles.value[fileIndex]) {
      return
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (uploadFiles.value[fileIndex]) {
          uploadFiles.value[fileIndex].preview = e.target?.result as string
          uploadFiles.value[fileIndex].previewType = 'image'
        }
      }
      reader.readAsDataURL(file)
      return
    }

    if (file.type.startsWith('video/')) {
      uploadFiles.value[fileIndex].preview = URL.createObjectURL(file)
      uploadFiles.value[fileIndex].previewType = 'video'
    }
  })

  MessagePlugin.success(`已添加 ${mediaFiles.length} 个文件`)
}

// 处理上传
const handleUpload = () => {
  if (!selectedStorageId.value) {
    MessagePlugin.error('请先选择存储位置')
    return
  }
  upload(selectedStorageId.value)
}

// URL验证
const validateUrls = async () => {
  const urls = urlList.value.split('\n').filter(url => url.trim())
  if (urls.length === 0) return
  if (urls.length > 20) {
    MessagePlugin.error('最多20个URL')
    return
  }

  validating.value = true
  validationResults.value = urls.map(url => ({ url, valid: null }))

  try {
    const response = await apiService.validateUrls(urls)
    if (response.success) {
      validationResults.value = response.data || []
    }
  } catch (error: any) {
    MessagePlugin.error('验证失败: ' + error.message)
  } finally {
    validating.value = false
  }
}

// URL转存（图片/视频）
const handleTransfer = async () => {
  const urls = urlList.value.split('\n').filter(url => url.trim())
  if (urls.length === 0) return
  if (urls.length > 20) {
    MessagePlugin.error('最多20个URL')
    return
  }

  isTransferring.value = true
  transferProgress.value = urls.map(url => ({ originalUrl: url, status: 'processing' }))

  try {
    const response = await apiService.transferImages(urls)
    if (response.success) {
      transferProgress.value = response.data || []
    }
  } catch (error: any) {
    const isTimeout = error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')
    MessagePlugin.error(isTimeout ? '转存超时，请稍后查看结果或缩短单次链接数量后重试' : '转存失败: ' + (error?.message || '未知错误'))
  } finally {
    isTransferring.value = false
  }
}

// 复制
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    MessagePlugin.success('已复制')
  } catch (error) {
    MessagePlugin.error('复制失败')
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

onMounted(() => {
  loadStorageOptions()
})
</script>

<style scoped>
.upload-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-top: 30px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.main-content {
  padding: 0 24px 24px;
}

.upload-card,
.transfer-card {
  margin-bottom: 16px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed var(--td-border-level-1-color);
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--td-brand-color);
  background-color: var(--td-brand-color-light);
}

.upload-area.has-files {
  padding: 24px;
  border-style: solid;
  border-color: var(--td-border-level-2-color);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: var(--td-text-color-placeholder);
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.upload-desc {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.hidden {
  display: none;
}

/* 上传队列 - 紧凑设计 */
.upload-queue {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--td-border-level-1-color);
}

.queue-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-count {
  font-size: 13px;
  color: var(--td-text-color-secondary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.success {
  background: var(--td-success-color-light);
  color: var(--td-success-color);
}

.status-badge.error {
  background: var(--td-error-color-light);
  color: var(--td-error-color);
}

.status-badge.pending {
  background: var(--td-warning-color-light);
  color: var(--td-warning-color);
}

.badge-icon {
  width: 10px;
  height: 10px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

/* 文件列表 - 网格布局 */
.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 8px;
  transition: all 0.2s;
}

.file-item:hover {
  background: var(--td-bg-color-container-hover);
}

/* 缩略图 */
.file-thumb {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--td-bg-color-container);
}

.file-thumb img,
.file-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  width: 20px;
  height: 20px;
  color: var(--td-text-color-placeholder);
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.thumb-overlay.success {
  background: rgba(0, 168, 112, 0.8);
}

.thumb-overlay.error {
  background: rgba(217, 48, 56, 0.8);
}

.progress-text {
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.overlay-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* 文件信息 */
.file-meta {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 12px;
  color: var(--td-text-color-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: var(--td-text-color-placeholder);
  margin: 2px 0 0 0;
}

/* 操作按钮 */
.file-ops {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-ops {
  opacity: 1;
}

.op-icon {
  width: 14px;
  height: 14px;
}

/* 转存卡片 */
.card-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.transfer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transfer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transfer-hint {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.transfer-actions {
  display: flex;
  gap: 8px;
}

/* 结果列表 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 6px;
  border-left: 2px solid transparent;
}

.result-item.success {
  border-left-color: var(--td-success-color);
}

.result-item.error {
  border-left-color: var(--td-error-color);
}

.result-item.processing {
  border-left-color: var(--td-brand-color);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.icon-success {
  color: var(--td-success-color);
}

.icon-error {
  color: var(--td-error-color);
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--td-brand-color);
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-url {
  font-size: 12px;
  color: var(--td-text-color-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-new {
  font-size: 11px;
  color: var(--td-success-color);
  margin: 2px 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-msg {
  font-size: 11px;
  color: var(--td-error-color);
  margin: 2px 0 0 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    padding: 0 16px 16px;
  }

  .file-list {
    grid-template-columns: 1fr;
  }

  .file-ops {
    opacity: 1;
  }

  .queue-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .transfer-toolbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}
</style>
