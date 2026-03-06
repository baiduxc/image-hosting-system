<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-title">
        <h1>用户组管理</h1>
        <p class="subtitle">管理用户组和升级密钥</p>
      </div>
      <div class="header-actions">
        <t-button theme="primary" @click="openCreateGroupDialog">
          <template #icon><PlusIcon :size="16" /></template>
          创建用户组
        </t-button>
        <t-button theme="default" @click="openGenerateKeyDialog">
          <template #icon><KeyIcon :size="16" /></template>
          生成密钥
        </t-button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-box">
        <span class="stat-num">{{ stats.groupCount }}</span>
        <span class="stat-label">用户组</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">{{ stats.keyCount }}</span>
        <span class="stat-label">密钥总数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">{{ stats.usedKeyCount }}</span>
        <span class="stat-label">已使用</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">{{ stats.availableKeyCount }}</span>
        <span class="stat-label">可用密钥</span>
      </div>
    </div>

    <!-- Tabs -->
    <t-tabs v-model="activeTab" class="tabs-container">
      <t-tab-panel value="groups" label="用户组">
        <!-- Groups Table -->
        <div class="table-card">
          <t-table
            :data="groupList"
            :columns="groupColumns"
            row-key="id"
            size="medium"
            :loading="loadingGroups"
          >
            <template #limits="{ row }">
              <div class="limits-cell">
                <div class="limit-item">
                  <span class="limit-label">日限:</span>
                  <span class="limit-value">{{ row.daily_upload_limit }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">周限:</span>
                  <span class="limit-value">{{ row.weekly_upload_limit }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">月限:</span>
                  <span class="limit-value">{{ row.monthly_upload_limit }}</span>
                </div>
              </div>
            </template>

            <template #otherLimits="{ row }">
              <div class="limits-cell">
                <div class="limit-item">
                  <span class="limit-label">单文件:</span>
                  <span class="limit-value">{{ row.max_file_size }}MB</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">并发:</span>
                  <span class="limit-value">{{ row.concurrent_uploads }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">空间:</span>
                  <span class="limit-value">{{ row.storage_space }}MB</span>
                </div>
              </div>
            </template>

            <template #is_default="{ row }">
              <t-tag v-if="row.is_default" theme="primary" size="small">默认</t-tag>
              <span v-else class="text-gray">-</span>
            </template>

            <template #userCount="{ row }">
              <span class="count-text">{{ row.userCount || 0 }}</span>
            </template>

            <template #operation="{ row }">
              <div class="operation-btns">
                <t-button variant="text" size="small" @click="openEditGroupDialog(row)">
                  <EditIcon :size="14" />
                </t-button>
                <t-popconfirm 
                  :content="`确定删除用户组「${row.name}」？相关用户将迁移到默认组。`"
                  @confirm="deleteGroup(row.id)"
                >
                  <t-button theme="danger" variant="text" size="small" :disabled="row.is_default">
                    <TrashIcon :size="14" />
                  </t-button>
                </t-popconfirm>
              </div>
            </template>
          </t-table>
        </div>
      </t-tab-panel>

      <t-tab-panel value="keys" label="升级密钥">
        <!-- Keys Table -->
        <div class="table-card">
          <div class="table-header">
            <div class="filter-box">
              <t-select v-model="keyFilter.group_id" placeholder="全部用户组" clearable @change="loadKeys">
                <t-option v-for="group in groupList" :key="group.id" :label="group.name" :value="group.id" />
              </t-select>
              <t-select v-model="keyFilter.is_used" placeholder="全部状态" clearable @change="loadKeys">
                <t-option label="未使用" value="false" />
                <t-option label="已使用" value="true" />
              </t-select>
            </div>
            <t-button theme="default" variant="outline" @click="loadKeys">
              <template #icon><RefreshCwIcon :size="16" /></template>
              刷新
            </t-button>
          </div>

          <t-table
            :data="keyList"
            :columns="keyColumns"
            row-key="id"
            size="medium"
            :loading="loadingKeys"
            :pagination="keyPagination"
            @page-change="handleKeyPageChange"
          >
            <template #key="{ row }">
              <div class="key-cell">
                <code class="key-code">{{ row.key }}</code>
                <t-button variant="text" size="small" @click="copyKey(row.key)">
                  <CopyIcon :size="14" />
                </t-button>
              </div>
            </template>

            <template #group_name="{ row }">
              <t-tag size="small">{{ row.group_name }}</t-tag>
            </template>

            <template #is_used="{ row }">
              <t-tag v-if="row.is_used" theme="success" size="small">已使用</t-tag>
              <t-tag v-else theme="warning" variant="light" size="small">未使用</t-tag>
            </template>

            <template #used_info="{ row }">
              <span v-if="row.used_by_username" class="used-info">
                {{ row.used_by_username }}<br>
                <small>{{ formatDateTime(row.used_at) }}</small>
              </span>
              <span v-else class="text-gray">-</span>
            </template>

            <template #expires_at="{ row }">
              <span :class="{ 'text-danger': isExpired(row) }">
                {{ row.expires_at ? formatDate(row.expires_at) : '永不过期' }}
              </span>
            </template>

            <template #created_at="{ row }">
              <span class="time-text">{{ formatDate(row.created_at) }}</span>
            </template>

            <template #operation="{ row }">
              <div class="operation-btns">
                <t-popconfirm content="确定删除此密钥？" @confirm="deleteKey(row.id)">
                  <t-button theme="danger" variant="text" size="small">
                    <TrashIcon :size="14" />
                  </t-button>
                </t-popconfirm>
              </div>
            </template>
          </t-table>
        </div>
      </t-tab-panel>
    </t-tabs>

    <!-- Create/Edit Group Dialog -->
    <t-dialog
      v-model:visible="groupDialog.visible"
      :header="groupDialog.isEdit ? '编辑用户组' : '创建用户组'"
      width="500px"
      :confirm-btn="{ loading: groupDialog.saving, content: '保存' }"
      @confirm="saveGroup"
    >
      <t-form :data="groupDialog.form" layout="vertical">
        <t-form-item label="组名" name="name">
          <t-input v-model="groupDialog.form.name" placeholder="请输入用户组名称" />
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="groupDialog.form.description" placeholder="请输入描述" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
        <t-form-item label="上传限制（张）" name="upload_limits">
          <div class="limit-inputs">
            <div class="limit-input-item">
              <t-input v-model="groupDialog.form.daily_upload_limit" />
              <span class="limit-label">日</span>
            </div>
            <div class="limit-input-item">
              <t-input v-model="groupDialog.form.weekly_upload_limit" />
              <span class="limit-label">周</span>
            </div>
            <div class="limit-input-item">
              <t-input v-model="groupDialog.form.monthly_upload_limit" />
              <span class="limit-label">月</span>
            </div>
          </div>
        </t-form-item>
        <t-form-item label="最大文件大小" name="max_file_size">
          <t-input v-model="groupDialog.form.max_file_size" placeholder="请输入最大文件大小，单位MB" suffix="MB" />
        </t-form-item>
        <t-form-item label="存储空间" name="storage_space">
          <t-input v-model="groupDialog.form.storage_space" placeholder="请输入存储空间，单位MB" suffix="MB" />
        </t-form-item>
        <t-form-item label="并发上传数" name="concurrent_uploads">
          <t-input v-model="groupDialog.form.concurrent_uploads" placeholder="请输入并发上传数" suffix="个" />
        </t-form-item>
        <t-form-item label="设为默认">
          <t-switch v-model="groupDialog.form.is_default" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- Generate Keys Dialog -->
    <t-dialog
      v-model:visible="keyDialog.visible"
      header="生成升级密钥"
      width="400px"
      :confirm-btn="{ loading: keyDialog.saving, content: '生成' }"
      @confirm="generateKeys"
    >
      <t-form :data="keyDialog.form" layout="vertical">
        <t-form-item label="选择用户组" name="group_id">
          <t-select v-model="keyDialog.form.group_id" placeholder="请选择用户组">
            <t-option v-for="group in groupList" :key="group.id" :label="group.name" :value="group.id" />
          </t-select>
        </t-form-item>
        <t-form-item label="生成数量" name="count">
          <t-input-number v-model="keyDialog.form.count" :min="1" :max="100" suffix="个" />
        </t-form-item>
        <t-form-item label="有效期至" name="expires_at">
          <t-date-picker v-model="keyDialog.form.expires_at" placeholder="可选，不选则永不过期" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- Generated Keys Result -->
    <t-dialog
      v-model:visible="generatedKeysDialog.visible"
      header="生成的密钥"
      width="500px"
      :confirm-btn="{ content: '复制全部' }"
      :cancel-btn="{ content: '关闭' }"
      @confirm="copyAllKeys"
      @cancel="generatedKeysDialog.visible = false"
    >
      <div class="generated-keys">
        <t-alert theme="success" message="请妥善保存以下密钥，它们只会显示一次！" />
        <div class="keys-list">
          <div v-for="(key, index) in generatedKeysDialog.keys" :key="index" class="key-item">
            <code>{{ key }}</code>
            <t-button variant="text" size="small" @click="copyKey(key)">
              <CopyIcon :size="14" />
            </t-button>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  PlusIcon, KeyIcon, EditIcon, TrashIcon, RefreshCwIcon, CopyIcon 
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const activeTab = ref('groups')

// 统计
const stats = reactive({
  groupCount: 0,
  keyCount: 0,
  usedKeyCount: 0,
  availableKeyCount: 0
})

// 用户组表格
const groupList = ref<any[]>([])
const loadingGroups = ref(false)
const groupColumns = [
  { colKey: 'name', title: '用户组', width: 150 },
  { colKey: 'description', title: '描述', width: 200, ellipsis: true },
  { colKey: 'limits', title: '上传限制', width: 180 },
  { colKey: 'otherLimits', title: '其他限制', width: 140 },
  { colKey: 'is_default', title: '默认', width: 80, align: 'center' },
  { colKey: 'userCount', title: '用户数', width: 80, align: 'center' },
  { colKey: 'operation', title: '操作', width: 100, align: 'center' }
]

// 密钥表格
const keyList = ref<any[]>([])
const loadingKeys = ref(false)
const keyFilter = reactive({
  group_id: undefined as number | undefined,
  is_used: undefined as string | undefined
})
const keyPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})
const keyColumns = [
  { colKey: 'key', title: '密钥', width: 240 },
  { colKey: 'group_name', title: '用户组', width: 120 },
  { colKey: 'is_used', title: '状态', width: 80, align: 'center' },
  { colKey: 'used_info', title: '使用信息', width: 150 },
  { colKey: 'expires_at', title: '有效期', width: 120 },
  { colKey: 'created_at', title: '创建时间', width: 120 },
  { colKey: 'operation', title: '操作', width: 80, align: 'center' }
]

// 用户组对话框
const groupDialog = reactive({
  visible: false,
  isEdit: false,
  saving: false,
  form: {
    id: null as number | null,
    name: '',
    description: '',
    daily_upload_limit: 50,
    weekly_upload_limit: 300,
    monthly_upload_limit: 1000,
    max_file_size: 10,
    concurrent_uploads: 3,
    storage_space: 100,
    is_default: false
  }
})

// 密钥对话框
const keyDialog = reactive({
  visible: false,
  saving: false,
  form: {
    group_id: undefined as number | undefined,
    count: 1,
    expires_at: ''
  }
})

// 生成密钥结果对话框
const generatedKeysDialog = reactive({
  visible: false,
  keys: [] as string[]
})

// 加载用户组列表
const loadGroups = async () => {
  loadingGroups.value = true
  try {
    const res = await apiService.getUserGroups()
    if (res.success) {
      groupList.value = res.data || []
      stats.groupCount = groupList.value.length
    }
  } catch (error) {
    console.error('加载用户组失败:', error)
    MessagePlugin.error('加载用户组失败')
  } finally {
    loadingGroups.value = false
  }
}

// 加载密钥列表
const loadKeys = async () => {
  loadingKeys.value = true
  try {
    const res = await apiService.getUserGroupKeys({
      page: keyPagination.current,
      limit: keyPagination.pageSize,
      group_id: keyFilter.group_id,
      is_used: keyFilter.is_used
    })
    if (res.success) {
      keyList.value = res.data?.list || []
      keyPagination.total = res.data?.pagination?.total || 0
      
      // 更新统计
      stats.keyCount = keyPagination.total
      stats.usedKeyCount = keyList.value.filter(k => k.is_used).length
      stats.availableKeyCount = keyList.value.filter(k => !k.is_used).length
    }
  } catch (error) {
    console.error('加载密钥列表失败:', error)
    MessagePlugin.error('加载密钥列表失败')
  } finally {
    loadingKeys.value = false
  }
}

// 加载统计
const loadStats = async () => {
  try {
    const keysRes = await apiService.getUserGroupKeys({ page: 1, limit: 1 })
    if (keysRes.success) {
      stats.keyCount = keysRes.data?.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 打开创建用户组对话框
const openCreateGroupDialog = () => {
  groupDialog.isEdit = false
  groupDialog.form = {
    id: null,
    name: '',
    description: '',
    daily_upload_limit: 50,
    weekly_upload_limit: 300,
    monthly_upload_limit: 1000,
    max_file_size: 10,
    concurrent_uploads: 3,
    storage_space: 100,
    is_default: false
  }
  groupDialog.visible = true
}

// 打开编辑用户组对话框
const openEditGroupDialog = (row: any) => {
  groupDialog.isEdit = true
  groupDialog.form = {
    id: row.id,
    name: row.name,
    description: row.description || '',
    daily_upload_limit: row.daily_upload_limit,
    weekly_upload_limit: row.weekly_upload_limit,
    monthly_upload_limit: row.monthly_upload_limit,
    max_file_size: row.max_file_size,
    concurrent_uploads: row.concurrent_uploads,
    storage_space: row.storage_space || 100,
    is_default: !!row.is_default
  }
  groupDialog.visible = true
}

// 保存用户组
const saveGroup = async () => {
  if (!groupDialog.form.name) {
    MessagePlugin.warning('请输入用户组名称')
    return
  }
  
  groupDialog.saving = true
  try {
    // 转换数字字段（排除 id）
    const { id, ...formDataWithoutId } = groupDialog.form
    const formData = {
      ...formDataWithoutId,
      daily_upload_limit: parseInt(groupDialog.form.daily_upload_limit as any) || 0,
      weekly_upload_limit: parseInt(groupDialog.form.weekly_upload_limit as any) || 0,
      monthly_upload_limit: parseInt(groupDialog.form.monthly_upload_limit as any) || 0,
      max_file_size: parseInt(groupDialog.form.max_file_size as any) || 10,
      concurrent_uploads: parseInt(groupDialog.form.concurrent_uploads as any) || 3,
      storage_space: parseInt(groupDialog.form.storage_space as any) || 100
    }
    
    const res = groupDialog.isEdit
      ? await apiService.updateUserGroup(groupDialog.form.id!, formData)
      : await apiService.createUserGroup(formData)
    
    if (res.success) {
      MessagePlugin.success(groupDialog.isEdit ? '更新成功' : '创建成功')
      groupDialog.visible = false
      loadGroups()
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '操作失败')
  } finally {
    groupDialog.saving = false
  }
}

// 删除用户组
const deleteGroup = async (id: number) => {
  try {
    const res = await apiService.deleteUserGroup(id)
    if (res.success) {
      MessagePlugin.success('删除成功')
      loadGroups()
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

// 打开生成密钥对话框
const openGenerateKeyDialog = () => {
  keyDialog.form = {
    group_id: undefined,
    count: 1,
    expires_at: ''
  }
  keyDialog.visible = true
}

// 生成密钥
const generateKeys = async () => {
  if (!keyDialog.form.group_id) {
    MessagePlugin.warning('请选择用户组')
    return
  }
  
  keyDialog.saving = true
  try {
    const res = await apiService.generateUserGroupKeys({
      group_id: keyDialog.form.group_id,
      count: keyDialog.form.count,
      expires_at: keyDialog.form.expires_at
    })
    if (res.success) {
      MessagePlugin.success(`成功生成 ${keyDialog.form.count} 个密钥`)
      keyDialog.visible = false
      generatedKeysDialog.keys = res.data?.map((k: any) => k.key) || []
      generatedKeysDialog.visible = true
      loadKeys()
    } else {
      MessagePlugin.error(res.message || '生成失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '生成失败')
  } finally {
    keyDialog.saving = false
  }
}

// 删除密钥
const deleteKey = async (id: number) => {
  try {
    const res = await apiService.deleteUserGroupKey(id)
    if (res.success) {
      MessagePlugin.success('删除成功')
      loadKeys()
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

// 分页
const handleKeyPageChange = (pageInfo: any) => {
  keyPagination.current = pageInfo.current
  loadKeys()
}

// 复制密钥
const copyKey = (key: string) => {
  navigator.clipboard.writeText(key).then(() => {
    MessagePlugin.success('已复制到剪贴板')
  }).catch(() => {
    MessagePlugin.error('复制失败')
  })
}

// 复制所有密钥
const copyAllKeys = () => {
  const keysText = generatedKeysDialog.keys.join('\n')
  navigator.clipboard.writeText(keysText).then(() => {
    MessagePlugin.success('已复制所有密钥')
  }).catch(() => {
    MessagePlugin.error('复制失败')
  })
}

// 检查是否过期
const isExpired = (row: any) => {
  if (!row.expires_at) return false
  return new Date(row.expires_at) < new Date()
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadGroups()
  loadKeys()
  loadStats()
})
</script>

<style scoped>
.admin-page {
  max-width: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  border: 1px solid #e5e6eb;
  margin-bottom: 20px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-num {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
}

.stat-label {
  font-size: 13px;
  color: #86909c;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e6eb;
  margin: 0 24px;
}

/* Tabs */
.tabs-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e6eb;
}

/* Table Card */
.table-card {
  margin-top: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-box {
  display: flex;
  gap: 12px;
}

.filter-box .t-select {
  width: 150px;
}

/* Limits Cell */
.limits-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.limit-item {
  display: flex;
  gap: 6px;
  font-size: 13px;
}

.limit-label {
  color: #86909c;
}

.limit-value {
  color: #1d2129;
  font-weight: 500;
}

/* Key Cell */
.key-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key-code {
  font-family: monospace;
  font-size: 13px;
  background: #f2f3f5;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Used Info */
.used-info {
  font-size: 13px;
  color: #4e5969;
}

/* Count Text */
.count-text {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

/* Time Text */
.time-text {
  font-size: 13px;
  color: #86909c;
}

/* Text Colors */
.text-gray {
  color: #86909c;
}

.text-danger {
  color: #f53f3f;
}

/* Operation Buttons */
.operation-btns {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Limit Inputs */
.limit-inputs {
  display: flex;
  gap: 12px;
}

.limit-input-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.limit-input-item :deep(.t-input) {
  width: 70px;
}

.limit-label {
  font-size: 13px;
  color: var(--td-text-color-secondary);
}

/* Generated Keys */
.generated-keys {
  padding: 16px 0;
}

.keys-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f2f3f5;
  border-radius: 6px;
}

.key-item code {
  font-family: monospace;
  font-size: 14px;
  color: #1d2129;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .stats-bar {
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
  }
  
  .stat-divider {
    display: none;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .filter-box {
    flex-direction: column;
  }
  
  .filter-box .t-select {
    width: 100%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .limit-inputs {
    flex-wrap: wrap;
  }
}
</style>
