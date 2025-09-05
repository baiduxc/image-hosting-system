<template>
  <div class="upload-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">上传图片</h1>
      <p class="page-description">上传图片到对象存储和网络图片转存</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 拖拽上传区域 -->
      <t-card class="upload-card">
        <div 
          class="upload-area"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <div class="upload-content">
            <UploadIcon class="upload-icon" />
            <h3 class="upload-title">拖拽文件到此处上传</h3>
            <p class="upload-desc">支持 JPG、PNG、GIF、WebP 格式，单个文件最大 10MB</p>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="upload-actions">
              <t-button theme="primary" size="large" @click="fileInput?.click()">
                选择文件
              </t-button>
            </div>
          </div>
        </div>
      </t-card>

      <!-- URL转存区域 -->
      <t-card class="transfer-card">
        <template #header>
          <h3 class="card-title">网络图片转存</h3>
        </template>

        <div class="transfer-content">
          <t-textarea
            v-model="urlList"
            placeholder="请输入图片URL，每行一个链接（最多20个）&#10;例如：&#10;https://example.com/image1.jpg&#10;https://example.com/image2.png"
            :rows="4"
            class="url-input"
          />
          
          <div class="transfer-actions">
            <span class="transfer-desc">支持批量转存，自动绕过防盗链</span>
            <div class="action-buttons">
              <t-button 
                variant="outline"
                :loading="validating"
                :disabled="!urlList.trim()"
                @click="validateUrls"
              >
                {{ validating ? '验证中...' : '验证URL' }}
              </t-button>
              <t-button 
                theme="primary"
                :loading="isTransferring"
                :disabled="!urlList.trim()"
                @click="handleTransfer"
              >
                {{ isTransferring ? '转存中...' : '开始转存' }}
              </t-button>
              <t-button 
                variant="outline"
                @click="clearTransferData"
                :disabled="!urlList.trim() && validationResults.length === 0 && transferProgress.length === 0"
              >
                清空
              </t-button>
            </div>
          </div>

          <!-- URL验证结果 -->
          <div v-if="validationResults.length > 0" class="validation-results">
            <h4 class="results-title">URL验证结果</h4>
            <div class="results-list">
              <div 
                v-for="(result, index) in validationResults" 
                :key="index"
                class="result-item"
                :class="{ 'valid': result.valid, 'invalid': !result.valid }"
              >
                <div class="result-status">
                  <CheckCircleIcon v-if="result.valid" class="status-icon success" />
                  <XCircleIcon v-else class="status-icon error" />
                </div>
                <div class="result-details">
                  <p class="result-url">{{ result.url }}</p>
                  <div class="result-meta">
                    <span v-if="result.contentType" class="meta-item">{{ result.contentType }}</span>
                    <span v-if="result.contentLength" class="meta-item">{{ formatFileSize(result.contentLength) }}</span>
                    <span v-if="result.error" class="meta-item error">{{ result.error }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 转存进度 -->
          <div v-if="transferProgress.length > 0" class="transfer-progress">
            <h4 class="progress-title">转存进度</h4>
            <div class="progress-list">
              <div 
                v-for="(progress, index) in transferProgress" 
                :key="index"
                class="progress-item"
              >
                <div class="progress-status">
                  <div v-if="progress.status === 'processing'" class="loading-spinner"></div>
                  <CheckCircleIcon v-else-if="progress.status === 'success'" class="status-icon success" />
                  <XCircleIcon v-else-if="progress.status === 'error'" class="status-icon error" />
                </div>
                <div class="progress-details">
                  <p class="progress-url">{{ progress.originalUrl }}</p>
                  <p class="progress-message" :class="progress.status">{{ progress.message }}</p>
                  <!-- 转存成功时显示新链接 -->
                  <p v-if="progress.status === 'success' && progress.newUrl" class="progress-new-url">
                    {{ progress.newUrl }}
                  </p>
                </div>
                <!-- 转存成功时显示复制按钮 -->
                <div v-if="progress.status === 'success' && progress.newUrl" class="progress-actions">
                  <t-button size="small" variant="outline" @click="copyToClipboard(progress.newUrl)">
                    复制链接
                  </t-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 上传队列抽屉 -->
    <t-drawer
      v-model:visible="uploadDrawerVisible"
      title="上传管理"
      placement="right"
      :size="drawerSize"
      :show-overlay="true"
      :close-on-overlay-click="true"
      :footer="true"
    >
      <!-- 存储选择 -->
      <div class="drawer-section">
        <h4 class="section-title">存储配置</h4>
        <div class="storage-selector">
          <t-select 
            v-model="selectedStorageId" 
            :options="storageOptions"
            placeholder="选择存储方式"
            class="storage-select"
          />
          <span v-if="storageOptions.length === 1" class="storage-hint">
            当前只有一个存储配置
          </span>
        </div>
      </div>

      <!-- 上传队列 -->
      <div v-if="uploadFiles.length > 0" class="drawer-section">
        <div class="section-header">
          <h4 class="section-title">上传队列 ({{ uploadFiles.length }})</h4>
          <div class="section-actions">
            <t-button 
              theme="primary" 
              size="small"
              :loading="isUploading"
              :disabled="uploadFiles.filter(f => f.status === 'pending').length === 0 || !selectedStorageId"
              @click="upload(selectedStorageId)"
            >
              {{ isUploading ? '上传中...' : '开始上传' }}
            </t-button>
            <t-button variant="outline" size="small" @click="clearFiles">
              清空列表
            </t-button>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="drawer-file-list">
          <div 
            v-for="file in uploadFiles" 
            :key="file.id"
            class="drawer-file-item"
          >
            <div class="file-info">
              <div class="file-icon">
                <ImageIcon />
              </div>
              <div class="file-details">
                <p class="file-name">{{ file.file.name }}</p>
                <p class="file-size">{{ formatFileSize(file.file.size) }}</p>
              </div>
            </div>

            <!-- 状态和进度 -->
            <div class="file-status">
              <div class="progress-area">
                <div v-if="file.status === 'uploading'" class="progress-bar">
                  <t-progress 
                    :percentage="file.progress" 
                    size="small"
                    :show-info="false"
                  />
                </div>
                <div v-else-if="file.status === 'success'" class="status-success">
                  <CheckCircleIcon class="status-icon" />
                  <span>上传成功</span>
                </div>
                <div v-else-if="file.status === 'error'" class="status-error">
                  <XCircleIcon class="status-icon" />
                  <span>{{ file.error || '上传失败' }}</span>
                </div>
                <div v-else class="status-pending">
                  <ClockIcon class="status-icon" />
                  <span>等待上传</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="file-actions">
                <t-button 
                  v-if="file.status === 'success' && file.url"
                  size="small"
                  variant="outline"
                  @click="copyToClipboard(file.url!)"
                >
                  复制链接
                </t-button>
                <t-button 
                  v-if="file.status === 'error'"
                  size="small"
                  theme="primary"
                  @click="retryUpload(file.id)"
                >
                  重试
                </t-button>
                <t-button 
                  size="small"
                  variant="outline"
                  @click="removeFile(file.id)"
                >
                  移除
                </t-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 上传统计 -->
        <div v-if="uploadFiles.length > 0" class="upload-stats">
          <div class="stats-item">
            <span class="stats-label">总计:</span>
            <span class="stats-value">{{ uploadStats.total }} 个文件</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">成功:</span>
            <span class="stats-value success">{{ uploadStats.success }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">失败:</span>
            <span class="stats-value error">{{ uploadStats.error }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">等待:</span>
            <span class="stats-value pending">{{ uploadStats.pending }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="drawer-empty">
        <div class="empty-content">
          <ImageIcon class="empty-icon" />
          <p class="empty-text">暂无上传文件</p>
          <p class="empty-desc">选择文件或拖拽到上传区域开始上传</p>
        </div>
      </div>
      
      <!-- 抽屉底部按钮 -->
      <template #footer>
        <div class="drawer-footer">
          <t-button theme="primary" size="large" block @click="handleDrawerComplete">
            完成
          </t-button>
        </div>
      </template>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  UploadIcon,
  FolderOpenIcon,
  ImageIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CopyIcon,
  RefreshCwIcon,
  XIcon,
  CheckIcon,
  DownloadIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUpload } from '@/composables/useUpload'
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

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const urlList = ref('')
const isTransferring = ref(false)
const validating = ref(false)
const transferResults = ref<any[]>([])
const validationResults = ref<any[]>([])
const transferProgress = ref<any[]>([])

// 存储选择相关
const selectedStorageId = ref('')
const storageOptions = ref<Array<{label: string, value: string}>>([])

// 抽屉相关
const uploadDrawerVisible = ref(false)
const drawerSize = computed(() => {
  // 响应式抽屉宽度
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768 ? '100%' : '480px'
  }
  return '480px'
})

// 显示上传抽屉
const showUploadDrawer = () => {
  uploadDrawerVisible.value = true
}

// 处理抽屉完成
const handleDrawerComplete = () => {
  uploadDrawerVisible.value = false
  clearFiles()
  MessagePlugin.success('上传队列已清空')
}

// 加载存储选项
const loadStorageOptions = async () => {
  try {
    const response = await apiService.getAllStorages()
    if (response.success && response.data) {
      storageOptions.value = response.data.map(storage => ({
        label: storage.name,
        value: storage.id.toString()
      }))
      
      // 从localStorage获取用户上次选择的存储，如果没有则选择第一个
      const lastSelectedStorage = localStorage.getItem('selectedStorageId')
      if (lastSelectedStorage && storageOptions.value.find(opt => opt.value === lastSelectedStorage)) {
        selectedStorageId.value = lastSelectedStorage
      } else if (storageOptions.value.length > 0) {
        selectedStorageId.value = storageOptions.value[0].value
      }
    }
  } catch (error) {

  }
}

// 计算属性
const uploadStats = computed(() => getUploadStats())

// 监听存储选择变化，自动保存到localStorage
watch(selectedStorageId, (newValue) => {
  if (newValue) {
    localStorage.setItem('selectedStorageId', newValue)
  }
})

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

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length > 0) {
    addFiles(imageFiles)
    MessagePlugin.success(`已添加 ${imageFiles.length} 个文件到上传队列`)
    // 拖拽文件后自动打开抽屉
    uploadDrawerVisible.value = true
  } else {
    MessagePlugin.error('请拖拽图片文件')
  }
}

