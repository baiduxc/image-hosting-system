<template>
  <div class="stats-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">数据统计</h1>
      <p class="page-description">查看图床使用情况和数据分析</p>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="stat-card">
        <div class="card-icon primary">
          <ImageIcon />
        </div>
        <div class="card-content">
          <h3 class="card-title">总图片数</h3>
          <p class="card-value">{{ formatNumber(stats.totalImages) }}</p>
          <p class="card-change" :class="{ positive: stats.imageGrowth > 0, negative: stats.imageGrowth < 0 }">
            <TrendingUpIcon v-if="stats.imageGrowth > 0" />
            <TrendingDownIcon v-else-if="stats.imageGrowth < 0" />
            {{ stats.imageGrowth > 0 ? '+' : '' }}{{ stats.imageGrowth }}% 较上月
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon success">
          <HardDriveIcon />
        </div>
        <div class="card-content">
          <h3 class="card-title">存储使用</h3>
          <p class="card-value">{{ formatFileSize(stats.totalStorage) }}</p>
          <p class="card-change" :class="{ positive: stats.storageGrowth > 0, negative: stats.storageGrowth < 0 }">
            <TrendingUpIcon v-if="stats.storageGrowth > 0" />
            <TrendingDownIcon v-else-if="stats.storageGrowth < 0" />
            {{ stats.storageGrowth > 0 ? '+' : '' }}{{ stats.storageGrowth }}% 较上月
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon warning">
          <UploadIcon />
        </div>
        <div class="card-content">
          <h3 class="card-title">今日上传</h3>
          <p class="card-value">{{ formatNumber(stats.todayUploads) }}</p>
          <p class="card-change" :class="{ positive: stats.uploadGrowth > 0, negative: stats.uploadGrowth < 0 }">
            <TrendingUpIcon v-if="stats.uploadGrowth > 0" />
            <TrendingDownIcon v-else-if="stats.uploadGrowth < 0" />
            {{ stats.uploadGrowth > 0 ? '+' : '' }}{{ stats.uploadGrowth }}% 较昨日
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon info">
          <EyeIcon />
        </div>
        <div class="card-content">
          <h3 class="card-title">总访问量</h3>
          <p class="card-value">{{ formatNumber(stats.totalViews) }}</p>
          <p class="card-change" :class="{ positive: stats.viewGrowth > 0, negative: stats.viewGrowth < 0 }">
            <TrendingUpIcon v-if="stats.viewGrowth > 0" />
            <TrendingDownIcon v-else-if="stats.viewGrowth < 0" />
            {{ stats.viewGrowth > 0 ? '+' : '' }}{{ stats.viewGrowth }}% 较上月
          </p>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  ImageIcon,
  HardDriveIcon,
  UploadIcon,
  EyeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import * as echarts from 'echarts'
import { apiService } from '@/services/api'

// 响应式数据
const isLoadingStats = ref(false)
const isExporting = ref(false)
const uploadTrendPeriod = ref('30d')
const dateRange = ref<string[]>([])
const popularImages = ref<any[]>([])
const detailedStats = ref<any[]>([])

// 图表实例
const uploadTrendChart = ref<HTMLElement>()
const storageChart = ref<HTMLElement>()
const fileTypeChart = ref<HTMLElement>()
let uploadTrendChartInstance: echarts.ECharts | null = null
let storageChartInstance: echarts.ECharts | null = null
let fileTypeChartInstance: echarts.ECharts | null = null

// 统计数据
const stats = ref({
  totalImages: 0,
  totalStorage: 0,
  todayUploads: 0,
  totalViews: 0,
  imageGrowth: 0,
  storageGrowth: 0,
  uploadGrowth: 0,
  viewGrowth: 0
})

// 分页数据
const statsPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const statsColumns = [
  {
    colKey: 'date',
    title: '日期',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'uploads',
    title: '上传数量',
    width: 100,
    align: 'right'
  },
  {
    colKey: 'storage',
    title: '存储增量',
    width: 120,
    align: 'right'
  },
  {
    colKey: 'views',
    title: '访问量',
    width: 100,
    align: 'right'
  },
  {
    colKey: 'avgSize',
    title: '平均大小',
    width: 120,
    align: 'right'
  }
]

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await apiService.getStats()
    if (response.success && response.data) {
      // 直接使用返回的数据，后端没有嵌套结构
      stats.value = {
        totalImages: response.data.totalImages || 0,
        totalStorage: response.data.totalSize || 0,
        todayUploads: response.data.monthlyUploads || 0,
        totalViews: response.data.totalTraffic || 0,
        imageGrowth: 0,
        storageGrowth: 0,
        uploadGrowth: 0,
        viewGrowth: 0
      }
      popularImages.value = [] // 暂时没有热门图片数据
      
      // 初始化图表
      await nextTick()
      initCharts()
      // 暂时不调用updateCharts，因为没有图表数据
      // updateCharts(response.data)
    }
  } catch (error) {
    MessagePlugin.error('加载统计数据失败')
  }
}

// 加载详细统计 - 暂时使用模拟数据
const loadDetailedStats = async () => {
  isLoadingStats.value = true
  try {
    // TODO: 实现详细统计API
    // 暂时使用模拟数据
    detailedStats.value = []
    statsPagination.value.total = 0
  } catch (error) {
    MessagePlugin.error('加载详细统计失败')
  } finally {
    isLoadingStats.value = false
  }
}

