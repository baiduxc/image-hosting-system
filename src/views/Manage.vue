<template>
  <div class="manage-page">
    <!-- 页面标题和操作栏 -->


    <!-- 图片网格 - 手机相册风格 -->
    <div class="image-gallery" v-if="!isLoading && imageList.length > 0">
      <div 
        v-for="(image, index) in imageList" 
        :key="image.id"
        class="gallery-item"
        @click="openImageViewer(index)"
        @contextmenu.prevent="showContextMenu($event, image, index)"
      >
        <!-- 图片 -->
        <img 
          v-if="image.url" 
          :src="getImageUrl(image.url)" 
          :alt="image.originalName"
          class="gallery-image"
          @error="handleImageError"
          @load="handleImageLoad"
        />
        <div v-else class="image-placeholder">
          <ImageIcon class="placeholder-icon" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!isLoading && imageList.length === 0" class="empty-state">
      <ImageIcon class="empty-icon" />
      <h3 class="empty-title">暂无图片</h3>
      <p class="empty-desc">还没有上传任何图片，去上传一些图片吧！</p>
      <t-button theme="primary" @click="$router.push('/upload')">
        <template #icon><UploadIcon /></template>
        上传图片
      </t-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <t-loading size="large" :text="'加载中...'" />
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="!isLoading && imageList.length > 0">
      <t-pagination
        v-model:current="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-size-options="[16, 32, 64, 128]"
        show-jumper
        show-sizer
        @change="handlePageChange"
      />
    </div>

    <!-- TDesign ImageViewer 图片预览器 -->
    <t-image-viewer
      v-model:visible="imageViewerVisible"
      :images="imageUrls"
      :index="currentImageIndex"
      @index-change="handleImageIndexChange"
    />

    <!-- 右键菜单 -->
    <div 
      v-if="contextMenuVisible" 
      class="context-menu"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="copyImageLink">
        <CopyIcon class="menu-icon" />
        <span>复制图片链接</span>
      </div>
      <div class="menu-item" @click="openInNewWindow">
        <ExternalLinkIcon class="menu-icon" />
        <span>新窗口打开</span>
      </div>
      <div class="menu-item" @click="showImageDetails">
        <InfoIcon class="menu-icon" />
        <span>查看详情</span>
      </div>
      <div class="menu-item" @click="downloadCurrentImage">
        <DownloadIcon class="menu-icon" />
        <span>下载图片</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item danger" @click="deleteCurrentImage">
        <TrashIcon class="menu-icon" />
        <span>删除图片</span>
      </div>
    </div>

    <!-- 右键菜单背景遮罩 -->
    <div 
      v-if="contextMenuVisible" 
      class="context-menu-overlay"
      @click="closeContextMenu"
    ></div>

    <!-- 图片详情弹窗 -->
    <t-dialog
      v-model:visible="detailsVisible"
      :header="currentContextImage?.originalName || '图片详情'"
      width="600px"
      :footer="null"
    >
      <div class="image-details" v-if="currentContextImage">
        <div class="details-preview">
          <img 
            :src="getImageUrl(currentContextImage.url)" 
            :alt="currentContextImage.originalName"
            class="details-image"
          />
        </div>
        <div class="details-info">
          <div class="info-row">
            <span class="info-label">文件名:</span>
            <span class="info-value">{{ currentContextImage.originalName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">文件大小:</span>
            <span class="info-value">{{ formatFileSize(currentContextImage.size || 0) }}</span>
          </div>
          <div class="info-row" v-if="currentContextImage.width && currentContextImage.height">
            <span class="info-label">图片尺寸:</span>
            <span class="info-value">{{ currentContextImage.width }}×{{ currentContextImage.height }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">上传时间:</span>
            <span class="info-value">{{ formatDate(currentContextImage.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">上传类型:</span>
            <span class="info-value">
              <t-tag :theme="currentContextImage.uploadType === 'local' ? 'primary' : 'success'" size="small">
                {{ currentContextImage.uploadType === 'local' ? '本地上传' : '网络转存' }}
              </t-tag>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">图片链接:</span>
            <div class="link-row">
              <t-input 
                :value="currentContextImage.url" 
                readonly 
                class="link-input"
              />
              <t-button @click="copyToClipboard(currentContextImage.url)">
                <template #icon><CopyIcon /></template>
                复制
              </t-button>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="deleteDialogVisible"
      header="确认删除"
      :confirm-btn="{ content: '确认删除', theme: 'danger' }"
      :cancel-btn="{ content: '取消' }"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    >
      <div class="delete-dialog-content">
        <div class="delete-warning">
          <TrashIcon class="warning-icon" />
          <div class="warning-text">
            <h4>确定要删除这张图片吗？</h4>
            <p>删除后将无法恢复，请谨慎操作。</p>
          </div>
        </div>
        <div v-if="imageToDelete" class="delete-image-info">
          <img 
            v-if="imageToDelete.url" 
            :src="getImageUrl(imageToDelete.url)" 
            :alt="imageToDelete.originalName"
            class="delete-preview-image"
            @error="handleImageError"
          />
          <div class="delete-info">
            <p class="delete-filename">{{ imageToDelete.originalName || '未知文件名' }}</p>
            <p class="delete-meta">{{ formatFileSize(imageToDelete.size || 0) }} • {{ formatDate(imageToDelete.createdAt) }}</p>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SearchIcon,
  ImageIcon,
  CopyIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  ExternalLinkIcon,
  InfoIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const router = useRouter()

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const imageList = ref<any[]>([])
const totalSize = ref(0)

// 图片预览器相关
const imageViewerVisible = ref(false)
const currentImageIndex = ref(0)

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentContextImage = ref<any>(null)
const currentContextIndex = ref(0)

// 详情弹窗
const detailsVisible = ref(false)

// 删除确认
const deleteDialogVisible = ref(false)
const imageToDelete = ref<any>(null)

// 分页数据 - 每页32张图片
const pagination = ref({
  page: 1,
  limit: 32,
  total: 0,
  totalPages: 0
})

// 计算属性
const imageUrls = computed(() => {
  return imageList.value.map(image => getImageUrl(image.url)).filter(url => url)
})

// 处理搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadImages()
}

// 处理分页
const handlePageChange = (pageInfo: any) => {
  pagination.value.page = pageInfo.current
  pagination.value.limit = pageInfo.pageSize
  loadImages()
}

// 打开图片预览器
const openImageViewer = (index: number) => {
  currentImageIndex.value = index
  imageViewerVisible.value = true
}

// 处理图片预览器索引变化
const handleImageIndexChange = (index: number) => {
  currentImageIndex.value = index
}

// 显示右键菜单
const showContextMenu = (event: MouseEvent, image: any, index: number) => {
  currentContextImage.value = image
  currentContextIndex.value = index
  
  // 设置菜单位置
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 右键菜单操作
const copyImageLink = () => {
  if (currentContextImage.value?.url) {
    copyToClipboard(currentContextImage.value.url)
  }
  closeContextMenu()
}

const openInNewWindow = () => {
  if (currentContextImage.value?.url) {
    window.open(getImageUrl(currentContextImage.value.url), '_blank')
  }
  closeContextMenu()
}

const showImageDetails = () => {
  detailsVisible.value = true
  closeContextMenu()
}

const downloadCurrentImage = () => {
  if (currentContextImage.value) {
    downloadImage(currentContextImage.value)
  }
  closeContextMenu()
}

const deleteCurrentImage = () => {
  if (currentContextImage.value) {
    confirmDelete(currentContextImage.value.id)
  }
  closeContextMenu()
}

// 加载图片列表
const loadImages = async () => {
  isLoading.value = true
  try {
    const response = await apiService.getImages({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value
    })
    
    if (response.success && response.data) {
      imageList.value = response.data.images || []
      pagination.value = {
        ...pagination.value,
        ...response.data.pagination
      }
      
      // 计算总大小
      totalSize.value = imageList.value.reduce((sum, img) => sum + (img.size || 0), 0)
    }
  } catch (error) {
    MessagePlugin.error('加载图片列表失败')
  } finally {
    isLoading.value = false
  }
}

// 确认删除图片
const confirmDelete = (id: number) => {
  const image = imageList.value.find(img => img.id === id)
  if (image) {
    imageToDelete.value = image
    deleteDialogVisible.value = true
  }
}

// 处理确认删除
const handleConfirmDelete = async () => {
  if (!imageToDelete.value) return
  
  try {
    const response = await apiService.deleteImage(imageToDelete.value.id)
    if (response.success) {
      imageList.value = imageList.value.filter(img => img.id !== imageToDelete.value.id)
      pagination.value.total -= 1
      MessagePlugin.success('图片删除成功')
    } else {
      MessagePlugin.error('删除失败: ' + response.message)
    }
  } catch (error: any) {
    MessagePlugin.error('删除失败: ' + error.message)
  } finally {
    deleteDialogVisible.value = false
    imageToDelete.value = null
  }
}

// 处理取消删除
const handleCancelDelete = () => {
  deleteDialogVisible.value = false
  imageToDelete.value = null
}

// 下载图片
const downloadImage = (image: any) => {
  if (!image.url) return
  
  const link = document.createElement('a')
  link.href = getImageUrl(image.url)
  link.download = image.originalName || image.filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取图片URL - 统一处理图片显示
const getImageUrl = (url: string): string => {
  if (!url) return ''
  
  // 如果是完整的URL（包含协议），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 如果是相对路径，需要添加API基础URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
  const baseUrl = apiBaseUrl.replace('/api', '')
  
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`
}

// 图片加载成功处理
const handleImageLoad = (e: Event) => {
  // 图片加载成功
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  
  // 隐藏图片并显示占位符
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent && !parent.querySelector('.error-placeholder')) {
    const placeholder = document.createElement('div')
    placeholder.className = 'error-placeholder'
    placeholder.innerHTML = '<div class="placeholder-icon">🖼️</div><div class="placeholder-text">图片加载失败</div>'
    placeholder.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--td-bg-color-component);
      color: var(--td-text-color-placeholder);
      font-size: 12px;
      border-radius: 4px;
    `
    parent.appendChild(placeholder)
  }
}

// 监听搜索查询变化
watch(searchQuery, () => {
  // 防抖处理
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    handleSearch()
  }, 500) as any
})

// 组件挂载时执行
onMounted(() => {
  loadImages()
})
</script>

<style>
/* 全局样式覆盖 - 仅对图片管理页面生效 */
.layout-main .main-content:has(.manage-page) {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 如果不支持:has选择器，使用更直接的方法 */
.main-content {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>

<style scoped>
.manage-page {
  padding: 0;
  margin: 0;
  
  background-color: var(--td-bg-color-page);
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  gap: 24px;
}

.header-left {
  flex: 1;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 280px;
}

.search-icon {
  width: 16px;
  height: 16px;
}

.stats-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 32px;
  padding: 16px 24px;
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.stats-label {
  color: var(--td-text-color-secondary);
}

.stats-value {
  font-weight: 500;
  color: var(--td-text-color-primary);
}

/* 图片画廊 - 手机相册风格，真正全屏 */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  padding: 0;
  margin: 0;
  width: 100%;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  background-color: var(--td-bg-color-component);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid var(--td-border-level-1-color);
  transition: all 0.2s ease;
}

.gallery-item:hover {
  z-index: 1;
  transform: scale(1.02);
  box-shadow: var(--td-shadow-2);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
  background-color: var(--td-bg-color-component);
}

.placeholder-icon {
  width: 32px;
  height: 32px;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background-color: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  box-shadow: var(--td-shadow-3);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1000;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--td-text-color-primary);
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: var(--td-bg-color-container-hover);
}

.menu-item.danger {
  color: var(--td-error-color);
}

.menu-item.danger:hover {
  background-color: var(--td-error-color-light);
}

.menu-icon {
  width: 16px;
  height: 16px;
}

.menu-divider {
  height: 1px;
  background-color: var(--td-border-level-1-color);
  margin: 4px 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0 0 24px 0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 24px;
  background-color: var(--td-bg-color-container);
  border-top: 1px solid var(--td-border-level-1-color);
}

/* 图片详情弹窗 */
.image-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--td-bg-color-component);
}

.details-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.details-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: var(--td-text-color-secondary);
  min-width: 80px;
}

.info-value {
  color: var(--td-text-color-primary);
  flex: 1;
}

.link-row {
  display: flex;
  gap: 8px;
  flex: 1;
}

.link-input {
  flex: 1;
}

/* 删除确认对话框 */
.delete-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: var(--td-error-color-1);
  border-radius: 8px;
  border-left: 4px solid var(--td-error-color);
}

.warning-icon {
  width: 24px;
  height: 24px;
  color: var(--td-error-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.warning-text p {
  margin: 0;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.delete-image-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  border: 1px solid var(--td-border-level-1-color);
}

.delete-preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.delete-info {
  flex: 1;
  min-width: 0;
}

.delete-filename {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-meta {
  margin: 0;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .image-gallery {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1200px) {
  .image-gallery {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .image-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .image-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>