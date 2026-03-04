<template>
  <div class="file-manager-page">
    <div class="page-header">
      <h1>文件管理</h1>
      <p>管理系统中的所有上传文件</p>
    </div>
    
    <!-- 操作栏 -->
    <a-card class="action-card">
      <a-row :gutter="16" align="center">
        <a-col :span="6">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索文件名"
            allow-clear
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.storage_type"
            placeholder="存储类型"
            allow-clear
          >
            <a-option value="local">本地存储</a-option>
            <a-option value="aliyun_oss">阿里云OSS</a-option>
            <a-option value="tencent_cos">腾讯云COS</a-option>
            <a-option value="qiniu">七牛云</a-option>
            <a-option value="backblaze_b2">Backblaze B2</a-option>
            <a-option value="minio">MinIO</a-option>
            <a-option value="cloudflare_r2">Cloudflare R2</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="loadData">
              <template #icon>
                <icon-refresh />
              </template>
              刷新
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="8" style="text-align: right;">
          <a-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            @change="handleUpload"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            multiple
          >
            <template #upload-button>
              <a-button type="primary">
                <template #icon>
                  <icon-upload />
                </template>
                上传文件
              </a-button>
            </template>
          </a-upload>
        </a-col>
      </a-row>
    </a-card>
    
    <!-- 文件列表 -->
    <a-card class="table-card">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="文件名" data-index="original_name" :width="300">
            <template #cell="{ record }">
              <div class="file-info">
                <div class="file-name" :title="record.original_name">
                  {{ record.original_name || '未知文件' }}
                </div>
                <div class="file-size">
                  {{ formatFileSize(record.file_size || 0) }}
                </div>
              </div>
            </template>
          </a-table-column>
          
          <a-table-column title="存储类型" data-index="storage_type" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getStorageTypeColor(record.storage_type)">
                {{ getStorageTypeName(record.storage_type) }}
              </a-tag>
            </template>
          </a-table-column>
          
          <a-table-column title="访问URL" data-index="url" :width="300">
            <template #cell="{ record }">
              <a-typography-text
                :ellipsis="{ tooltip: true }"
                copyable
              >
                {{ record.url || '-' }}
              </a-typography-text>
            </template>
          </a-table-column>
          
          <a-table-column title="创建时间" data-index="create_time" :width="180">
            <template #cell="{ record }">
              {{ formatTime(record.create_time) }}
            </template>
          </a-table-column>
          
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  v-if="isImage(record.extension)"
                  type="text"
                  size="small"
                  @click="handlePreview(record)"
                >
                  预览
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="handleView(record)"
                >
                  详情
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="handleCopy(record.url)"
                >
                  复制链接
                </a-button>
                <a-popconfirm
                  content="确定要删除这个文件吗？删除后无法恢复！"
                  @ok="handleDelete(record)"
                >
                  <a-button
                    type="text"
                    size="small"
                    status="danger"
                  >
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    
    <!-- 文件详情模态框 -->
    <a-modal
      v-model:visible="detailVisible"
      title="文件详情"
      width="600px"
      :footer="false"
    >
      <div v-if="currentFile" class="file-detail">
        <div class="file-preview-large">
          <img
            v-if="isImage(currentFile.extension)"
            :src="currentFile.url"
            :alt="currentFile.original_name"
            class="preview-image-large"
          />
          <div v-else class="file-icon-large">
            <icon-file />
            <div class="file-type">{{ currentFile.extension.toUpperCase() }}</div>
          </div>
        </div>
        
        <a-descriptions :column="1" bordered class="file-descriptions">
          <a-descriptions-item label="原始文件名">
            {{ currentFile.original_name }}
          </a-descriptions-item>
          <a-descriptions-item label="存储文件名">
            {{ currentFile.save_name }}
          </a-descriptions-item>
          <a-descriptions-item label="文件大小">
            {{ formatFileSize(currentFile.file_size) }}
          </a-descriptions-item>
          <a-descriptions-item label="文件类型">
            {{ currentFile.mime_type }}
          </a-descriptions-item>
          <a-descriptions-item label="存储类型">
            <a-tag :color="getStorageTypeColor(currentFile.storage_type)">
              {{ getStorageTypeName(currentFile.storage_type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="存储路径">
            {{ currentFile.save_path }}
          </a-descriptions-item>
          <a-descriptions-item label="访问URL">
            <a-typography-text copyable>
              {{ currentFile.url }}
            </a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="上传时间">
            {{ formatTime(currentFile.create_time) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
    
    <!-- 图片预览模态框 -->
    <a-modal
      v-model:visible="previewVisible"
      title="图片预览"
      width="80%"
      :footer="false"
    >
      <div v-if="previewFile" class="image-preview">
        <img
          :src="previewFile.url"
          :alt="previewFile.original_name"
          class="preview-image-full"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useMenuStore } from '@/stores/menu'
import { filesApi } from '@/api/storage'
import { getApiUrl, getAuthToken } from '@/api/config'
import { API_CONFIG } from '@/api/config'
import { handleUploadResponse } from '@/utils/upload'
import {
  IconSearch,
  IconRefresh,
  IconUpload,
  IconFile
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'FileManager',
  components: {
    IconSearch,
    IconRefresh,
    IconUpload,
    IconFile
  },
  setup() {
    const menuStore = useMenuStore()
    
    const loading = ref(false)
    const detailVisible = ref(false)
    const previewVisible = ref(false)
    const currentFile = ref(null)
    const previewFile = ref(null)
    
    // 上传配置
    const uploadUrl = computed(() => getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD))
    const uploadHeaders = computed(() => {
      const token = getAuthToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    })
    
    const searchForm = reactive({
      keyword: '',
      storage_type: ''
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showTotal: true,
      showPageSize: true
    })
    
    const tableData = ref([])
    
    // 加载文件列表
    const loadData = async () => {
      loading.value = true
      
      try {
        const params = {
          page: pagination.current,
          limit: pagination.pageSize,
          ...searchForm
        }
        
        const response = await filesApi.getFiles(params)
        
        // 🎯 标准数据处理逻辑 - 参考用户列表的处理方式
        if (Array.isArray(response)) {
          // 情况1: 直接返回数组
          tableData.value = response
          pagination.total = response.length
        } else if (response && response.data && Array.isArray(response.data)) {
          // 情况2: 分页格式 {data: [], current_page: 1, total: 100}
          tableData.value = response.data
          pagination.current = response.current_page || pagination.current
          pagination.total = response.total || 0
        } else if (response && response.list && Array.isArray(response.list)) {
          // 情况3: 分页格式 {list: [], page: 1, total: 100}
          tableData.value = response.list
          pagination.total = response.total || 0
        } else {
          // 情况4: 兜底处理
          tableData.value = []
          pagination.total = 0
          console.warn('文件列表API响应数据格式不符合预期:', response)
        }
      } catch (error) {
        console.error('获取文件列表失败:', error)
        Message.error('获取文件列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      loadData()
    }
    
    // 重置搜索
    const handleReset = () => {
      searchForm.keyword = ''
      searchForm.storage_type = ''
      pagination.current = 1
      loadData()
    }
    
    // 分页变化
    const handlePageChange = (page) => {
      pagination.current = page
      loadData()
    }
    
    // 每页数量变化
    const handlePageSizeChange = (pageSize) => {
      pagination.pageSize = pageSize
      pagination.current = 1
      loadData()
    }
    
    // 文件上传处理
    const handleUpload = (fileList, fileItem) => {
      if (fileItem.status === 'done') {
        handleUploadResponse(
          fileItem,
          (url) => {
            Message.success('文件上传成功')
            loadData() // 刷新当前页
          },
          (error) => {
            console.error('文件上传失败:', error)
          }
        )
      }
    }
    
    // 查看文件详情
    const handleView = (record) => {
      currentFile.value = record
      detailVisible.value = true
    }
    
    // 预览图片
    const handlePreview = (record) => {
      if (isImage(record.extension)) {
        previewFile.value = record
        previewVisible.value = true
      }
    }
    
    // 复制链接
    const handleCopy = async (url) => {
      try {
        await navigator.clipboard.writeText(url)
        Message.success('链接已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        Message.error('复制失败，请手动复制')
      }
    }
    
    // 删除文件
    const handleDelete = async (record) => {
      try {
        await filesApi.deleteFile(record.id)
        Message.success('文件删除成功')
        loadData()
      } catch (error) {
        console.error('删除文件失败:', error)
        Message.error('删除文件失败')
      }
    }
    
    // 判断是否为图片
    const isImage = (extension) => {
      if (!extension) return false
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
      return imageTypes.includes(extension.toLowerCase())
    }
    
    // 格式化文件大小
    const formatFileSize = (size) => {
      if (size < 1024) return size + ' B'
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
      if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB'
      return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '-'
      
      let date
      if (typeof timestamp === 'string') {
        // 如果是字符串格式的时间
        date = new Date(timestamp)
      } else if (typeof timestamp === 'number') {
        // 如果是时间戳，判断是秒还是毫秒
        if (timestamp.toString().length === 10) {
          // 10位数字，秒级时间戳
          date = new Date(timestamp * 1000)
        } else {
          // 13位数字，毫秒级时间戳
          date = new Date(timestamp)
        }
      } else {
        return '-'
      }
      
      if (isNaN(date.getTime())) {
        return '-'
      }
      
      return date.toLocaleString('zh-CN')
    }
    
    // 获取文件类型颜色
    const getFileTypeColor = (extension) => {
      if (!extension) return 'gray'
      const colors = {
        jpg: 'blue', jpeg: 'blue', png: 'blue', gif: 'blue', webp: 'blue',
        pdf: 'red',
        doc: 'green', docx: 'green',
        xls: 'orange', xlsx: 'orange',
        zip: 'purple', rar: 'purple'
      }
      return colors[extension.toLowerCase()] || 'gray'
    }
    
    // 获取存储类型颜色
    const getStorageTypeColor = (type) => {
      if (!type) return 'gray'
      const colors = {
        local: 'blue',
        aliyun_oss: 'orange',
        tencent_cos: 'purple',
        qiniu: 'green',
        backblaze_b2: 'cyan',
        minio: 'magenta',
        cloudflare_r2: 'red'
      }
      return colors[type] || 'gray'
    }
    
    // 获取存储类型名称
    const getStorageTypeName = (type) => {
      if (!type) return '未知'
      const names = {
        local: '本地存储',
        aliyun_oss: '阿里云OSS',
        tencent_cos: '腾讯云COS',
        qiniu: '七牛云',
        backblaze_b2: 'Backblaze B2',
        minio: 'MinIO',
        cloudflare_r2: 'Cloudflare R2'
      }
      return names[type] || type
    }
    
    onMounted(() => {
      menuStore.generateBreadcrumbs('/system/files')
      loadData()
    })
    
    return {
      loading,
      detailVisible,
      previewVisible,
      currentFile,
      previewFile,
      uploadUrl,
      uploadHeaders,
      searchForm,
      pagination,
      tableData,
      loadData,
      handleSearch,
      handleReset,
      handlePageChange,
      handlePageSizeChange,
      handleUpload,
      handleView,
      handlePreview,
      handleCopy,
      handleDelete,
      isImage,
      formatFileSize,
      formatTime,
      getFileTypeColor,
      getStorageTypeColor,
      getStorageTypeName
    }
  }
}
</script>

<style scoped>
.file-manager-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.action-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
}

.preview-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-image:hover {
  transform: scale(1.1);
}

.file-icon {
  font-size: 24px;
  color: #86909c;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.file-size {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

.file-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-preview-large {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f7f8fa;
  border-radius: 8px;
}

.preview-image-large {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
}

.file-icon-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 48px;
  color: #86909c;
}

.file-type {
  font-size: 16px;
  font-weight: 500;
}

.file-descriptions {
  margin-top: 20px;
}

.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.preview-image-full {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
</style> 