// 文件选择处理
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length > 0) {
    addFiles(files)
    MessagePlugin.success(`已添加 ${files.length} 个文件到上传队列`)
    // 选择文件后自动打开抽屉
    uploadDrawerVisible.value = true
  }
  
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

// 清空转存相关数据
const clearTransferData = () => {
  urlList.value = ''
  validationResults.value = []
  transferProgress.value = []
  transferResults.value = []
}

// URL验证处理
const validateUrls = async () => {
  const urls = urlList.value.split('\n').filter(url => url.trim())
  
  if (urls.length === 0) {
    MessagePlugin.error('请输入有效的图片URL')
    return
  }

  if (urls.length > 20) {
    MessagePlugin.error('最多支持20个URL同时验证')
    return
  }

  validating.value = true
  validationResults.value = []

  try {
    const response = await apiService.validateUrls(urls)
    if (response.success && response.data) {
      validationResults.value = response.data
      const validCount = response.data.filter(r => r.valid).length
      MessagePlugin.success(`验证完成，有效 ${validCount}/${urls.length} 个URL`)
    } else {
      MessagePlugin.error('验证失败: ' + response.message)
    }
  } catch (error: any) {

    MessagePlugin.error('验证失败: ' + error.message)
  } finally {
    validating.value = false
  }
}

