<template>
  <div class="api-page">
    <div class="page-header">
      <h1 class="page-title">API 管理</h1>
      <p class="page-description">创建和管理 API 密钥，通过接口上传和管理图片</p>
    </div>

    <t-row :gutter="24">
      <!-- 左侧：API 密钥管理 -->
      <t-col :xl="12" :lg="12" :md="24" :sm="24">
        <t-card class="api-card">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">
                <KeyIcon class="card-icon" />
                我的 API 密钥
              </h3>
              <t-button theme="primary" size="small" @click="showCreateKeyDialog = true">
                <template #icon><PlusIcon /></template>
                创建密钥
              </t-button>
            </div>
          </template>

          <t-alert theme="info" style="margin-bottom: 16px;">
            <template #message>
              API 密钥用于通过接口上传和管理图片，请妥善保管，不要泄露给他人。
            </template>
          </t-alert>

          <div v-if="loadingKeys" class="loading-container">
            <t-loading />
          </div>

          <div v-else-if="apiKeys.length === 0" class="empty-container">
            <t-empty description="暂无 API 密钥">
              <t-button theme="primary" @click="showCreateKeyDialog = true">
                创建第一个密钥
              </t-button>
            </t-empty>
          </div>

          <div v-else class="key-list">
            <div v-for="key in apiKeys" :key="key.id" class="key-item">
              <div class="key-info">
                <div class="key-name">{{ key.name }}</div>
                <div class="key-value">{{ key.api_key }}</div>
                <div class="key-meta">
                  <t-space size="small">
                    <t-tag 
                      v-for="perm in key.permissions" 
                      :key="perm" 
                      size="small"
                      :theme="getPermissionTheme(perm)"
                    >
                      {{ getPermissionLabel(perm) }}
                    </t-tag>
                  </t-space>
                  <span class="key-time">
                    {{ key.last_used_at ? `最后使用: ${formatDateTime(key.last_used_at)}` : '从未使用' }}
                  </span>
                </div>
              </div>
              <div class="key-actions">
                <t-tag :theme="key.is_active ? 'success' : 'default'" size="small">
                  {{ key.is_active ? '启用' : '禁用' }}
                </t-tag>
                <t-button 
                  variant="text" 
                  size="small"
                  @click="toggleKeyStatus(key)"
                >
                  {{ key.is_active ? '禁用' : '启用' }}
                </t-button>
                <t-popconfirm
                  content="确定要删除此密钥吗？"
                  @confirm="deleteKey(key.id)"
                >
                  <t-button theme="danger" variant="text" size="small">删除</t-button>
                </t-popconfirm>
              </div>
            </div>
          </div>
        </t-card>
      </t-col>

      <!-- 右侧：快速开始 -->
      <t-col :xl="12" :lg="12" :md="24" :sm="24">
        <t-card class="quick-start-card">
          <template #header>
            <h3 class="card-title">
              <ZapIcon class="card-icon" />
              快速开始
            </h3>
          </template>

          <div class="quick-section">
            <h4>1. 创建 API 密钥</h4>
            <p>点击左侧"创建密钥"按钮，设置名称和权限后获取密钥。</p>
          </div>

          <div class="quick-section">
            <h4>2. 上传图片</h4>
            <div class="code-block">
              <pre>curl -X POST "{{ apiBaseUrl }}/upload" \
  -H "X-API-Key: 你的密钥" \
  -F "images=@/path/to/image.jpg"</pre>
            </div>
          </div>

          <div class="quick-section">
            <h4>3. 获取图片列表</h4>
            <div class="code-block">
              <pre>curl "{{ apiBaseUrl }}/images" \
  -H "X-API-Key: 你的密钥"</pre>
            </div>
          </div>

          <div class="quick-section">
            <h4>4. 删除图片</h4>
            <div class="code-block">
              <pre>curl -X DELETE "{{ apiBaseUrl }}/images/图片ID" \
  -H "X-API-Key: 你的密钥"</pre>
            </div>
          </div>
        </t-card>
      </t-col>
    </t-row>

    <!-- API 文档 -->
    <t-card class="docs-card">
      <template #header>
        <h3 class="card-title">
          <BookOpenIcon class="card-icon" />
          API 接口文档
        </h3>
      </template>

      <t-tabs v-model="docsTab">
        <t-tab-panel value="auth" label="认证方式">
          <div class="docs-content">
            <h4>请求头认证（推荐）</h4>
            <p>在 HTTP 请求头中添加 <code>X-API-Key</code> 字段：</p>
            <div class="code-block">
              <pre>curl -H "X-API-Key: sk_xxxxxxxxxxxxxxxx" {{ apiBaseUrl }}/images</pre>
            </div>

            <h4>URL 参数认证</h4>
            <p>在 URL 查询参数中添加 <code>api_key</code>：</p>
            <div class="code-block">
              <pre>{{ apiBaseUrl }}/images?api_key=sk_xxxxxxxxxxxxxxxx</pre>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="upload" label="上传图片">
          <div class="docs-content">
            <div class="endpoint-header">
              <t-tag theme="success">POST</t-tag>
              <code>/upload</code>
              <t-tag size="small">需要 upload 权限</t-tag>
            </div>

            <h4>请求参数</h4>
            <t-table :data="uploadParams" :columns="paramColumns" hover stripe size="small" />

            <h4>请求示例</h4>
            <div class="code-block">
              <pre>curl -X POST "{{ apiBaseUrl }}/upload" \
  -H "X-API-Key: sk_xxxx" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png"</pre>
            </div>

            <h4>响应示例</h4>
            <div class="code-block">
              <pre>{
  "success": true,
  "code": "UPLOAD_SUCCESS",
  "message": "成功上传 2 个文件",
  "data": {
    "uploaded": [
      {
        "id": 123,
        "filename": "1709389200_abc123.jpg",
        "original_name": "photo1.jpg",
        "url": "https://your-cdn.com/xxx.jpg",
        "size": 102400,
        "mime_type": "image/jpeg"
      }
    ],
    "failed": []
  }
}</pre>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="list" label="图片列表">
          <div class="docs-content">
            <div class="endpoint-header">
              <t-tag theme="primary">GET</t-tag>
              <code>/images</code>
              <t-tag size="small">需要 view 权限</t-tag>
            </div>

            <h4>查询参数</h4>
            <t-table :data="listParams" :columns="paramColumns" hover stripe size="small" />

            <h4>请求示例</h4>
            <div class="code-block">
              <pre>curl "{{ apiBaseUrl }}/images?page=1&limit=20" \
  -H "X-API-Key: sk_xxxx"</pre>
            </div>

            <h4>响应示例</h4>
            <div class="code-block">
              <pre>{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "images": [
      {
        "id": 123,
        "filename": "xxx.jpg",
        "url": "https://...",
        "size": 102400,
        "created_at": "2024-03-02T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}</pre>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="delete" label="删除图片">
          <div class="docs-content">
            <div class="endpoint-header">
              <t-tag theme="danger">DELETE</t-tag>
              <code>/images/:id</code>
              <t-tag size="small">需要 delete 权限</t-tag>
            </div>

            <h4>请求示例</h4>
            <div class="code-block">
              <pre>curl -X DELETE "{{ apiBaseUrl }}/images/123" \
  -H "X-API-Key: sk_xxxx"</pre>
            </div>

            <h4>批量删除</h4>
            <div class="endpoint-header">
              <t-tag theme="danger">POST</t-tag>
              <code>/images/batch-delete</code>
            </div>
            <div class="code-block">
              <pre>curl -X POST "{{ apiBaseUrl }}/images/batch-delete" \
  -H "X-API-Key: sk_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3]}'</pre>
            </div>
          </div>
        </t-tab-panel>

        <t-tab-panel value="errors" label="错误码">
          <div class="docs-content">
            <t-table :data="errorCodes" :columns="errorColumns" hover stripe size="small" />
          </div>
        </t-tab-panel>
      </t-tabs>
    </t-card>

    <!-- 创建密钥对话框 -->
    <t-dialog
      v-model:visible="showCreateKeyDialog"
      header="创建 API 密钥"
      :confirm-btn="{ content: '创建', loading: creatingKey }"
      @confirm="createApiKey"
    >
      <t-form :data="newKeyData" layout="vertical">
        <t-form-item label="密钥名称" required>
          <t-input v-model="newKeyData.name" placeholder="例如：博客上传、自动备份" />
        </t-form-item>
        <t-form-item label="权限设置">
          <t-checkbox-group v-model="newKeyData.permissions">
            <t-checkbox value="upload">上传图片</t-checkbox>
            <t-checkbox value="view">查看图片</t-checkbox>
            <t-checkbox value="delete">删除图片</t-checkbox>
            <t-checkbox value="all">所有权限</t-checkbox>
          </t-checkbox-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 新密钥展示对话框 -->
    <t-dialog
      v-model:visible="showNewKeyDialog"
      header="密钥创建成功"
      :footer="false"
      width="550px"
    >
      <t-alert theme="warning" style="margin-bottom: 16px;">
        <template #message>
          请立即复制并保存此密钥，关闭后将无法再次查看完整密钥！
        </template>
      </t-alert>
      <div class="new-key-display">
        <t-input v-model="newCreatedKey" readonly size="large">
          <template #suffix>
            <t-button variant="text" @click="copyKey(newCreatedKey)">
              <CopyIcon style="width: 18px; height: 18px;" />
            </t-button>
          </template>
        </t-input>
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <t-button theme="primary" @click="showNewKeyDialog = false">我已保存</t-button>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  KeyIcon,
  PlusIcon,
  BookOpenIcon,
  CopyIcon,
  ZapIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

// API 密钥相关
const apiKeys = ref<any[]>([])
const loadingKeys = ref(false)
const showCreateKeyDialog = ref(false)
const showNewKeyDialog = ref(false)
const creatingKey = ref(false)
const newCreatedKey = ref('')
const newKeyData = reactive({
  name: '',
  permissions: ['upload', 'view']
})

// 文档 Tab
const docsTab = ref('auth')

// API 基础 URL
const apiBaseUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin + '/api'
  return baseUrl.replace('/api', '/api/v1')
})

// 参数表格列
const paramColumns = [
  { colKey: 'name', title: '参数', width: 120 },
  { colKey: 'type', title: '类型', width: 80 },
  { colKey: 'required', title: '必填', width: 60 },
  { colKey: 'description', title: '说明' }
]

// 上传接口参数
const uploadParams = [
  { name: 'images', type: 'File', required: '是', description: '图片文件，支持多个' },
  { name: 'storage_id', type: 'String', required: '否', description: '指定存储配置 ID' }
]

// 列表接口参数
const listParams = [
  { name: 'page', type: 'Number', required: '否', description: '页码，默认 1' },
  { name: 'limit', type: 'Number', required: '否', description: '每页数量，默认 20，最大 100' }
]

// 错误码表格
const errorColumns = [
  { colKey: 'code', title: '错误码', width: 180 },
  { colKey: 'message', title: '说明' }
]

const errorCodes = [
  { code: 'NO_API_KEY', message: '未提供 API 密钥' },
  { code: 'INVALID_API_KEY', message: 'API 密钥无效或已被禁用' },
  { code: 'API_KEY_EXPIRED', message: 'API 密钥已过期' },
  { code: 'PERMISSION_DENIED', message: '此密钥没有对应操作的权限' },
  { code: 'NOT_FOUND', message: '请求的资源不存在' },
  { code: 'FORBIDDEN', message: '无权访问此资源（非本人图片）' },
  { code: 'UPLOAD_ERROR', message: '上传过程发生错误' },
  { code: 'NO_FILES', message: '未上传任何文件' }
]

// 权限相关
const getPermissionLabel = (perm: string) => {
  const labels: Record<string, string> = {
    upload: '上传',
    view: '查看',
    delete: '删除',
    manage: '管理',
    all: '全部'
  }
  return labels[perm] || perm
}

const getPermissionTheme = (perm: string) => {
  const themes: Record<string, string> = {
    upload: 'primary',
    view: 'default',
    delete: 'danger',
    manage: 'warning',
    all: 'success'
  }
  return themes[perm] || 'default'
}

// 加载 API 密钥
const loadApiKeys = async () => {
  loadingKeys.value = true
  try {
    const response = await apiService.getApiKeys()
    if (response.success) {
      apiKeys.value = response.data || []
    }
  } catch (error) {
    console.error('加载 API 密钥失败:', error)
  } finally {
    loadingKeys.value = false
  }
}

// 创建密钥
const createApiKey = async () => {
  if (!newKeyData.name.trim()) {
    MessagePlugin.warning('请输入密钥名称')
    return
  }
  if (newKeyData.permissions.length === 0) {
    MessagePlugin.warning('请至少选择一个权限')
    return
  }

  creatingKey.value = true
  try {
    const response = await apiService.createApiKey({
      name: newKeyData.name.trim(),
      permissions: newKeyData.permissions
    })
    
    if (response.success && response.data) {
      MessagePlugin.success('密钥创建成功')
      newCreatedKey.value = response.data.api_key
      showCreateKeyDialog.value = false
      showNewKeyDialog.value = true
      
      newKeyData.name = ''
      newKeyData.permissions = ['upload', 'view']
      
      await loadApiKeys()
    } else {
      MessagePlugin.error(response.message || '创建失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '创建失败')
  } finally {
    creatingKey.value = false
  }
}

// 切换状态
const toggleKeyStatus = async (key: any) => {
  try {
    const response = await apiService.toggleApiKey(key.id.toString())
    if (response.success) {
      MessagePlugin.success(response.message || '状态已更新')
      await loadApiKeys()
    } else {
      MessagePlugin.error(response.message || '操作失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '操作失败')
  }
}

// 删除密钥
const deleteKey = async (id: number) => {
  try {
    const response = await apiService.deleteApiKey(id.toString())
    if (response.success) {
      MessagePlugin.success('密钥已删除')
      await loadApiKeys()
    } else {
      MessagePlugin.error(response.message || '删除失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

// 复制
const copyKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key)
    MessagePlugin.success('已复制到剪贴板')
  } catch (error) {
    MessagePlugin.error('复制失败')
  }
}

// 格式化时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  loadApiKeys()
})
</script>

<style scoped>
.api-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-top: 30px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.api-card,
.quick-start-card {
  margin-bottom: 24px;
}

.docs-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0;
}

.card-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: var(--td-brand-color);
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

/* 密钥列表 */
.key-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.key-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: var(--td-bg-color-component);
  border-radius: 8px;
  border: 1px solid var(--td-border-level-1-color);
}

.key-info {
  flex: 1;
  min-width: 0;
}

.key-name {
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
}

.key-value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
  word-break: break-all;
}

.key-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.key-time {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.key-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* 快速开始 */
.quick-section {
  margin-bottom: 20px;
}

.quick-section:last-child {
  margin-bottom: 0;
}

.quick-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.quick-section p {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  margin: 0 0 8px 0;
}

/* 代码块 */
.code-block {
  background: var(--td-bg-color-page);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 6px;
  padding: 12px 16px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--td-text-color-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

/* 文档内容 */
.docs-content {
  padding: 16px 0;
}

.docs-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 20px 0 12px 0;
}

.docs-content h4:first-child {
  margin-top: 0;
}

.docs-content p {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 8px 0;
  line-height: 1.6;
}

.docs-content code {
  background: var(--td-bg-color-component);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: var(--td-brand-color);
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--td-bg-color-component);
  border-radius: 6px;
}

.endpoint-header code {
  font-size: 14px;
  font-weight: 500;
  background: none;
  padding: 0;
}

.new-key-display {
  margin: 16px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .key-item {
    flex-direction: column;
    gap: 12px;
  }

  .key-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
