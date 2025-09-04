<template>
  <div class="manage-page">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">图片管理</h1>
        <p class="page-description">管理已上传的图片文件</p>
      </div>
      <div class="header-right">
        <t-input
          v-model="searchQuery"
          placeholder="搜索图片..."
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix-icon>
            <SearchIcon class="search-icon" />
          </template>
        </t-input>
        <t-dropdown :options="filterOptions" @click="handleFilterClick">
          <t-button variant="outline">
            <template #icon><FilterIcon /></template>
            筛选
          </t-button>
        </t-dropdown>
        <t-dropdown :options="viewOptions" @click="handleViewChange">
          <t-button variant="outline">
            <template #icon><component :is="currentViewIcon" /></template>
            {{ currentViewText }}
          </t-button>
        </t-dropdown>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stats-item">
        <span class="stats-label">总计:</span>
        <span class="stats-value">{{ pagination.total }} 张图片</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">已选择:</span>
        <span class="stats-value">{{ selectedImages.length }} 张</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">存储大小:</span>
        <span class="stats-value">{{ formatFileSize(totalSize) }}</span>
      </div>
      <div class="stats-actions" v-if="selectedImages.length > 0">
        <t-button size="small" theme="primary" @click="batchCopyLinks">
          <template #icon><CopyIcon /></template>
          批量复制链接
        </t-button>
        <t-button size="small" theme="danger" @click="batchDelete">
          <template #icon><TrashIcon /></template>
          批量删除
        </t-button>
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="image-container">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <div 
          v-for="image in imageList" 
          :key="image.id"
          class="image-card"
          :class="{ 'selected': selectedImages.includes(image.id) }"
          @click="toggleSelection(image.id)"
        >
          <!-- 选择框 -->
          <div class="selection-overlay">
            <t-checkbox 
              :checked="selectedImages.includes(image.id)"
              @click.stop="toggleSelection(image.id)"
            />
          </div>

          <!-- 图片预览 -->
          <div class="image-preview">
            <img 
              v-if="image.url" 
              :src="image.url" 
              :alt="image.originalName"
              class="preview-image"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
              @error="handleImageError"
              @click.stop="showPreview(image)"
              @load="handleImageLoad"
            />
            <div v-else class="preview-placeholder">
              <ImageIcon class="placeholder-icon" />
            </div>
          </div>

          <!-- 图片信息 -->
          <div class="image-info">
            <p class="image-name" :title="image.originalName">
              {{ image.originalName || '未知文件名' }}
            </p>
            <div class="image-meta">
              <span class="meta-item">{{ formatFileSize(image.size || 0) }}</span>
              <span class="meta-item" v-if="image.width && image.height">
                {{ image.width }}×{{ image.height }}
              </span>
              <span class="meta-item">{{ formatDate(image.createdAt) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="image-actions">
            <t-button size="small" variant="outline" @click.stop="copyToClipboard(image.url)" :disabled="!image.url">
              <template #icon><CopyIcon /></template>
            </t-button>
            <t-button size="small" variant="outline" @click.stop="showPreview(image)">
              <template #icon><EyeIcon /></template>
            </t-button>
            <t-button size="small" variant="outline" @click.stop="downloadImage(image)">
              <template #icon><DownloadIcon /></template>
            </t-button>
            <t-button size="small" theme="danger" @click.stop="deleteImage(image.id)" :disabled="!image.id">
              <template #icon><TrashIcon /></template>
            </t-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <t-table
          :data="imageList"
          :columns="tableColumns"
          :loading="isLoading"
          :pagination="tablePagination"
          row-key="id"
          :selected-row-keys="selectedImages"
          @select-change="handleTableSelection"
          @page-change="handlePageChange"
        >
          <template #preview="{ row }">
            <div class="table-preview">
              <img 
                v-if="row.url" 
                :src="row.url" 
                :alt="row.originalName"
                class="table-image"
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
                @error="handleImageError"
                @click="showPreview(row)"
                @load="handleImageLoad"
              />
              <div v-else class="table-placeholder">
                <ImageIcon class="placeholder-icon" />
              </div>
            </div>
          </template>

          <template #name="{ row }">
            <div class="table-name">
              <p class="name-text" :title="row.originalName">{{ row.originalName || '未知文件名' }}</p>
              <p class="name-meta">{{ row.filename }}</p>
            </div>
          </template>

          <template #size="{ row }">
            <span>{{ formatFileSize(row.size || 0) }}</span>
          </template>

          <template #dimensions="{ row }">
            <span v-if="row.width && row.height">{{ row.width }}×{{ row.height }}</span>
            <span v-else>-</span>
          </template>

          <template #uploadType="{ row }">
            <t-tag :theme="row.uploadType === 'local' ? 'primary' : 'success'" size="small">
              {{ row.uploadType === 'local' ? '本地上传' : '网络转存' }}
            </t-tag>
          </template>

          <template #createdAt="{ row }">
            <span>{{ formatDate(row.createdAt) }}</span>
          </template>

          <template #actions="{ row }">
            <div class="table-actions">
              <t-button size="small" variant="text" @click="copyToClipboard(row.url)" :disabled="!row.url">
                <template #icon><CopyIcon /></template>
                复制
              </t-button>
              <t-button size="small" variant="text" @click="showPreview(row)">
                <template #icon><EyeIcon /></template>
                预览
              </t-button>
              <t-button size="small" variant="text" @click="downloadImage(row)">
                <template #icon><DownloadIcon /></template>
                下载
              </t-button>
              <t-button size="small" variant="text" theme="danger" @click="deleteImage(row.id)" :disabled="!row.id">
                <template #icon><TrashIcon /></template>
                删除
              </t-button>
            </div>
          </template>
        </t-table>
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
    </div>

    <!-- 图片预览弹窗 -->
    <t-dialog
      v-model:visible="previewVisible"
      :header="previewImage?.originalName || '图片预览'"
      width="80%"
      :footer="false"
      @close="closePreview"
    >
      <div class="preview-dialog" v-if="previewImage">
        <div class="preview-content">
          <img 
            :src="previewImage.url" 
            :alt="previewImage.originalName"
            class="preview-full-image"
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
            @error="handleImageError"
            @load="handleImageLoad"
          />
        </div>
        <div class="preview-info">
          <div class="info-row">
            <span class="info-label">文件名:</span>
            <span class="info-value">{{ previewImage.originalName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">文件大小:</span>
            <span class="info-value">{{ formatFileSize(previewImage.size || 0) }}</span>
          </div>
          <div class="info-row" v-if="previewImage.width && previewImage.height">
            <span class="info-label">图片尺寸:</span>
            <span class="info-value">{{ previewImage.width }}×{{ previewImage.height }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">上传时间:</span>
            <span class="info-value">{{ formatDate(previewImage.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">图片链接:</span>
            <div class="link-row">
              <t-input 
                :value="previewImage.url" 
                readonly 
                class="link-input"
              />
              <t-button @click="copyToClipboard(previewImage.url)">
                <template #icon><CopyIcon /></template>
                复制
              </t-button>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SearchIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  ImageIcon,
  CopyIcon,
  TrashIcon,
  EyeIcon,
  DownloadIcon,
  UploadIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const router = useRouter()

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const selectedImages = ref<number[]>([])
const imageList = ref<any[]>([])
const previewVisible = ref(false)
const previewImage = ref<any>(null)
const totalSize = ref(0)

// 分页数据
const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  totalPages: 0
})

// 筛选选项
const filterOptions = [
  { content: '全部图片', value: 'all' },
  { content: '本地上传', value: 'local' },
  { content: '网络转存', value: 'transfer' },
  { content: '今天上传', value: 'today' },
  { content: '本周上传', value: 'week' },
  { content: '本月上传', value: 'month' }
]

// 视图选项
const viewOptions = [
  { content: '网格视图', value: 'grid', icon: GridIcon },
  { content: '列表视图', value: 'list', icon: ListIcon }
]

// 表格列配置
const tableColumns = [
  {
    colKey: 'preview',
    title: '预览',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'name',
    title: '文件名',
    minWidth: 200
  },
  {
    colKey: 'size',
    title: '大小',
    width: 100,
    align: 'right'
  },
  {
    colKey: 'dimensions',
    title: '尺寸',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'uploadType',
    title: '类型',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'createdAt',
    title: '上传时间',
    width: 160,
    align: 'center'
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 200,
    align: 'center'
  }
]

// 计算属性
const currentViewIcon = computed(() => {
  return viewMode.value === 'grid' ? GridIcon : ListIcon
})

const currentViewText = computed(() => {
  return viewMode.value === 'grid' ? '网格视图' : '列表视图'
})

const tablePagination = computed(() => ({
  current: pagination.value.page,
  pageSize: pagination.value.limit,
  total: pagination.value.total,
  showJumper: true,
  showSizer: true,
  pageSizeOptions: [12, 24, 48, 96]
}))

// 切换选择
const toggleSelection = (imageId: number) => {
  const index = selectedImages.value.indexOf(imageId)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(imageId)
  }
}

// 处理表格选择
const handleTableSelection = (selectedRowKeys: number[]) => {
  selectedImages.value = selectedRowKeys
}

// 处理搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadImages()
}

// 处理筛选
const handleFilterClick = (data: any) => {
  // TODO: 实现筛选逻辑
  MessagePlugin.info(`筛选: ${data.content}`)
}

// 处理视图切换
const handleViewChange = (data: any) => {
  viewMode.value = data.value
  localStorage.setItem('imageViewMode', data.value)
}

// 处理分页
const handlePageChange = (pageInfo: any) => {
  pagination.value.page = pageInfo.current
  pagination.value.limit = pageInfo.pageSize
  loadImages()
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
    console.error('加载图片列表失败:', error)
    MessagePlugin.error('加载图片列表失败')
  } finally {
    isLoading.value = false
  }
}

// 删除图片
const deleteImage = async (id: number) => {
  try {
    const response = await apiService.deleteImage(id)
    if (response.success) {
      imageList.value = imageList.value.filter(img => img.id !== id)
      selectedImages.value = selectedImages.value.filter(imgId => imgId !== id)
      pagination.value.total -= 1
      MessagePlugin.success('图片删除成功')
    } else {
      MessagePlugin.error('删除失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('删除图片失败:', error)
    MessagePlugin.error('删除失败: ' + error.message)
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedImages.value.length === 0) {
    MessagePlugin.warning('请先选择要删除的图片')
    return
  }

  // TODO: 实现批量删除API
  for (const id of selectedImages.value) {
    await deleteImage(id)
  }
  
  selectedImages.value = []
}

// 批量复制链接
const batchCopyLinks = () => {
  if (selectedImages.value.length === 0) {
    MessagePlugin.warning('请先选择要复制的图片')
    return
  }

  const links = selectedImages.value
    .map(id => imageList.value.find(img => img.id === id)?.url)
    .filter(url => url)
    .join('\n')

  copyToClipboard(links)
}

// 预览图片
const showPreview = (image: any) => {
  previewImage.value = image
  previewVisible.value = true
}

// 关闭预览
const closePreview = () => {
  previewVisible.value = false
  previewImage.value = null
}

// 下载图片
const downloadImage = (image: any) => {
  if (!image.url) return
  
  const link = document.createElement('a')
  link.href = image.url
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
    console.error('复制失败:', error)
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

// 图片加载成功处理
const handleImageLoad = (e: Event) => {
  // 图片加载成功
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  
  // 直接隐藏加载失败的图片
  img.style.display = 'none'
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
  // 恢复视图模式
  const savedViewMode = localStorage.getItem('imageViewMode')
  if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
    viewMode.value = savedViewMode as 'grid' | 'list'
  }
  
  loadImages()
})
</script>

<style scoped>
.manage-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
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
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--td-border-level-1-color);
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

.stats-actions {
  display: flex;
  gap: 8px;
}

.image-container {
  min-height: 400px;
}

/* 网格视图样式 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-card {
  position: relative;
  background-color: var(--td-bg-color-container);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-card:hover {
  border-color: var(--td-brand-color-light);
  box-shadow: var(--td-shadow-2);
}

.image-card.selected {
  border-color: var(--td-brand-color);
  box-shadow: 0 0 0 2px var(--td-brand-color-light);
}

.selection-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: var(--td-bg-color-component);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--td-text-color-placeholder);
}

.placeholder-icon {
  width: 48px;
  height: 48px;
}

.image-info {
  padding: 16px;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.meta-item {
  background-color: var(--td-bg-color-component);
  padding: 2px 6px;
  border-radius: 4px;
}

.image-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--td-border-level-1-color);
  gap: 8px;
}

/* 列表视图样式 */
.list-view {
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  overflow: hidden;
}

.table-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.table-placeholder {
  width: 40px;
  height: 40px;
  background-color: var(--td-bg-color-component);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
}

.table-name {
  min-width: 0;
}

.name-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-meta {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-actions {
  display: flex;
  gap: 4px;
}

/* 空状态样式 */
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

/* 预览弹窗样式 */
.preview-dialog {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 60vh;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--td-bg-color-component);
}

.preview-full-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-info {
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .stats-actions {
    justify-content: center;
  }
  
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .image-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>