// URL转存处理
const handleTransfer = async () => {
  const urls = urlList.value.split('\n').filter(url => url.trim())
  
  if (urls.length === 0) {
    MessagePlugin.error('请输入有效的图片URL')
    return
  }

  if (urls.length > 20) {
    MessagePlugin.error('最多支持20个URL同时转存')
    return
  }

  isTransferring.value = true
  transferResults.value = []
  transferProgress.value = urls.map(url => ({
    originalUrl: url,
    status: 'processing',
    message: '准备转存...'
  }))

  try {
    const response = await apiService.transferImages(urls)
    if (response.success && response.data) {
      transferResults.value = response.data
      transferProgress.value = response.data.map(result => ({
        originalUrl: result.originalUrl,
        newUrl: result.newUrl,
        status: result.success ? 'success' : 'error',
        message: result.message
      }))
      const successCount = response.data.filter(r => r.success).length
      MessagePlugin.success(`转存完成，成功 ${successCount}/${urls.length} 个`)
    } else {
      MessagePlugin.error('转存失败: ' + response.message)
      transferProgress.value = urls.map(url => ({
        originalUrl: url,
        status: 'error',
        message: response.message
      }))
    }
  } catch (error: any) {

    MessagePlugin.error('转存失败: ' + error.message)
    transferProgress.value = urls.map(url => ({
      originalUrl: url,
      status: 'error',
      message: error.message
    }))
  } finally {
    isTransferring.value = false
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    MessagePlugin.success('链接已复制到剪贴板')
  } catch (error) {
    MessagePlugin.error('复制失败')
  }
}

