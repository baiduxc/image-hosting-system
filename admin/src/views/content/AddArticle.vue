<template>
  <div class="add-article-page">
    <div class="page-header">
      <h1>{{ isEdit ? '编辑文章' : '添加文章' }}</h1>
      <p>{{ isEdit ? '修改文章内容' : '创建新的文章内容' }}</p>
    </div>
    
    <a-form
      ref="formRef"
      :model="articleForm"
      :rules="rules"
      layout="vertical"
    >
      <a-row :gutter="24">
        <a-col :span="16">
          <!-- 基本信息 -->
          <a-card title="基本信息" class="section-card">
            <a-form-item field="title" label="文章标题" required>
              <a-input
                v-model="articleForm.title"
                placeholder="请输入文章标题"
                size="large"
                :max-length="200"
                show-word-limit
              />
            </a-form-item>
            
            <a-form-item field="subtitle" label="文章副标题">
              <a-input
                v-model="articleForm.subtitle"
                placeholder="请输入文章副标题（可选）"
              />
            </a-form-item>
            
            <a-form-item field="summary" label="文章摘要">
              <a-textarea
                v-model="articleForm.summary"
                placeholder="请输入文章摘要，用于搜索引擎优化和文章预览"
                :rows="3"
                :max-length="500"
                show-word-limit
              />
            </a-form-item>
            
            <a-form-item field="content" label="文章内容" required>
              <div class="editor-container">
                <div class="editor-toolbar">
                  <a-space>
                    <a-button size="small" @click="insertText('**粗体**')">
                      <template #icon>
                        <icon-bold />
                      </template>
                      粗体
                    </a-button>
                    <a-button size="small" @click="insertText('*斜体*')">
                      <template #icon>
                        <icon-italic />
                      </template>
                      斜体
                    </a-button>
                    <a-button size="small" @click="insertText('# 标题')">
                      标题
                    </a-button>
                    <a-button size="small" @click="insertText('- 列表项')">
                      列表
                    </a-button>
                    <a-button size="small" @click="insertText('[链接文字](链接地址)')">
                      链接
                    </a-button>
                    <a-button size="small" @click="insertText('```\n代码块\n```')">
                      代码
                    </a-button>
                    <a-button size="small" @click="insertText('> 引用')">
                      引用
                    </a-button>
                  </a-space>
                </div>
                <a-textarea
                  ref="contentEditor"
                  v-model="articleForm.content"
                  placeholder="请输入文章内容，支持Markdown语法"
                  :rows="30"
                  class="content-editor"
                />
                <div class="editor-tips">
                  <a-alert type="info" show-icon>
                    <template #icon>
                      <icon-info-circle />
                    </template>
                    支持Markdown语法，可以使用上方工具栏快速插入格式
                  </a-alert>
                </div>
              </div>
            </a-form-item>
          </a-card>
          
          <!-- SEO设置 -->
          <a-card title="SEO设置" class="section-card">
            <a-form-item field="seo_title" label="SEO标题">
              <a-input
                v-model="articleForm.seo_title"
                placeholder="请输入SEO标题（留空则使用文章标题）"
                :max-length="100"
                show-word-limit
              />
            </a-form-item>
            
            <a-form-item field="seo_keywords" label="SEO关键词">
              <a-input
                v-model="articleForm.seo_keywords"
                placeholder="请输入关键词，用逗号分隔"
              />
            </a-form-item>
            
            <a-form-item field="seo_description" label="SEO描述">
              <a-textarea
                v-model="articleForm.seo_description"
                placeholder="请输入SEO描述（留空则使用文章摘要）"
                :rows="3"
                :max-length="200"
                show-word-limit
              />
            </a-form-item>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <!-- 发布设置 -->
          <a-card title="发布设置" class="section-card">
            <a-form-item field="status" label="文章状态" required>
              <a-select v-model="articleForm.status" placeholder="请选择文章状态">
                <a-option :value="0">草稿</a-option>
                <a-option :value="1">发布</a-option>
                <a-option :value="2">下架</a-option>
              </a-select>
            </a-form-item>
            
            <a-form-item field="publish_time" label="发布时间">
              <a-date-picker
                v-model="articleForm.publish_time"
                show-time
                placeholder="请选择发布时间（留空为立即发布）"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
            
            <a-form-item field="category_id" label="文章分类">
              <a-select 
                v-model="articleForm.category_id" 
                placeholder="请选择分类"
                allow-search
              >
                <a-option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </a-option>
              </a-select>
              <div class="form-item-extra">
                <a-link @click="showCategoryModal = true">管理分类</a-link>
              </div>
            </a-form-item>
            
            <a-form-item field="tag_ids" label="文章标签">
              <a-select
                v-model="articleForm.tag_ids"
                placeholder="请选择标签"
                multiple
                allow-search
                allow-create
                @create="handleCreateTag"
              >
                <a-option
                  v-for="tag in tags"
                  :key="tag.id"
                  :value="tag.id"
                >
                  <a-tag :color="tag.color" size="small">{{ tag.name }}</a-tag>
                </a-option>
              </a-select>
              <div class="form-item-extra">
                <a-link @click="showTagModal = true">管理标签</a-link>
              </div>
            </a-form-item>
            
            <a-form-item field="author" label="作者">
              <a-input
                v-model="articleForm.author"
                placeholder="请输入作者名称（留空使用当前用户）"
              />
            </a-form-item>
            
            <a-form-item field="source" label="来源">
              <a-input
                v-model="articleForm.source"
                placeholder="请输入文章来源（可选）"
              />
            </a-form-item>
            
            <a-divider />
            
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="is_recommend" label="推荐">
                  <a-switch
                    v-model="articleForm.is_recommend"
                    :checked-value="1"
                    :unchecked-value="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="is_top" label="置顶">
                  <a-switch
                    v-model="articleForm.is_top"
                    :checked-value="1"
                    :unchecked-value="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="is_hot" label="热门">
                  <a-switch
                    v-model="articleForm.is_hot"
                    :checked-value="1"
                    :unchecked-value="0"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item field="sort" label="排序">
              <a-input-number
                v-model="articleForm.sort"
                placeholder="数值越大越靠前"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-card>
          
          <!-- 封面图片 -->
          <a-card title="封面图片" class="section-card">
            <a-form-item field="cover">
              <a-upload
                :action="uploadUrl"
                :file-list="coverFileList"
                :show-file-list="false"
                @change="handleCoverChange"
                accept="image/*"
                :headers="uploadHeaders"
              >
                <template #upload-button>
                  <div class="cover-upload">
                    <div v-if="articleForm.cover" class="cover-preview">
                      <img :src="articleForm.cover" alt="封面" />
                      <div class="cover-overlay">
                        <icon-edit />
                      </div>
                    </div>
                    <div v-else class="upload-placeholder">
                      <icon-plus />
                      <div>上传封面</div>
                    </div>
                  </div>
                </template>
              </a-upload>
              <div class="form-item-extra">
                建议尺寸：800x450px，支持jpg、png格式
              </div>
            </a-form-item>
          </a-card>
          
          <!-- 操作按钮 -->
          <a-card class="action-card">
            <a-space direction="vertical" fill>
              <a-button
                type="primary"
                @click="handleSubmit"
                long
                :loading="submitLoading"
              >
                {{ isEdit ? '更新文章' : (articleForm.status === 1 ? '发布文章' : '保存文章') }}
              </a-button>
              
              <a-button
                long
                @click="handlePreview"
                :loading="previewLoading"
              >
                预览文章
              </a-button>
              
              <a-button
                long
                @click="handleSaveDraft"
                :loading="draftLoading"
                v-if="!isEdit"
              >
                保存草稿
              </a-button>
              
              <a-button
                long
                @click="handleCancel"
              >
                取消
              </a-button>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-form>
    
    <!-- 分类管理模态框 -->
    <CategoryModal
      v-model:visible="showCategoryModal"
      @refresh="loadCategories"
    />
    
    <!-- 标签管理模态框 -->
    <TagModal
      v-model:visible="showTagModal"
      @refresh="loadTags"
    />
    
    <!-- 预览模态框 -->
    <a-modal
      v-model:visible="previewVisible"
      title="文章预览"
      width="900px"
      :footer="false"
    >
      <div class="article-preview">
        <div class="preview-header">
          <h1>{{ articleForm.title }}</h1>
          <div v-if="articleForm.subtitle" class="subtitle">{{ articleForm.subtitle }}</div>
          <div class="meta">
            <a-space>
              <span>作者：{{ articleForm.author || '当前用户' }}</span>
              <span v-if="articleForm.source">来源：{{ articleForm.source }}</span>
              <span>发布时间：{{ articleForm.publish_time || '立即发布' }}</span>
            </a-space>
          </div>
        </div>
        
        <div v-if="articleForm.cover" class="preview-cover">
          <img :src="articleForm.cover" alt="封面" />
        </div>
        
        <div v-if="articleForm.summary" class="preview-summary">
          <h3>摘要</h3>
          <p>{{ articleForm.summary }}</p>
        </div>
        
        <div class="preview-content">
          <h3>内容</h3>
          <div v-html="formatContent(articleForm.content)"></div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { Message } from '@arco-design/web-vue'
