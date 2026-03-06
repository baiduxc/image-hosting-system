<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <h1>数据库管理</h1>
      <p class="subtitle">备份、恢复和迁移数据库</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon blue">
          <DatabaseIcon :size="24" />
        </div>
        <div class="stat-info">
          <span class="stat-label">数据库类型</span>
          <span class="stat-value">{{ dbInfo.type === 'sqlite' ? 'SQLite' : 'PostgreSQL' }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <HardDriveIcon :size="24" />
        </div>
        <div class="stat-info">
          <span class="stat-label">数据库大小</span>
          <span class="stat-value">{{ formatSize(dbInfo.size) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <ArchiveIcon :size="24" />
        </div>
        <div class="stat-info">
          <span class="stat-label">备份数量</span>
          <span class="stat-value">{{ backups.length }}</span>
        </div>
      </div>
    </div>

    <!-- Backup Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="header-title">
          <h3>备份管理</h3>
          <p>定期备份数据库以防止数据丢失</p>
        </div>
        <t-button theme="primary" :loading="isBackingUp" @click="createBackup">
          <template #icon><DownloadIcon :size="16" /></template>
          立即备份
        </t-button>
      </div>

      <div v-if="backups.length > 0" class="backup-list">
        <div v-for="backup in backups" :key="backup.fileName" class="backup-item">
          <div class="backup-info">
            <div class="backup-icon">
              <FileIcon :size="20" />
            </div>
            <div class="backup-details">
              <span class="backup-name">{{ backup.fileName }}</span>
              <span class="backup-meta">{{ formatSize(backup.fileSize) }} · {{ formatDate(backup.createdAt) }}</span>
            </div>
          </div>
          <div class="backup-actions">
            <t-button variant="text" size="small" @click="downloadBackup(backup.fileName)">
              <DownloadIcon :size="14" />
              下载
            </t-button>
            <t-popconfirm content="确定从该备份恢复？当前数据将被覆盖！" @confirm="restoreBackup(backup.fileName)">
              <t-button theme="warning" variant="text" size="small">
                <RotateCcwIcon :size="14" />
                恢复
              </t-button>
            </t-popconfirm>
            <t-popconfirm content="确定删除该备份？" @confirm="deleteBackup(backup.fileName)">
              <t-button theme="danger" variant="text" size="small">
                <TrashIcon :size="14" />
                删除
              </t-button>
            </t-popconfirm>
          </div>
        </div>
      </div>

      <div v-else class="empty-mini">
        <InboxIcon :size="32" />
        <span>暂无备份文件</span>
      </div>

      <!-- 上传恢复 -->
      <div class="upload-restore">
        <t-divider>或</t-divider>
        <t-upload
          v-model="uploadFiles"
          theme="custom"
          :action="uploadAction"
          :headers="uploadHeaders"
          accept=".db,.sqlite,.sql,.zip,.gz"
          :beforeUpload="beforeUpload"
          @success="onUploadSuccess"
          @fail="onUploadFail"
        >
          <t-button variant="outline">
            <template #icon><UploadIcon :size="16" /></template>
            上传备份文件恢复
          </t-button>
        </t-upload>
        <p class="upload-hint">支持 .db, .sqlite, .sql, .zip, .gz 格式的备份文件</p>
      </div>
    </div>

    <!-- Migration Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="header-title">
          <h3>数据库迁移</h3>
          <p>将 PostgreSQL 数据迁移到 SQLite 格式</p>
        </div>
      </div>

      <div class="migrate-form">
        <div class="form-item">
          <label>PostgreSQL 连接字符串</label>
          <t-textarea
            v-model="migrationUrl"
            placeholder="postgresql://username:password@host:port/database"
            :rows="2"
          />
        </div>
        <t-button theme="warning" :loading="isMigrating" :disabled="!migrationUrl" @click="startMigration">
          <template #icon><ArrowRightLeftIcon :size="16" /></template>
          开始迁移
        </t-button>
      </div>

      <t-alert v-if="migrationResult" :theme="migrationResult.success ? 'success' : 'error'" style="margin-top: 16px;">
        {{ migrationResult.message }}
      </t-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  DatabaseIcon, 
  HardDriveIcon, 
  ArchiveIcon,
  DownloadIcon,
  FileIcon,
  TrashIcon,
  InboxIcon,
  ArrowRightLeftIcon,
  RotateCcwIcon,
  UploadIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const dbInfo = reactive({
  type: 'sqlite',
  path: null as string | null,
  size: null as number | null
})

const backups = ref<any[]>([])
const isBackingUp = ref(false)
const isRestoring = ref(false)
const isMigrating = ref(false)
const migrationUrl = ref('')
const migrationResult = ref<any>(null)
const uploadFiles = ref([])
const uploadAction = `${import.meta.env.VITE_API_BASE_URL || ''}/api/database/restore-upload`
const uploadHeaders = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }

const formatSize = (bytes: number | null | undefined) => {
  if (!bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const loadDbInfo = async () => {
  try {
    const res = await apiService.getDatabaseInfo()
    if (res.success) Object.assign(dbInfo, res.data)
  } catch (error) {}
}

const loadBackups = async () => {
  try {
    const res = await apiService.getBackups()
    if (res.success) backups.value = res.data || []
  } catch (error) {}
}

const createBackup = async () => {
  isBackingUp.value = true
  try {
    await apiService.backupDatabase()
    MessagePlugin.success('备份创建成功')
    loadBackups()
  } catch (error: any) {
    MessagePlugin.error(error.message || '备份失败')
  } finally {
    isBackingUp.value = false
  }
}

const downloadBackup = async (fileName: string) => {
  try {
    const blob = await apiService.downloadBackup(fileName)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    MessagePlugin.error('下载失败')
  }
}

const deleteBackup = async (fileName: string) => {
  try {
    await apiService.deleteBackup(fileName)
    MessagePlugin.success('删除成功')
    loadBackups()
  } catch (error: any) {
    MessagePlugin.error(error.message)
  }
}

const restoreBackup = async (fileName: string) => {
  isRestoring.value = true
  try {
    const res = await apiService.restoreBackup(fileName)
    if (res.success) {
      MessagePlugin.success('数据库恢复成功，请重新登录')
      // 恢复后需要重新登录
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }, 2000)
    } else {
      MessagePlugin.error(res.message || '恢复失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '恢复失败')
  } finally {
    isRestoring.value = false
  }
}

const beforeUpload = (file: any) => {
  const validTypes = ['.db', '.sqlite', '.sql', '.zip', '.gz']
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!validTypes.includes(ext)) {
    MessagePlugin.error('不支持的文件格式')
    return false
  }
  if (file.size > 500 * 1024 * 1024) {
    MessagePlugin.error('文件大小不能超过 500MB')
    return false
  }
  return true
}

const onUploadSuccess = (res: any) => {
  if (res.response?.success) {
    MessagePlugin.success('数据库恢复成功，请重新登录')
    setTimeout(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }, 2000)
  } else {
    MessagePlugin.error(res.response?.message || '恢复失败')
  }
  uploadFiles.value = []
}

const onUploadFail = (res: any) => {
  MessagePlugin.error(res.response?.message || '上传失败')
  uploadFiles.value = []
}

const startMigration = async () => {
  isMigrating.value = true
  migrationResult.value = null
  try {
    const res = await apiService.migrateDatabase(migrationUrl.value)
    migrationResult.value = res
    if (res.success) MessagePlugin.success('迁移成功')
  } catch (error: any) {
    MessagePlugin.error('迁移失败')
  } finally {
    isMigrating.value = false
  }
}

onMounted(() => {
  loadDbInfo()
  loadBackups()
})
</script>

<style scoped>
.admin-page {
  max-width: none;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #0052d9, #1890ff); }
.stat-icon.green { background: linear-gradient(135deg, #00b578, #00d68a); }
.stat-icon.orange { background: linear-gradient(135deg, #ff7d00, #ff9a44); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

/* Section Card */
.section-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e6eb;
  margin-bottom: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e6eb;
}

.header-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.header-title p {
  font-size: 13px;
  color: #86909c;
  margin: 0;
}

/* Backup List */
.backup-list {
  padding: 12px;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.backup-item:hover {
  background: #f7f8fa;
}

.backup-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.backup-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #0052d9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backup-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.backup-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.backup-meta {
  font-size: 12px;
  color: #86909c;
}

.backup-actions {
  display: flex;
  gap: 8px;
}

/* Empty Mini */
.empty-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: #c9cdd4;
  font-size: 14px;
}

/* Migrate Form */
.migrate-form {
  padding: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

/* Upload Restore */
.upload-restore {
  padding: 20px;
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>