// 生命周期
onMounted(() => {
  loadStorageOptions()
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
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

.storage-selector-card {
  margin-bottom: 16px;
}

.storage-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.storage-label {
  font-weight: 500;
  color: var(--td-text-color-primary);
  white-space: nowrap;
}

.storage-select {
  min-width: 200px;
}

.storage-hint {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-left: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.upload-card,
.upload-list-card,
.transfer-card {
  margin-bottom: 24px;
}

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

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: var(--td-text-color-placeholder);
}

.upload-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.upload-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.hidden {
  display: none;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.list-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.list-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  background-color: var(--td-bg-color-container);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  width: 40px;
  height: 40px;
  background-color: var(--td-bg-color-component);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin: 0;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-area {
  width: 200px;
}

.progress-bar {
  width: 100%;
}

.status-success,
.status-error,
.status-pending {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-success {
  color: var(--td-success-color);
}

.status-error {
  color: var(--td-error-color);
}

.status-pending {
  color: var(--td-text-color-placeholder);
}

.status-icon {
  width: 14px;
  height: 14px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.upload-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0 0;
  border-top: 1px solid var(--td-border-level-1-color);
  margin-top: 16px;
  font-size: 14px;
}

.stats-item {
  display: flex;
  gap: 4px;
}

.stats-label {
  color: var(--td-text-color-secondary);
}

.stats-value {
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.stats-value.success {
  color: var(--td-success-color);
}

.stats-value.error {
  color: var(--td-error-color);
}

.stats-value.pending {
  color: var(--td-warning-color);
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.transfer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.url-input {
  width: 100%;
}

.transfer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transfer-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.validation-results,
.transfer-progress,
.transfer-results {
  border-top: 1px solid var(--td-border-level-1-color);
  padding-top: 16px;
}

.results-title,
.progress-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 12px 0;
}

.results-list,
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item,
.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--td-border-level-1-color);
}

.progress-item:has(.progress-actions) {
  align-items: flex-start;
}

.result-item.valid {
  background-color: var(--td-success-color-light);
  border-color: var(--td-success-color);
}

.result-item.invalid {
  background-color: var(--td-error-color-light);
  border-color: var(--td-error-color);
}

.result-status,
.progress-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.result-details,
.progress-details {
  flex: 1;
  min-width: 0;
}

.result-url,
.progress-url {
  font-size: 14px;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.meta-item {
  color: var(--td-text-color-secondary);
}

.meta-item.error {
  color: var(--td-error-color);
}

.result-message,
.progress-message {
  font-size: 12px;
  margin: 0;
}

.result-message.success,
.progress-message.success {
  color: var(--td-success-color);
}

.result-message.error,
.progress-message.error {
  color: var(--td-error-color);
}

.progress-message.processing {
  color: var(--td-brand-color);
}

.progress-new-url {
  font-size: 12px;
  color: var(--td-success-color);
  margin: 4px 0 0 0;
  font-weight: 500;
  word-break: break-all;
}

.progress-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--td-brand-color-light);
  border-top: 2px solid var(--td-brand-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 抽屉样式 */
.drawer-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 12px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.storage-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.storage-select {
  width: 100%;
}

.storage-hint {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.drawer-file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.drawer-file-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  background-color: var(--td-bg-color-container);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 32px;
  height: 32px;
  background-color: var(--td-bg-color-component);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin: 0;
}

.file-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.progress-area {
  flex: 1;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.upload-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background-color: var(--td-bg-color-secondarycontainer);
  border-radius: 8px;
  margin-top: 16px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.stats-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.stats-value.success {
  color: var(--td-success-color);
}

.stats-value.error {
  color: var(--td-error-color);
}

.stats-value.pending {
  color: var(--td-warning-color);
}

.drawer-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--td-text-color-placeholder);
  margin: 0 auto 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--td-text-color-secondary);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--td-text-color-placeholder);
  margin: 0;
}

/* 抽屉底部按钮样式 */
.drawer-footer {
  padding: 16px;
  border-top: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-container);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-area {
    padding: 32px 16px;
  }
  
  .upload-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .transfer-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .drawer-file-item {
    padding: 12px;
  }
  
  .file-status {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .file-actions {
    justify-content: center;
  }
  
  .upload-stats {
    grid-template-columns: 1fr;
  }
}
</style>