import { articleApi, categoryApi, tagApi } from '@/api/articles'
import { getApiUrl, getAuthToken, API_CONFIG } from '@/api/config'
import { handleUploadResponse } from '@/utils/upload'
import CategoryModal from './components/CategoryModal.vue'
import TagModal from './components/TagModal.vue'
import {
  IconBold,
  IconItalic,
  IconEdit,
  IconPlus,
  IconInfoCircle
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'AddArticle',
  components: {
    CategoryModal,
    TagModal,
    IconBold,
    IconItalic,
    IconEdit,
    IconPlus,
    IconInfoCircle
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const menuStore = useMenuStore()
    
    const formRef = ref()
    const contentEditor = ref()
    const submitLoading = ref(false)
    const previewLoading = ref(false)
    const draftLoading = ref(false)
    const previewVisible = ref(false)
    const showCategoryModal = ref(false)
    const showTagModal = ref(false)
    const coverFileList = ref([])
    const categories = ref([])
    const tags = ref([])
    
    // 判断是否为编辑模式
    const isEdit = computed(() => !!route.params.id)
    
    // 上传配置 - 使用统一的上传接口
    const uploadUrl = computed(() => getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD))
    const uploadHeaders = computed(() => {
      const token = getAuthToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    })
    
    const articleForm = reactive({
      title: '',
      subtitle: '',
      summary: '',
      content: '',
      category_id: undefined,
      author: '',
      source: '',
      tag_ids: [],
      is_recommend: 0,
      is_top: 0,
      is_hot: 0,
      status: 0,
      publish_time: '',
      sort: 0,
      cover: '',
      seo_title: '',
      seo_keywords: '',
      seo_description: ''
    })
    
    const rules = {
      title: [
        { required: true, message: '请输入文章标题' },
        { max: 200, message: '标题长度不能超过200个字符' }
      ],
      content: [
        { required: true, message: '请输入文章内容' }
      ],
      status: [
        { required: true, message: '请选择文章状态' }
      ]
    }
    
    // 格式化内容（简单的markdown转html）
    const formatContent = (content) => {
      if (!content) return ''
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    }
    
    // 插入文本到编辑器
    const insertText = (text) => {
      if (contentEditor.value) {
        const textarea = contentEditor.value.$el.querySelector('textarea')
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const content = articleForm.content
        
        articleForm.content = content.substring(0, start) + text + content.substring(end)
        
        // 设置光标位置
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + text.length, start + text.length)
        }, 0)
      }
    }
    
    // 加载分类数据
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAll()
        
        // 🎯 响应拦截器已经解包数据
        if (Array.isArray(response)) {
          categories.value = response
        } else if (response && Array.isArray(response.data)) {
          categories.value = response.data
        } else {
          categories.value = []
        }
      } catch (error) {
        console.error('加载分类失败:', error)
        Message.error('加载分类失败')
      }
    }
    
    // 加载标签数据
    const loadTags = async () => {
      try {
        const response = await tagApi.getAll()
        
        // 🎯 响应拦截器已经解包数据
        if (Array.isArray(response)) {
          tags.value = response
        } else if (response && Array.isArray(response.data)) {
          tags.value = response.data
        } else {
          tags.value = []
        }
      } catch (error) {
        console.error('加载标签失败:', error)
        Message.error('加载标签失败')
      }
    }
    
    // 创建新标签
    const handleCreateTag = async (value) => {
      try {
        const response = await tagApi.create({
          name: value,
          status: 1
        })
        
        
        // 🎯 响应拦截器已经解包数据
        Message.success('标签创建成功')
        await loadTags()
        // 自动选中新创建的标签
        if (response && response.id && !articleForm.tag_ids.includes(response.id)) {
          articleForm.tag_ids.push(response.id)
        }
      } catch (error) {
        console.error('标签创建失败:', error)
        Message.error('标签创建失败')
      }
    }
    
    // 处理封面上传 - 使用统一的上传处理逻辑
    const handleCoverChange = (fileList, fileItem) => {
      if (fileItem.status === 'done') {
        handleUploadResponse(
          fileItem,
          (url) => {
            articleForm.cover = url
            Message.success('封面上传成功')
          },
          (error) => {
            console.error('封面上传失败:', error)
            Message.error('封面上传失败，请重试')
          }
        )
      } else if (fileItem.status === 'error') {
        Message.error('封面上传失败，请重试')
      }
    }
    
    // 加载文章详情（编辑模式）
    const loadArticleDetail = async () => {
      if (!isEdit.value) return
      
      try {
        const response = await articleApi.getDetail(route.params.id)
        // 🎯 响应拦截器已经解包数据
        if (response) {
          const data = response
          
          // 先清空tag_ids，避免之前的数据干扰
          articleForm.tag_ids = []
          
          Object.keys(articleForm).forEach(key => {
            if (data[key] !== undefined) {
              articleForm[key] = data[key]
            }
          })
          
          // 处理标签 - 确保tags是数组
          if (data.tags) {
            if (Array.isArray(data.tags) && data.tags.length > 0) {
              articleForm.tag_ids = data.tags.map(tag => tag.id)
            } else if (typeof data.tags === 'string') {
              // 如果tags是字符串，尝试解析
              try {
                const parsedTags = JSON.parse(data.tags)
                if (Array.isArray(parsedTags)) {
                  articleForm.tag_ids = parsedTags.map(tag => tag.id || tag)
                }
              } catch (e) {
                console.warn('无法解析tags字符串:', data.tags)
                articleForm.tag_ids = []
              }
            } else {
              console.warn('tags数据格式不正确:', data.tags)
              articleForm.tag_ids = []
            }
          } else {
            articleForm.tag_ids = []
          }
          
          // 处理发布时间格式
          if (data.publish_time) {
            // 如果是字符串格式，保持字符串格式
            articleForm.publish_time = data.publish_time
          }
          
          // 处理封面 - 无论是否有封面都要处理
          if (data.cover) {
            articleForm.cover = data.cover
            coverFileList.value = [{
              uid: '1',
              name: 'cover.jpg',
              url: data.cover,
              status: 'done'
            }]
          } else {
            // 确保没有封面时清空相关数据
            articleForm.cover = ''
            coverFileList.value = []
          }

        } else {
          Message.error('获取文章详情失败')
          router.push('/content/articles')
        }
      } catch (error) {
        console.error('加载文章详情失败:', error)
        Message.error('获取文章详情失败')
        router.push('/content/articles')
      }
    }
    
    // 提交表单
    const handleSubmit = async () => {
      try {
        // 手动触发表单验证
        const errors = await formRef.value?.validate()
        if (errors) {
          Message.warning('请检查表单填写是否正确')
          return
        }
        
        submitLoading.value = true
        
        const formData = { ...articleForm }
        
        // 处理时间格式
        if (formData.publish_time) {
          // 如果是dayjs对象，格式化为字符串
          if (typeof formData.publish_time === 'object' && formData.publish_time.format) {
            formData.publish_time = formData.publish_time.format('YYYY-MM-DD HH:mm:ss')
          }
          // 如果已经是字符串，保持不变
        }
        
        // 移除空值，但保留0值
        Object.keys(formData).forEach(key => {
          if (formData[key] === '' || formData[key] === undefined || formData[key] === null) {
            delete formData[key]
          }
        })

        
        let response
        if (isEdit.value) {
          response = await articleApi.update(route.params.id, formData)
        } else {
          response = await articleApi.create(formData)
        }
        
        // 🎯 响应拦截器已经解包数据
        if (response) {
          Message.success(isEdit.value ? '文章更新成功' : '文章创建成功')
          router.push('/content/articles')
        } else {
          Message.error(isEdit.value ? '文章更新失败' : '文章创建失败')
        }
      } catch (error) {
        console.error('提交失败:', error)
        Message.error(isEdit.value ? '文章更新失败' : '文章创建失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    // 预览文章
    const handlePreview = () => {
      if (!articleForm.title || !articleForm.content) {
        Message.warning('请先填写标题和内容')
        return
      }
      previewVisible.value = true
    }
    
    // 保存草稿
    const handleSaveDraft = async () => {
      if (!articleForm.title) {
        Message.warning('请先填写文章标题')
        return
      }
      
      draftLoading.value = true
      
      try {
        const formData = { ...articleForm, status: 0 }
        
        // 处理时间格式
        if (formData.publish_time) {
          // 如果是dayjs对象，格式化为字符串
          if (typeof formData.publish_time === 'object' && formData.publish_time.format) {
            formData.publish_time = formData.publish_time.format('YYYY-MM-DD HH:mm:ss')
          }
        }
        
        // 移除空值，但保留0值
        Object.keys(formData).forEach(key => {
          if (formData[key] === '' || formData[key] === undefined || formData[key] === null) {
            delete formData[key]
          }
        })

        
        const response = await articleApi.create(formData)
        
        // 🎯 响应拦截器已经解包数据
        if (response) {
          Message.success('草稿保存成功')
          router.push('/content/articles')
        } else {
          Message.error('草稿保存失败')
        }
      } catch (error) {
        console.error('保存草稿失败:', error)
        Message.error('草稿保存失败')
      } finally {
        draftLoading.value = false
      }
    }
    
    // 取消
    const handleCancel = () => {
      router.push('/content/articles')
    }
    
    onMounted(() => {
      menuStore.generateBreadcrumbs(isEdit.value ? '/content/edit-article' : '/content/add-article')
      loadCategories()
      loadTags()
      loadArticleDetail()
    })
    
    return {
      formRef,
      contentEditor,
      submitLoading,
      previewLoading,
      draftLoading,
      previewVisible,
      showCategoryModal,
      showTagModal,
      coverFileList,
      categories,
      tags,
      isEdit,
      uploadUrl,
      uploadHeaders,
      articleForm,
      rules,
      formatContent,
      insertText,
      loadCategories,
      loadTags,
      handleCreateTag,
      handleCoverChange,
      handleSubmit,
      handlePreview,
      handleSaveDraft,
      handleCancel
    }
  }
}
</script>

<style scoped>
.add-article-page {
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

.section-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.action-card {
  border-radius: 8px;
}

.editor-container {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
  min-height: 600px;
  width: 100%;
}

.editor-toolbar {
  padding: 12px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  width: 100%;
}

.content-editor {
  border: none;
  border-radius: 0;
  min-height: 500px;
  width: 100%;
}

.content-editor :deep(.arco-textarea) {
  border: none;
  box-shadow: none;
  min-height: 500px;
  width: 100% !important;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.content-editor :deep(.arco-textarea-wrapper) {
  width: 100% !important;
}

.editor-tips {
  padding: 12px;
  background: #f7f8fa;
  border-top: 1px solid #e5e6eb;
  width: 100%;
}

.cover-upload {
  width: 100%;
  border: 2px dashed #e5e6eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.cover-upload:hover {
  border-color: #165dff;
  background: #f2f3ff;
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.upload-placeholder {
  text-align: center;
  color: #86909c;
}

.upload-placeholder .arco-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.form-item-extra {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
}

.article-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.preview-header .subtitle {
  font-size: 16px;
  color: #86909c;
  margin-bottom: 16px;
}

.preview-header .meta {
  padding: 12px 0;
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 24px;
}

.preview-header .meta span {
  color: #86909c;
  font-size: 14px;
}

.preview-cover {
  margin-bottom: 24px;
}

.preview-cover img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 6px;
}

.preview-summary {
  margin-bottom: 24px;
}

.preview-summary h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.preview-summary p {
  margin: 0;
  line-height: 1.6;
  color: #4e5969;
}

.preview-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin: 16px 0 8px 0;
  color: #1d2129;
}

.preview-content :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
  color: #4e5969;
}

.preview-content :deep(pre) {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.preview-content :deep(code) {
  background: #f7f8fa;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.preview-content :deep(blockquote) {
  border-left: 4px solid #165dff;
  padding-left: 12px;
  margin: 16px 0;
  color: #86909c;
}

.preview-content :deep(li) {
  margin: 4px 0;
  list-style: disc;
  margin-left: 20px;
}

.preview-content :deep(a) {
  color: #165dff;
  text-decoration: none;
}

.preview-content :deep(a:hover) {
  text-decoration: underline;
}
</style> 