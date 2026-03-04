<template>
  <div class="articles-page">
    <div class="page-header">
      <h1>文章管理</h1>
      <p>管理系统中的所有文章内容</p>
    </div>
    
    <!-- 搜索和操作栏 -->
    <a-card class="search-card">
      <a-row :gutter="16" align="center">
        <a-col :span="5">
          <a-input
            v-model="searchForm.title"
            placeholder="搜索文章标题"
            allow-clear
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="文章状态"
            allow-clear
          >
            <a-option :value="0">草稿</a-option>
            <a-option :value="1">已发布</a-option>
            <a-option :value="2">已下架</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.category_id"
            placeholder="文章分类"
            allow-clear
          >
            <a-option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-input
            v-model="searchForm.author"
            placeholder="作者"
            allow-clear
          />
        </a-col>
        <a-col :span="7">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" @click="handleAdd">
              <template #icon>
                <icon-plus />
              </template>
              新增文章
            </a-button>
            <a-dropdown @select="handleBatchAction">
              <a-button>
                批量操作
                <icon-down />
              </a-button>
              <template #content>
                <a-doption value="publish">批量发布</a-doption>
                <a-doption value="draft">批量转草稿</a-doption>
                <a-doption value="offline">批量下架</a-doption>
                <a-doption value="recommend">批量推荐</a-doption>
                <a-doption value="unrecommend">取消推荐</a-doption>
                <a-doption value="delete" class="danger">批量删除</a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </a-col>
      </a-row>
    </a-card>
    
    <!-- 文章列表 -->
    <a-card class="table-card">
      <a-table
        :data="tableData"
        :pagination="paginationConfig"
        :loading="loading"
        :row-selection="rowSelectionConfig"
        row-key="id"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @selection-change="handleSelectionChange"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="封面" :width="100">
            <template #cell="{ record }">
              <a-image
                v-if="record.cover"
                :src="record.cover"
                :width="60"
                :height="40"
                fit="cover"
                :preview="false"
                class="cover-image"
              />
              <div v-else class="no-cover">无封面</div>
            </template>
          </a-table-column>
          <a-table-column title="标题" data-index="title" :width="300">
            <template #cell="{ record }">
              <div class="title-cell">
                <a-link @click="handleView(record)">{{ record.title }}</a-link>
                <div v-if="record.subtitle" class="subtitle">{{ record.subtitle }}</div>
                <div class="article-tags">
                  <a-tag
                    v-if="record.is_top"
                    color="red"
                    size="small"
                  >
                    置顶
                  </a-tag>
                  <a-tag
                    v-if="record.is_recommend"
                    color="orange"
                    size="small"
                  >
                    推荐
                  </a-tag>
                  <a-tag
                    v-if="record.is_hot"
                    color="gold"
                    size="small"
                  >
                    热门
                  </a-tag>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="分类" :width="120">
            <template #cell="{ record }">
              <a-tag v-if="record.category" color="blue">
                {{ record.category.name }}
              </a-tag>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="作者" data-index="author" :width="120">
            <template #cell="{ record }">
              {{ record.author || (record.admin && record.admin.nickname) || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="getStatusBadge(record.status)"
                :text="getStatusText(record.status)"
              />
            </template>
          </a-table-column>
          <a-table-column title="统计" :width="120">
            <template #cell="{ record }">
              <div class="stats">
                <div>阅读: {{ record.view_count || 0 }}</div>
                <div>点赞: {{ record.like_count || 0 }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="发布时间" :width="180">
            <template #cell="{ record }">
              {{ record.publish_time || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  @click="handleEdit(record)"
                >
                  编辑
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="handleView(record)"
                >
                  查看
                </a-button>
                <a-dropdown @select="(value) => handleQuickAction(value, record)">
                  <a-button type="text" size="small">
                    更多
                    <icon-down />
                  </a-button>
                  <template #content>
                    <a-doption v-if="record.status !== 1" value="publish">发布</a-doption>
                    <a-doption v-if="record.status === 1" value="offline">下架</a-doption>
                    <a-doption :value="record.is_recommend ? 'unrecommend' : 'recommend'">
                      {{ record.is_recommend ? '取消推荐' : '推荐' }}
                    </a-doption>
                    <a-doption :value="record.is_top ? 'untop' : 'top'">
                      {{ record.is_top ? '取消置顶' : '置顶' }}
                    </a-doption>
                    <a-doption value="delete" class="danger">删除</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    
    <!-- 文章详情模态框 -->
    <a-modal
      v-model:visible="detailVisible"
      title="文章详情"
      width="900px"
      :footer="false"
    >
      <div v-if="currentArticle" class="article-detail">
        <div class="article-header">
          <h2>{{ currentArticle.title }}</h2>
          <div v-if="currentArticle.subtitle" class="subtitle">{{ currentArticle.subtitle }}</div>
        </div>
        
        <div class="article-meta">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="作者">
              {{ currentArticle.author || (currentArticle.admin && currentArticle.admin.nickname) || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ currentArticle.category ? currentArticle.category.name : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-badge
                :status="getStatusBadge(currentArticle.status)"
                :text="getStatusText(currentArticle.status)"
              />
            </a-descriptions-item>
            <a-descriptions-item label="发布时间">
              {{ currentArticle.publish_time || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="阅读量">
              {{ currentArticle.view_count || 0 }}
            </a-descriptions-item>
            <a-descriptions-item label="点赞数">
              {{ currentArticle.like_count || 0 }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div v-if="currentArticle.tags && currentArticle.tags.length" class="article-tags-detail">
          <h4>标签</h4>
          <a-space>
            <a-tag
              v-for="tag in currentArticle.tags"
              :key="tag.id"
              :color="tag.color"
            >
              {{ tag.name }}
            </a-tag>
          </a-space>
        </div>
        
        <div v-if="currentArticle.summary" class="article-summary">
          <h4>摘要</h4>
          <p>{{ currentArticle.summary }}</p>
        </div>
        
        <div v-if="currentArticle.content" class="article-content">
          <h4>内容</h4>
          <div class="content-preview" v-html="formatContent(currentArticle.content)"></div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { Message, Modal } from '@arco-design/web-vue'
import { articleApi, categoryApi } from '@/api/articles'
import {
  IconSearch,
  IconPlus,
  IconDown,
  IconFolder,
  IconTag
} from '@arco-design/web-vue/es/icon'
import CategoryModal from './components/CategoryModal.vue'
import TagModal from './components/TagModal.vue'

export default {
  name: 'Articles',
  components: {
    IconSearch,
    IconPlus,
    IconDown,
    IconFolder,
    IconTag,
    CategoryModal,
    TagModal
  },
  setup() {
    const router = useRouter()
    const menuStore = useMenuStore()
    
    const loading = ref(false)
    const detailVisible = ref(false)
    const currentArticle = ref(null)
    const categories = ref([])
    const selectedRowKeys = ref([])
    
    const searchForm = reactive({
      title: '',
      status: undefined,
      category_id: undefined,
      author: ''
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 15,
      total: 0,
      showTotal: true,
      showPageSize: true
    })
    
    // 创建分页配置的computed，确保正确的响应式处理
    const paginationConfig = computed(() => ({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showTotal: pagination.showTotal,
      showPageSize: pagination.showPageSize
    }))
    
    const tableData = ref([])
    
    // 行选择配置
    const rowSelection = reactive({
      type: 'checkbox',
      showCheckedAll: true,
      selectedRowKeys: []
    })
    
    // 创建行选择配置的computed，确保正确的响应式处理
    const rowSelectionConfig = computed(() => ({
      type: 'checkbox',
      showCheckedAll: true,
      selectedRowKeys: rowSelection.selectedRowKeys
    }))
    
    // 处理选择变化
    const handleSelectionChange = (rowKeys) => {
      selectedRowKeys.value = rowKeys
      rowSelection.selectedRowKeys = rowKeys
    }
    
    // 获取状态徽章
    const getStatusBadge = (status) => {
      const badges = {
        0: 'warning',  // 草稿
        1: 'success',  // 已发布
        2: 'normal'    // 已下架
      }
      return badges[status] || 'normal'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        0: '草稿',
        1: '已发布',
        2: '已下架'
      }
      return texts[status] || '未知'
    }
    
    // 格式化内容（简单的markdown转html）
    const formatContent = (content) => {
      if (!content) return ''
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
    }
    
    // 加载分类数据
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAll()
        // 🎯 响应拦截器已经解包数据
        if (response) {
          categories.value = response
        }
      } catch (error) {
        Message.error('加载分类失败')
      }
    }
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      
      try {
        const params = {
          page: pagination.current,
          limit: pagination.pageSize,
          ...searchForm
        }
        
        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        
        const response = await articleApi.getList(params)
        
        // 🎯 响应拦截器已经解包数据
        if (response && response.list) {
          tableData.value = response.list
          pagination.total = response.total
        } else {
          Message.error('获取数据失败')
        }
      } catch (error) {
        Message.error('获取数据失败')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      loadData()
    }
    
    // 重置
    const handleReset = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = key === 'status' || key === 'category_id' ? undefined : ''
      })
      pagination.current = 1
      loadData()
    }
    
    // 新增文章
    const handleAdd = () => {
      router.push('/content/add-article')
    }
    
    // 编辑文章
    const handleEdit = (record) => {
      router.push(`/content/edit-article/${record.id}`)
    }
    
    // 查看文章
    const handleView = async (record) => {
      try {
        const response = await articleApi.getDetail(record.id)
        // 🎯 响应拦截器已经解包数据
        currentArticle.value = response
        detailVisible.value = true
      } catch (error) {
        console.error('获取文章详情失败:', error)
        Message.error('获取文章详情失败')
      }
    }
    
    // 快速操作
    const handleQuickAction = async (action, record) => {
      const actions = {
        publish: { action: 'publish', text: '发布' },
        offline: { action: 'offline', text: '下架' },
        recommend: { action: 'recommend', text: '推荐' },
        unrecommend: { action: 'unrecommend', text: '取消推荐' },
        top: { action: 'top', text: '置顶' },
        untop: { action: 'untop', text: '取消置顶' },
        delete: { action: 'delete', text: '删除' }
      }
      
      const actionConfig = actions[action]
      if (!actionConfig) return
      
      if (action === 'delete') {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除文章"${record.title}"吗？`,
          onOk: async () => {
            try {
              await articleApi.delete(record.id)
              // 🎯 响应拦截器已经处理了成功状态，如果到这里说明操作成功
              Message.success('删除成功')
              loadData()
            } catch (error) {
              console.error('删除失败:', error)
              Message.error('删除失败')
            }
          }
        })
      } else {
        try {
          await articleApi.batchAction({
            action: actionConfig.action,
            ids: [record.id]
          })
          
          // 🎯 响应拦截器已经处理了成功状态，如果到这里说明操作成功
          Message.success(`${actionConfig.text}成功`)
          loadData()
        } catch (error) {
          console.error(`${actionConfig.text}失败:`, error)
          Message.error(`${actionConfig.text}失败`)
        }
      }
    }
    
    // 批量操作
    const handleBatchAction = async (action) => {
      if (selectedRowKeys.value.length === 0) {
        Message.warning('请先选择要操作的文章')
        return
      }
      
      const actions = {
        publish: '发布',
        draft: '转为草稿',
        offline: '下架',
        recommend: '推荐',
        unrecommend: '取消推荐',
        delete: '删除'
      }
      
      const actionText = actions[action]
      if (!actionText) return
      
      if (action === 'delete') {
        Modal.confirm({
          title: '确认批量删除',
          content: `确定要删除选中的 ${selectedRowKeys.value.length} 篇文章吗？`,
          onOk: async () => {
            await performBatchAction(action, actionText)
          }
        })
      } else {
        await performBatchAction(action, actionText)
      }
    }
    
    // 执行批量操作
    const performBatchAction = async (action, actionText) => {
      try {
        await articleApi.batchAction({
          action,
          ids: selectedRowKeys.value
        })
        
        // 🎯 响应拦截器已经处理了成功状态，如果到这里说明操作成功
        Message.success(`批量${actionText}成功`)
        selectedRowKeys.value = []
        loadData()
      } catch (error) {
        console.error(`批量${actionText}失败:`, error)
        Message.error(`批量${actionText}失败`)
      }
    }
    
    // 分页变化
    const handlePageChange = (page) => {
      pagination.current = page
      loadData()
    }
    
    const handlePageSizeChange = (pageSize) => {
      pagination.pageSize = pageSize
      pagination.current = 1
      loadData()
    }
    
    onMounted(() => {
      menuStore.generateBreadcrumbs('/content/articles')
      loadCategories()
      loadData()
    })
    
    return {
      loading,
      detailVisible,
      currentArticle,
      categories,
      selectedRowKeys,
      searchForm,
      pagination,
      paginationConfig,
      tableData,
      rowSelection,
      rowSelectionConfig,
      getStatusBadge,
      getStatusText,
      formatContent,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleView,
      handleQuickAction,
      handleBatchAction,
      handlePageChange,
      handlePageSizeChange,
      handleSelectionChange,
      loadCategories
    }
  }
}
</script>

<style scoped>
.articles-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
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

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.cover-image {
  border-radius: 4px;
}

.no-cover {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 4px;
  font-size: 12px;
  color: #86909c;
}

.title-cell {
  line-height: 1.4;
}

.subtitle {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.article-tags {
  margin-top: 8px;
}

.stats {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

.article-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.article-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.article-header .subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 16px;
}

.article-meta {
  margin-bottom: 24px;
}

.article-tags-detail {
  margin-bottom: 24px;
}

.article-tags-detail h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.article-summary {
  margin-bottom: 24px;
}

.article-summary h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.article-summary p {
  margin: 0;
  line-height: 1.6;
  color: #4e5969;
}

.article-content h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.content-preview {
  line-height: 1.6;
  color: #4e5969;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
}

:deep(.arco-dropdown-option.danger) {
  color: #f53f3f;
}

:deep(.arco-dropdown-option.danger:hover) {
  background-color: #ffece8;
  color: #f53f3f;
}
</style> 