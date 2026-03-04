<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-title">
        <h1>用户管理</h1>
        <p class="subtitle">管理系统用户账号、权限和状态</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-box">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-label">总用户</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">{{ stats.active }}</span>
        <span class="stat-label">活跃用户</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">{{ stats.disabled }}</span>
        <span class="stat-label">已封禁</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num">{{ stats.admin }}</span>
        <span class="stat-label">管理员</span>
      </div>
    </div>

    <!-- User Table -->
    <div class="table-card">
      <div class="table-header">
        <div class="search-box">
          <t-input v-model="searchKey" placeholder="搜索用户名或邮箱" clearable @enter="loadData">
            <template #prefix><SearchIcon :size="16" /></template>
          </t-input>
        </div>
        <t-button theme="primary" variant="outline" @click="loadData">
          <template #icon><RefreshCwIcon :size="16" /></template>
          刷新
        </t-button>
      </div>

      <t-table
        :data="userList"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
        size="medium"
        :loading="loading"
        @page-change="handlePageChange"
      >
        <template #username="{ row }">
          <div class="user-cell">
            <div class="user-avatar">{{ row.username?.charAt(0)?.toUpperCase() || 'U' }}</div>
            <div class="user-info">
              <span class="user-name">{{ row.username }}</span>
              <span class="user-email">{{ row.email }}</span>
            </div>
          </div>
        </template>

        <template #role="{ row }">
          <span class="role-tag" :class="row.role">{{ row.role === 'admin' ? '管理员' : '用户' }}</span>
        </template>

        <template #imageCount="{ row }">
          <span class="count-text">{{ row.imageCount || 0 }}</span>
        </template>

        <template #status="{ row }">
          <span class="status-tag" :class="row.isDisabled ? 'disabled' : 'active'">
            {{ row.isDisabled ? '已封禁' : '正常' }}
          </span>
        </template>

        <template #createdAt="{ row }">
          <span class="time-text">{{ formatDate(row.createdAt) }}</span>
        </template>

        <template #lastLoginAt="{ row }">
          <span class="time-text">{{ formatDateTime(row.lastLoginAt) }}</span>
        </template>

        <template #operation="{ row }">
          <div class="operation-btns">
            <t-button variant="text" size="small" @click="openEdit(row)">
              <EditIcon :size="14" />
            </t-button>
            <t-popconfirm 
              :content="row.isDisabled ? '确定解封该用户？' : '确定封禁该用户？'"
              @confirm="toggleStatus(row)"
            >
              <t-button :theme="row.isDisabled ? 'success' : 'warning'" variant="text" size="small">
                <component :is="row.isDisabled ? UserCheckIcon : UserXIcon" :size="14" />
              </t-button>
            </t-popconfirm>
            <t-popconfirm content="确定删除该用户？此操作不可恢复！" @confirm="deleteUser(row.id)">
              <t-button theme="danger" variant="text" size="small">
                <TrashIcon :size="14" />
              </t-button>
            </t-popconfirm>
          </div>
        </template>
      </t-table>
    </div>

    <!-- Edit Drawer -->
    <t-drawer
      v-model:visible="drawerVisible"
      header="编辑用户"
      size="400px"
      :confirm-btn="{ loading: saving, content: '保存' }"
      @confirm="saveUser"
    >
      <div class="edit-form">
        <div class="form-item">
          <label>用户名</label>
          <t-input v-model="editForm.username" disabled />
        </div>
        <div class="form-item">
          <label>邮箱</label>
          <t-input v-model="editForm.email" />
        </div>
        <div class="form-item">
          <label>角色</label>
          <t-radio-group v-model="editForm.role">
            <t-radio value="user">普通用户</t-radio>
            <t-radio value="admin">管理员</t-radio>
          </t-radio-group>
        </div>
        <div class="form-item">
          <label>账号状态</label>
          <t-switch v-model="editForm.isDisabled" :label="['已封禁', '正常']" />
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SearchIcon, RefreshCwIcon, EditIcon, TrashIcon, UserCheckIcon, UserXIcon } from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const userList = ref<any[]>([])
const stats = reactive({ total: 0, active: 0, disabled: 0, admin: 0 })
const loading = ref(false)
const searchKey = ref('')
const saving = ref(false)

const drawerVisible = ref(false)
const editForm = reactive({
  id: '',
  username: '',
  email: '',
  role: 'user',
  isDisabled: false
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { colKey: 'username', title: '用户', width: 200 },
  { colKey: 'role', title: '角色', width: 90, align: 'center' },
  { colKey: 'imageCount', title: '图片数', width: 80, align: 'center' },
  { colKey: 'status', title: '状态', width: 90, align: 'center' },
  { colKey: 'createdAt', title: '注册时间', width: 120 },
  { colKey: 'lastLoginAt', title: '最后登录', width: 150 },
  { colKey: 'operation', title: '操作', width: 120, align: 'center' }
]

const formatDate = (date: string) => {
  if (!date) return '-'
  // 将 UTC 时间转换为本地时间（北京时间）
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

const formatDateTime = (date: string) => {
  if (!date) return '从未登录'
  // 将 UTC 时间转换为本地时间（北京时间）
  const d = new Date(date)
  return d.toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await apiService.getUserList(pagination.current, pagination.pageSize, searchKey.value)
    if (res.success) {
      userList.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
    // 加载统计
    const statRes = await apiService.getUserStats()
    if (statRes.success) {
      Object.assign(stats, statRes.data)
    }
  } catch (error) {
    console.error('加载失败', error)
    MessagePlugin.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current
  loadData()
}

const openEdit = (row: any) => {
  Object.assign(editForm, {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    isDisabled: row.isDisabled
  })
  drawerVisible.value = true
}

const saveUser = async () => {
  if (!editForm.email) {
    MessagePlugin.warning('请填写邮箱')
    return
  }
  saving.value = true
  try {
    const res = await apiService.updateUser(editForm.id, {
      email: editForm.email,
      role: editForm.role,
      isDisabled: editForm.isDisabled
    })
    if (res.success) {
      MessagePlugin.success('保存成功')
      drawerVisible.value = false
      loadData()
    } else {
      MessagePlugin.error(res.message || '保存失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (row: any) => {
  try {
    const res = await apiService.updateUser(row.id, {
      isDisabled: !row.isDisabled
    })
    if (res.success) {
      MessagePlugin.success(row.isDisabled ? '解封成功' : '封禁成功')
      loadData()
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '操作失败')
  }
}

const deleteUser = async (id: string) => {
  try {
    const res = await apiService.deleteUser(id)
    if (res.success) {
      MessagePlugin.success('删除成功')
      loadData()
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
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

/* Table Card */
.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e6eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e6eb;
}

.search-box {
  max-width: 300px;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0052d9, #1890ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: #86909c;
}

/* Role Tag */
.role-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.admin {
  background: #fff7e6;
  color: #ff7d00;
}

.role-tag.user {
  background: #f2f3f5;
  color: #4e5969;
}

/* Status Tag */
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.active {
  background: #e8f5e9;
  color: #00b578;
}

.status-tag.disabled {
  background: #ffebee;
  color: #f53f3f;
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

/* Operation Buttons */
.operation-btns {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Edit Form */
.edit-form {
  padding: 20px 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

/* Responsive */
@media (max-width: 768px) {
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
  
  .search-box {
    max-width: none;
  }
}
</style>
