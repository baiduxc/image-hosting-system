<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-description">管理您的账户信息和安全设置</p>
    </div>

    <!-- 用户信息区 -->
    <div class="user-banner">
      <div class="user-info">
        <t-avatar size="56px" class="user-avatar">
          {{ userInfo.username?.charAt(0).toUpperCase() }}
        </t-avatar>
        <div class="user-details">
          <div class="user-name-row">
            <span class="user-name">{{ userInfo.username }}</span>
            <t-tag :theme="userInfo.role === 'admin' ? 'primary' : 'default'" size="small">
              {{ userInfo.role === 'admin' ? '管理员' : '用户' }}
            </t-tag>
          </div>
          <div class="user-meta">
            <span class="meta-item">
              <MailIcon class="meta-icon" />
              {{ userInfo.email || '未绑定邮箱' }}
            </span>
            <span class="meta-divider">·</span>
            <span class="meta-item">
              <CalendarIcon class="meta-icon" />
              {{ formatDate(userInfo.createdAt) }} 加入
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="sections-grid">
      <!-- 修改密码 -->
      <div class="section-card">
        <div class="section-header">
          <LockIcon class="section-icon" />
          <span class="section-title">修改密码</span>
        </div>
        <t-form
          ref="passwordForm"
          :data="passwordData"
          :rules="passwordRules"
          layout="vertical"
          class="compact-form"
          @submit="handlePasswordSubmit"
        >
          <t-form-item label="当前密码" name="currentPassword">
            <t-input
              v-model="passwordData.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              size="medium"
            />
          </t-form-item>
          <div class="form-row">
            <t-form-item label="新密码" name="newPassword">
              <t-input
                v-model="passwordData.newPassword"
                type="password"
                placeholder="至少6位"
                size="medium"
              />
            </t-form-item>
            <t-form-item label="确认密码" name="confirmPassword">
              <t-input
                v-model="passwordData.confirmPassword"
                type="password"
                placeholder="再次输入"
                size="medium"
              />
            </t-form-item>
          </div>
          <div class="form-actions">
            <t-button theme="primary" size="medium" type="submit" :loading="isSubmitting">
              更新密码
            </t-button>
          </div>
        </t-form>
      </div>

      <!-- 修改邮箱 -->
      <div class="section-card">
        <div class="section-header">
          <MailIcon class="section-icon" />
          <span class="section-title">修改邮箱</span>
        </div>
        <t-form
          ref="profileForm"
          :data="profileData"
          :rules="profileRules"
          layout="vertical"
          class="compact-form"
          @submit="handleProfileSubmit"
        >
          <t-form-item label="当前邮箱">
            <t-input :value="userInfo.email || '未设置'" disabled size="medium" />
          </t-form-item>
          <t-form-item label="新邮箱" name="email">
            <t-input
              v-model="profileData.email"
              placeholder="请输入新邮箱地址"
              size="medium"
            />
          </t-form-item>
          <div class="form-actions">
            <t-button theme="primary" size="medium" type="submit" :loading="isSubmitting">
              更新邮箱
            </t-button>
          </div>
        </t-form>
      </div>

      <!-- 账户统计 -->
      <div class="section-card stats-card">
        <div class="section-header">
          <BarChart3Icon class="section-icon" />
          <span class="section-title">账户概览</span>
        </div>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-number">{{ stats.imageCount || 0 }}</span>
            <span class="stat-label">图片数量</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ formatSize(stats.totalSize || 0) }}</span>
            <span class="stat-label">存储空间</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ stats.apiKeyCount || 0 }}</span>
            <span class="stat-label">API 密钥</span>
          </div>
        </div>
        <div class="last-login">
          <ClockIcon class="meta-icon" />
          最近登录：{{ formatDateTime(userInfo.lastLoginAt) }}
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="section-card quick-card">
        <div class="section-header">
          <ZapIcon class="section-icon" />
          <span class="section-title">快捷入口</span>
        </div>
        <div class="quick-grid">
          <div class="quick-item" @click="goToPage('/upload')">
            <UploadIcon class="quick-icon upload" />
            <span>上传图片</span>
          </div>
          <div class="quick-item" @click="goToPage('/manage')">
            <FolderIcon class="quick-icon manage" />
            <span>管理图片</span>
          </div>
          <div class="quick-item" @click="goToPage('/api')">
            <CodeIcon class="quick-icon api" />
            <span>API 接口</span>
          </div>
          <div class="quick-item" @click="goToPage('/stats')" v-if="userInfo.role === 'admin'">
            <BarChart3Icon class="quick-icon stats" />
            <span>数据统计</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MailIcon,
  CalendarIcon,
  ClockIcon,
  LockIcon,
  ZapIcon,
  UploadIcon,
  FolderIcon,
  CodeIcon,
  BarChart3Icon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuth } from '@/composables/useAuth'
