<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-description">管理您的个人信息、账户设置和 API 密钥</p>
    </div>

    <t-tabs v-model="mainTab" class="main-tabs">
      <!-- 基本信息 Tab -->
      <t-tab-panel value="info" label="基本信息">
        <div class="profile-content">
          <t-row :gutter="24">
            <!-- 左侧：个人信息 -->
            <t-col :xl="12" :lg="12" :md="24" :sm="24">
              <t-card class="profile-card">
                <template #header>
                  <h3 class="card-title">
                    <UserIcon class="card-icon" />
                    个人信息
                  </h3>
                </template>

                <div class="profile-info">
                  <!-- 头像显示 -->
                  <div class="avatar-section">
                    <div class="avatar-container">
                      <t-avatar 
                        size="120px"
                        :alt="userInfo.username"
                        class="user-avatar"
                      >
                        {{ userInfo.username?.charAt(0).toUpperCase() }}
                      </t-avatar>
                    </div>
                  </div>

                  <!-- 基本信息 -->
                  <div class="info-section">
                    <div class="info-item">
                      <span class="info-label">用户名</span>
                      <span class="info-value">{{ userInfo.username }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">邮箱</span>
                      <span class="info-value">{{ userInfo.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">角色</span>
                      <t-tag 
                        :theme="userInfo.role === 'admin' ? 'primary' : 'default'"
                        size="small"
                      >
                        {{ userInfo.role === 'admin' ? '管理员' : '用户' }}
                      </t-tag>
                    </div>
                    <div class="info-item">
                      <span class="info-label">注册时间</span>
                      <span class="info-value">{{ formatDate(userInfo.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </t-card>
            </t-col>

            <!-- 右侧：账户设置 -->
            <t-col :xl="12" :lg="12" :md="24" :sm="24">
              <t-card class="settings-card">
                <template #header>
                  <h3 class="card-title">
                    <SettingsIcon class="card-icon" />
                    账户设置
                  </h3>
                </template>

                <t-tabs v-model="activeTab" class="settings-tabs">
                  <!-- 修改密码 -->
                  <t-tab-panel value="password" label="修改密码">
                <t-form
                  ref="passwordForm"
                  :data="passwordData"
                  :rules="passwordRules"
                  layout="vertical"
                  @submit="handlePasswordSubmit"
                >
                  <t-form-item label="当前密码" name="currentPassword">
                    <t-input
                      v-model="passwordData.currentPassword"
                      type="password"
                      placeholder="请输入当前密码"
                      clearable
                    />
                  </t-form-item>
                  <t-form-item label="新密码" name="newPassword">
                    <t-input
                      v-model="passwordData.newPassword"
                      type="password"
                      placeholder="请输入新密码"
                      clearable
                    />
                  </t-form-item>
                  <t-form-item label="确认新密码" name="confirmPassword">
                    <t-input
                      v-model="passwordData.confirmPassword"
                      type="password"
                      placeholder="请再次输入新密码"
                      clearable
                    />
                  </t-form-item>
                  <div class="form-actions">
                    <t-button theme="primary" type="submit" :loading="isSubmitting">
                      修改密码
                    </t-button>
                  </div>
                </t-form>
              </t-tab-panel>

                  <!-- 个人资料 -->
                  <t-tab-panel value="profile" label="个人资料">
                    <t-form
                      ref="profileForm"
                      :data="profileData"
                      :rules="profileRules"
                      layout="vertical"
                      @submit="handleProfileSubmit"
                    >
                      <t-form-item label="邮箱" name="email">
                        <t-input
                          v-model="profileData.email"
                          type="email"
                          placeholder="请输入邮箱"
                          clearable
                        />
                      </t-form-item>
                      <div class="form-actions">
                        <t-button theme="primary" type="submit" :loading="isSubmitting">
                          保存修改
                        </t-button>
                      </div>
                    </t-form>
                  </t-tab-panel>

                </t-tabs>
              </t-card>
            </t-col>
          </t-row>
        </div>
      </t-tab-panel>

      <!-- API 密钥 Tab -->
      <t-tab-panel value="api" label="API 密钥">
        <div class="api-content">
          <t-card class="api-card">
            <template #header>
              <div class="api-card-header">
                <h3 class="card-title">
                  <KeyIcon class="card-icon" />
                  API 密钥管理
                </h3>
                <t-button theme="primary" @click="showCreateKeyDialog = true">
                  <template #icon><PlusIcon /></template>
                  创建密钥
                </t-button>
              </div>
            </template>

            <t-alert theme="info" style="margin-bottom: 16px;">
              <template #message>
                API 密钥用于通过接口上传和管理图片。请妥善保管您的密钥，不要泄露给他人。
              </template>
            </t-alert>

            <t-table
              :data="apiKeys"
              :columns="apiKeyColumns"
              :loading="loadingKeys"
              row-key="id"
              hover
              stripe
            >
              <template #permissions="{ row }">
                <t-space size="small">
                  <t-tag 
                    v-for="perm in row.permissions" 
                    :key="perm" 
                    size="small"
                    :theme="getPermissionTheme(perm)"
                  >
                    {{ getPermissionLabel(perm) }}
                  </t-tag>
                </t-space>
              </template>
              <template #is_active="{ row }">
                <t-tag :theme="row.is_active ? 'success' : 'default'" size="small">
                  {{ row.is_active ? '启用' : '禁用' }}
                </t-tag>
              </template>
              <template #last_used_at="{ row }">
                {{ row.last_used_at ? formatDateTime(row.last_used_at) : '从未使用' }}
              </template>
              <template #operation="{ row }">
                <t-space size="small">
                  <t-button 
                    theme="default" 
                    variant="text" 
                    size="small"
                    @click="toggleKeyStatus(row)"
                  >
                    {{ row.is_active ? '禁用' : '启用' }}
                  </t-button>
                  <t-popconfirm
                    content="确定要删除此 API 密钥吗？删除后无法恢复。"
                    @confirm="deleteKey(row.id)"
                  >
                    <t-button theme="danger" variant="text" size="small">删除</t-button>
                  </t-popconfirm>
                </t-space>
              </template>
            </t-table>
          </t-card>
        </div>
      </t-tab-panel>

      <!-- API 文档 Tab -->
      <t-tab-panel value="docs" label="API 文档">
        <div class="docs-content">
          <t-card class="docs-card">
            <template #header>
              <h3 class="card-title">
                <BookOpenIcon class="card-icon" />
                API 接口文档
              </h3>
            </template>

            <div class="docs-section">
              <h4>认证方式</h4>
              <p>在请求头中添加 <code>X-API-Key</code>，或在 URL 查询参数中添加 <code>api_key</code>。</p>
              <div class="code-block">
                <pre>curl -X POST "{{ apiBaseUrl }}/upload" \
  -H "X-API-Key: your_api_key" \
  -F "images=@/path/to/image.jpg"</pre>
              </div>
            </div>

            <div class="docs-section">
              <h4>权限说明</h4>
              <t-table :data="permissionDocs" :columns="permissionColumns" hover stripe />
            </div>

            <div class="docs-section">
              <h4>API 接口</h4>
              
              <t-collapse>
                <t-collapse-panel header="POST /upload - 上传图片" value="upload">
                  <p><strong>权限：</strong> upload</p>
                  <p><strong>请求方式：</strong> multipart/form-data</p>
                  <p><strong>参数：</strong></p>
                  <ul>
                    <li><code>images</code> - 图片文件（支持多文件）</li>
                    <li><code>storage_id</code> - (可选) 指定存储配置 ID</li>
                  </ul>
                  <p><strong>示例：</strong></p>
                  <div class="code-block">
                    <pre>curl -X POST "{{ apiBaseUrl }}/upload" \
  -H "X-API-Key: sk_xxxx" \
  -F "images=@image1.jpg" \
  -F "images=@image2.png"</pre>
                  </div>
                  <p><strong>响应示例：</strong></p>
                  <div class="code-block">
                    <pre>{
  "success": true,
  "code": "UPLOAD_SUCCESS",
  "message": "成功上传 2 个文件",
  "data": {
    "uploaded": [
      { "id": 1, "url": "https://...", "filename": "..." }
    ],
    "failed": []
  }
}</pre>
                  </div>
                </t-collapse-panel>

                <t-collapse-panel header="GET /images - 获取图片列表" value="images">
                  <p><strong>权限：</strong> view</p>
                  <p><strong>查询参数：</strong></p>
                  <ul>
                    <li><code>page</code> - 页码，默认 1</li>
                    <li><code>limit</code> - 每页数量，默认 20，最大 100</li>
                  </ul>
                  <p><strong>示例：</strong></p>
                  <div class="code-block">
                    <pre>curl "{{ apiBaseUrl }}/images?page=1&limit=20" \
  -H "X-API-Key: sk_xxxx"</pre>
                  </div>
                </t-collapse-panel>

                <t-collapse-panel header="GET /images/:id - 获取单张图片" value="image-detail">
                  <p><strong>权限：</strong> view</p>
                  <p><strong>示例：</strong></p>
                  <div class="code-block">
                    <pre>curl "{{ apiBaseUrl }}/images/123" \
  -H "X-API-Key: sk_xxxx"</pre>
                  </div>
                </t-collapse-panel>

                <t-collapse-panel header="DELETE /images/:id - 删除图片" value="delete">
                  <p><strong>权限：</strong> delete</p>
                  <p><strong>示例：</strong></p>
                  <div class="code-block">
                    <pre>curl -X DELETE "{{ apiBaseUrl }}/images/123" \
  -H "X-API-Key: sk_xxxx"</pre>
                  </div>
                </t-collapse-panel>

                <t-collapse-panel header="POST /images/batch-delete - 批量删除" value="batch-delete">
                  <p><strong>权限：</strong> delete</p>
                  <p><strong>请求体：</strong></p>
                  <div class="code-block">
                    <pre>{ "ids": [1, 2, 3] }</pre>
                  </div>
                  <p><strong>示例：</strong></p>
                  <div class="code-block">
                    <pre>curl -X POST "{{ apiBaseUrl }}/images/batch-delete" \
  -H "X-API-Key: sk_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3]}'</pre>
                  </div>
                </t-collapse-panel>

                <t-collapse-panel header="GET /stats - 获取统计信息" value="stats">
                  <p><strong>权限：</strong> view</p>
                  <p><strong>示例：</strong></p>
                  <div class="code-block">
                    <pre>curl "{{ apiBaseUrl }}/stats" \
  -H "X-API-Key: sk_xxxx"</pre>
                  </div>
                </t-collapse-panel>
              </t-collapse>
            </div>

            <div class="docs-section">
              <h4>错误码说明</h4>
              <t-table :data="errorCodeDocs" :columns="errorCodeColumns" hover stripe />
            </div>
          </t-card>
        </div>
      </t-tab-panel>
    </t-tabs>

    <!-- 创建 API 密钥对话框 -->
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
        <t-form-item label="权限">
          <t-checkbox-group v-model="newKeyData.permissions">
            <t-checkbox value="upload">上传图片</t-checkbox>
            <t-checkbox value="view">查看图片</t-checkbox>
            <t-checkbox value="delete">删除图片</t-checkbox>
            <t-checkbox value="all">所有权限</t-checkbox>
          </t-checkbox-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 显示新创建的密钥对话框 -->
    <t-dialog
      v-model:visible="showNewKeyDialog"
      header="API 密钥创建成功"
      :footer="false"
      width="600px"
    >
      <t-alert theme="warning" style="margin-bottom: 16px;">
        <template #message>
          请立即复制并妥善保存此密钥，关闭对话框后将无法再次查看完整密钥！
        </template>
      </t-alert>
      <div class="new-key-display">
        <t-input v-model="newCreatedKey" readonly>
          <template #suffix>
            <t-button variant="text" @click="copyKey(newCreatedKey)">
              <CopyIcon style="width: 16px; height: 16px;" />
            </t-button>
          </template>
        </t-input>
      </div>
      <div style="margin-top: 16px; text-align: right;">
        <t-button theme="primary" @click="showNewKeyDialog = false">我已保存</t-button>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  UserIcon,
  SettingsIcon,
  KeyIcon,
  PlusIcon,
  BookOpenIcon,
  CopyIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuth } from '@/composables/useAuth'
import { apiService } from '@/services/api'

const { user } = useAuth()

// 响应式数据
const mainTab = ref('info')
const activeTab = ref('password')
const isSubmitting = ref(false)

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

// API 基础 URL
const apiBaseUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin + '/api'
  return baseUrl.replace('/api', '/api/v1')
})

// API 密钥表格列
const apiKeyColumns = [
  { colKey: 'name', title: '名称', width: 150 },
  { colKey: 'api_key', title: '密钥', width: 200 },
  { colKey: 'permissions', title: '权限', width: 200 },
  { colKey: 'is_active', title: '状态', width: 80 },
  { colKey: 'last_used_at', title: '最后使用', width: 150 },
  { colKey: 'operation', title: '操作', width: 120 }
]

// 权限文档数据
const permissionDocs = [
  { name: 'upload', description: '上传图片权限' },
  { name: 'view', description: '查看图片列表和详情权限' },
  { name: 'delete', description: '删除图片权限' },
  { name: 'manage', description: '管理图片权限（更新信息等）' },
  { name: 'all', description: '所有权限' }
]
const permissionColumns = [
  { colKey: 'name', title: '权限标识' },
  { colKey: 'description', title: '说明' }
]

// 错误码文档数据
const errorCodeDocs = [
  { code: 'NO_API_KEY', message: '未提供 API 密钥' },
  { code: 'INVALID_API_KEY', message: 'API 密钥无效或已被禁用' },
  { code: 'API_KEY_EXPIRED', message: 'API 密钥已过期' },
  { code: 'PERMISSION_DENIED', message: '权限不足' },
  { code: 'NOT_FOUND', message: '资源不存在' },
  { code: 'FORBIDDEN', message: '无权访问此资源' }
]
const errorCodeColumns = [
  { colKey: 'code', title: '错误码' },
  { colKey: 'message', title: '说明' }
]

// 获取权限标签
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

// 获取权限主题色
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

// 加载 API 密钥列表
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

// 创建 API 密钥
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
      MessagePlugin.success('API 密钥创建成功')
      newCreatedKey.value = response.data.api_key
      showCreateKeyDialog.value = false
      showNewKeyDialog.value = true
      
      // 重置表单
      newKeyData.name = ''
      newKeyData.permissions = ['upload', 'view']
      
      // 刷新列表
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

// 切换密钥状态
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

// 复制密钥
const copyKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key)
    MessagePlugin.success('已复制到剪贴板')
  } catch (error) {
    MessagePlugin.error('复制失败')
  }
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 用户信息
const userInfo = reactive({
  username: '',
  email: '',
  role: '',
  createdAt: ''
})


// 密码修改表单
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度至少6位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: (val: string) => {
        return val === passwordData.newPassword
      },
      message: '两次输入的密码不一致'
    }
  ]
}