// 初始化图表
const initCharts = () => {
  if (uploadTrendChart.value) {
    uploadTrendChartInstance = echarts.init(uploadTrendChart.value)
  }
  if (storageChart.value) {
    storageChartInstance = echarts.init(storageChart.value)
  }
  if (fileTypeChart.value) {
    fileTypeChartInstance = echarts.init(fileTypeChart.value)
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateCharts = (data: any) => {
  updateUploadTrendChart(data.uploadTrend || [])
  updateStorageChart(data.storageDistribution || [])
  updateFileTypeChart(data.fileTypeDistribution || [])
}

// 更新上传趋势图
const updateUploadTrendChart = (data: any[]) => {
  if (!uploadTrendChartInstance) return

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.date)
    },
    yAxis: [
      {
        type: 'value',
        name: '上传数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '存储大小(MB)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '上传数量',
        type: 'line',
        smooth: true,
        data: data.map(item => item.uploads),
        itemStyle: {
          color: '#366ef4'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(54, 110, 244, 0.3)' },
            { offset: 1, color: 'rgba(54, 110, 244, 0.1)' }
          ])
        }
      },
      {
        name: '存储大小',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.map(item => (item.storage / 1024 / 1024).toFixed(2)),
        itemStyle: {
          color: '#00a870'
        }
      }
    ]
  }

  uploadTrendChartInstance.setOption(option)
}

// 更新存储分布图
const updateStorageChart = (data: any[]) => {
  if (!storageChartInstance) return

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '存储分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item, index) => ({
          value: item.size,
          name: item.type,
          itemStyle: {
            color: ['#366ef4', '#00a870', '#e37318', '#d54941', '#8b5cf6'][index % 5]
          }
        }))
      }
    ]
  }

  storageChartInstance.setOption(option)
}

// 更新文件类型分布图
const updateFileTypeChart = (data: any[]) => {
  if (!fileTypeChartInstance) return

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.type.toUpperCase())
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '文件数量',
        type: 'bar',
        data: data.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: ['#366ef4', '#00a870', '#e37318', '#d54941', '#8b5cf6'][index % 5]
          }
        })),
        barWidth: '60%'
      }
    ]
  }

  fileTypeChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  uploadTrendChartInstance?.resize()
  storageChartInstance?.resize()
  fileTypeChartInstance?.resize()
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  statsPagination.value.current = 1
  loadDetailedStats()
}

// 处理分页变化
const handleStatsPageChange = (pageInfo: any) => {
  statsPagination.value.current = pageInfo.current
  statsPagination.value.pageSize = pageInfo.pageSize
  loadDetailedStats()
}

// 导出统计数据
const exportStats = async () => {
  isExporting.value = true
  try {
    // TODO: 实现导出功能
    MessagePlugin.success('导出功能开发中...')
  } catch (error) {
    MessagePlugin.error('导出失败')
  } finally {
    isExporting.value = false
  }
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// 监听上传趋势周期变化
watch(uploadTrendPeriod, () => {
  loadStats()
})

// 组件挂载时执行
onMounted(() => {
  loadStats()
  loadDetailedStats()
  
  // 设置默认日期范围（最近30天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  dateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  uploadTrendChartInstance?.dispose()
  storageChartInstance?.dispose()
  fileTypeChartInstance?.dispose()
})
</script>

<style scoped>
.stats-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-top: 30px;
  margin-bottom: 32px;
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

/* 概览卡片样式 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: var(--td-bg-color-container);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--td-border-level-1-color);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card:hover {
  box-shadow: var(--td-shadow-2);
  border-color: var(--td-brand-color-light);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.primary {
  background-color: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

.card-icon.success {
  background-color: var(--td-success-color-light);
  color: var(--td-success-color);
}

.card-icon.warning {
  background-color: var(--td-warning-color-light);
  color: var(--td-warning-color);
}

.card-icon.info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
  margin: 0 0 8px 0;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
}

.card-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.card-change.positive {
  color: var(--td-success-color);
}

.card-change.negative {
  color: var(--td-error-color);
}

/* 图表区域样式 */
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.chart-card {
  background-color: var(--td-bg-color-container);
  border-radius: 12px;
  border: 1px solid var(--td-border-level-1-color);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 12px;
}

.chart-container {
  padding: 20px 24px;
}

.chart {
  width: 100%;
  height: 300px;
}

/* 热门图片样式 */
.popular-images {
  padding: 20px 24px;
  max-height: 340px;
  overflow-y: auto;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.popular-item:last-child {
  border-bottom: none;
}

.popular-rank {
  width: 24px;
  height: 24px;
  background-color: var(--td-brand-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.popular-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.popular-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-info {
  flex: 1;
  min-width: 0;
}

.popular-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-views {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin: 0;
}

.empty-popular {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--td-text-color-placeholder);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

/* 详细统计样式 */
.detailed-stats {
  background-color: var(--td-bg-color-container);
  border-radius: 12px;
  border: 1px solid var(--td-border-level-1-color);
  overflow: hidden;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.stats-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0;
}

.stats-controls {
  display: flex;
  gap: 12px;
}

.stat-number {
  font-weight: 500;
  color: var(--td-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .card-value {
    font-size: 20px;
  }
  
  .charts-section {
    gap: 16px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .chart {
    height: 250px;
  }
  
  .stats-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .stats-controls {
    justify-content: stretch;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .card-content {
    width: 100%;
  }
  
  .chart-container {
    padding: 16px;
  }
  
  .chart {
    height: 200px;
  }
}
</style>