import { apiService } from '@/services/api'

const router = useRouter()
const { user } = useAuth()

const isSubmitting = ref(false)

const userInfo = reactive({
  username: '',
  email: '',
  role: '',
  createdAt: '',
  lastLoginAt: ''
})

const stats = reactive({
  imageCount: 0,
  totalSize: 0,
  apiKeyCount: 0
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度至少6位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: (val: string) => val === passwordData.newPassword,
      message: '两次输入的密码不一致'
    }
  ]
}

const profileData = reactive({ email: '' })

const profileRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { email: true, message: '请输入正确的邮箱格式' }
  ]
}

const loadUserInfo = async () => {
  try {
    const response = await apiService.getUserProfile()
    if (response.success && response.data) {
      Object.assign(userInfo, response.data)
      profileData.email = response.data.email || ''
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

const loadStats = async () => {
  try {
    const [imagesRes, keysRes] = await Promise.all([
      apiService.getImages({ page: 1, limit: 1 }),
      apiService.getApiKeys()
    ])
    if (imagesRes.success && imagesRes.data) {
      stats.imageCount = imagesRes.data.pagination?.total || 0
    }
    if (keysRes.success && keysRes.data) {
      stats.apiKeyCount = keysRes.data.length || 0
    }
  } catch (error) {
    console.error('加载统计失败:', error)
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
    const response = await apiService.updateProfile({ email: profileData.email })
    if (response.success) {
      MessagePlugin.success('邮箱修改成功')
      await loadUserInfo()
    } else {
      MessagePlugin.error(response.message || '修改失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '修改失败')
  } finally {
    isSubmitting.value = false
  }
}

const goToPage = (path: string) => router.push(path)

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

onMounted(() => {
  if (user.value) {
    Object.assign(userInfo, user.value)
    profileData.email = user.value.email || ''
  }
  loadUserInfo()
  loadStats()
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
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 4px 0;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

/* 用户信息条 */
.user-banner {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, var(--td-brand-color), var(--td-brand-color-hover));
  font-size: 22px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.meta-divider {
  color: var(--td-text-color-placeholder);
}

/* 网格布局 */
.sections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.section-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 10px;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.section-icon {
  width: 18px;
  height: 18px;
  color: var(--td-brand-color);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

/* 紧凑表单 */
.compact-form {
  overflow: hidden;
}

.compact-form :deep(.t-form__item) {
  margin-bottom: 16px;
}

.compact-form :deep(.t-form__label) {
  font-size: 13px;
  padding-bottom: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-row :deep(.t-form__item) {
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-box {
  background: var(--td-bg-color-component);
  border-radius: 8px;
  padding: 14px 12px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--td-brand-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.last-login {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  padding-top: 12px;
  border-top: 1px solid var(--td-border-level-1-color);
}

/* 快捷入口 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--td-bg-color-component);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--td-text-color-primary);
}

.quick-item:hover {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

.quick-icon {
  width: 20px;
  height: 20px;
  padding: 4px;
  border-radius: 6px;
  color: white;
}

.quick-icon.upload { background: linear-gradient(135deg, #0052d9, #0077ff); }
.quick-icon.manage { background: linear-gradient(135deg, #2ba471, #00a870); }
.quick-icon.api { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.quick-icon.stats { background: linear-gradient(135deg, #e37318, #ff9500); }

/* 响应式 */
@media (max-width: 768px) {
  .sections-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .user-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .meta-divider {
    display: none;
  }
}
</style>