// 个人资料表单
const profileData = reactive({
  email: ''
})

const profileRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ]
}

// 方法
const loadUserInfo = async () => {
  try {
    const response = await apiService.getUserProfile()
    if (response.success && response.data) {
      Object.assign(userInfo, response.data)
      profileData.email = response.data.email
    }
  } catch (error) {

    MessagePlugin.error('加载用户信息失败')
  }
}


const handlePasswordSubmit = async () => {
  isSubmitting.value = true
  try {
    const response = await apiService.changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    )
    if (response.success) {
      MessagePlugin.success('密码修改成功')
      // 清空表单
      Object.assign(passwordData, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } else {
      MessagePlugin.error(response.message || '密码修改失败')
    }
  } catch (error: any) {

    MessagePlugin.error(error.message || '密码修改失败')
  } finally {
    isSubmitting.value = false
  }
}

const handleProfileSubmit = async () => {
  isSubmitting.value = true
  try {
    const response = await apiService.updateProfile({
      email: profileData.email
    })
    if (response.success) {
      MessagePlugin.success('个人资料更新成功')
      await loadUserInfo()
    } else {
      MessagePlugin.error(response.message || '更新失败')
    }
  } catch (error: any) {

    MessagePlugin.error(error.message || '更新失败')
  } finally {
    isSubmitting.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}


// 生命周期
onMounted(() => {
  if (user.value) {
    Object.assign(userInfo, user.value)
    profileData.email = user.value.email
  }
  loadUserInfo()
  loadApiKeys()
})
</script>

<style scoped>
.profile-page {
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

.main-tabs {
  margin-bottom: 24px;
}

.profile-content,
.api-content,
.docs-content {
  margin-bottom: 24px;
}

.profile-card,
.settings-card,
.api-card,
.docs-card {
  margin-bottom: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
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

.api-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 头像部分 */
.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-container {
  display: inline-block;
  position: relative;
}

.user-avatar {
  margin-bottom: 12px;
}

.avatar-upload-btn {
  display: block;
  margin: 0 auto;
}

/* 信息部分 */
.info-section {
  space-y: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: var(--td-text-color-secondary);
  min-width: 80px;
}

.info-value {
  color: var(--td-text-color-primary);
  text-align: right;
}

/* 表单样式 */
.form-actions {
  margin-top: 24px;
  text-align: right;
}

.settings-tabs {
  margin-top: 0;
}

/* API 文档样式 */
.docs-section {
  margin-bottom: 32px;
}

.docs-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.docs-section p {
  margin: 8px 0;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
}

.docs-section code {
  background: var(--td-bg-color-component);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: var(--td-brand-color);
}

.docs-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.docs-section li {
  margin: 4px 0;
  color: var(--td-text-color-secondary);
}

.code-block {
  background: var(--td-bg-color-component);
  border-radius: 6px;
  padding: 12px 16px;
  margin: 12px 0;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--td-text-color-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

.new-key-display {
  margin: 16px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-value {
    text-align: left;
  }

  .api-card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
