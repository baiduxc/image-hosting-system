<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-description">管理您的账户信息和安全设置</p>
    </div>

    <!-- 两列布局 -->
    <div class="profile-columns">
      <!-- 左侧：用户信息 + 用户组 -->
      <div class="profile-left">
        <!-- 用户信息卡片 -->
        <div class="section-card user-info-card">
          <div class="user-info-content">
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

        <!-- 用户组信息 -->
        <div class="section-card group-card">
          <div class="section-header">
            <CrownIcon class="section-icon" />
            <span class="section-title">用户组</span>
            <t-tag theme="primary" size="small" class="group-tag">{{ userGroup.name || '普通用户' }}</t-tag>
          </div>
          <div class="group-info">
            <div class="group-limits">
              <div class="limit-item">
                <span class="limit-name">今日上传</span>
                <t-progress 
                  :percentage="getUsagePercent(userGroup.usage.daily, userGroup.limits.daily)" 
                  :color="getProgressColor(userGroup.usage.daily, userGroup.limits.daily)"
                  size="small"
                />
                <span class="limit-value">{{ userGroup.usage.daily }}/{{ userGroup.limits.daily }}</span>
              </div>
              <div class="limit-item">
                <span class="limit-name">本周上传</span>
                <t-progress 
                  :percentage="getUsagePercent(userGroup.usage.weekly, userGroup.limits.weekly)" 
                  :color="getProgressColor(userGroup.usage.weekly, userGroup.limits.weekly)"
                  size="small"
                />
                <span class="limit-value">{{ userGroup.usage.weekly }}/{{ userGroup.limits.weekly }}</span>
              </div>
              <div class="limit-item">
                <span class="limit-name">本月上传</span>
                <t-progress 
                  :percentage="getUsagePercent(userGroup.usage.monthly, userGroup.limits.monthly)" 
                  :color="getProgressColor(userGroup.usage.monthly, userGroup.limits.monthly)"
                  size="small"
                />
                <span class="limit-value">{{ userGroup.usage.monthly }}/{{ userGroup.limits.monthly }}</span>
              </div>
              <div class="limit-item">
                <span class="limit-name">存储空间</span>
                <t-progress 
                  :percentage="getUsagePercent(stats.totalSize || 0, (userGroup.limits.storage_space || 0) * 1024 * 1024)" 
                  :color="getProgressColor(stats.totalSize || 0, (userGroup.limits.storage_space || 0) * 1024 * 1024)"
                  size="small"
                />
                <span class="limit-value">{{ formatSize(stats.totalSize || 0) }}/{{ userGroup.limits.storage_space || 0 }}MB</span>
              </div>
            </div>
            <div class="group-other-limits">
              <span class="other-limit">单文件: {{ userGroup.limits.max_file_size }}MB</span>
              <span class="other-limit">并发: {{ userGroup.limits.concurrent_uploads }}个</span>
            </div>
          </div>
          <div class="redeem-section">
            <t-input-group>
              <t-input 
                v-model="redeemKey" 
                placeholder="输入升级密钥" 
                size="medium"
                @enter="redeemGroupKey"
              />
              <t-button theme="primary" size="medium" :loading="redeeming" @click="redeemGroupKey">
                兑换
              </t-button>
            </t-input-group>
          </div>
        </div>
      </div>

      <!-- 右侧：账户概览 + 快捷入口 -->
      <div class="profile-right">
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
            <div class="quick-item" @click="openPasswordModal">
              <LockIcon class="quick-icon password" />
              <span>修改密码</span>
            </div>
            <div class="quick-item" @click="openEmailModal">
              <MailIcon class="quick-icon email" />
              <span>修改邮箱</span>
            </div>
            <div class="quick-item" @click="goToPage('/admin')" v-if="userInfo.role === 'admin'">
              <BarChart3Icon class="quick-icon stats" />
              <span>后台管理</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <t-dialog
      v-model:visible="passwordModalVisible"
      header="修改密码"
      width="480px"
      :close-on-overlay-click="false"
      :confirm-btn="null"
      :cancel-btn="null"
      @close="resetPasswordModal"
    >
      <t-steps :current="passwordStep" class="modal-steps">
        <t-step-item title="验证身份" />
        <t-step-item title="输入验证码" />
        <t-step-item title="设置新密码" />
      </t-steps>

      <!-- 步骤1：验证身份 -->
      <div v-if="passwordStep === 0" class="modal-step-content">
        <p class="step-desc">请输入当前密码以验证身份，验证码将发送到您的邮箱</p>
        <t-form :data="passwordForm" layout="vertical">
          <t-form-item label="当前密码" name="currentPassword">
            <t-input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="passwordModalVisible = false">取消</t-button>
          <t-button theme="primary" :loading="sendingCode" @click="sendPasswordCode">
            发送验证码
          </t-button>
        </div>
      </div>

      <!-- 步骤2：输入验证码 -->
      <div v-if="passwordStep === 1" class="modal-step-content">
        <p class="step-desc">验证码已发送到 {{ maskEmail(userInfo.email) }}，请输入6位验证码</p>
        <t-form :data="passwordForm" layout="vertical">
          <t-form-item label="验证码" name="code">
            <t-input
              v-model="passwordForm.code"
              placeholder="请输入6位验证码"
              maxlength="6"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="passwordStep = 0">上一步</t-button>
          <t-button theme="primary" :loading="verifyingCode" @click="verifyPasswordCode">
            下一步
          </t-button>
        </div>
        <div class="resend-link">
          <t-link theme="primary" @click="sendPasswordCode" :disabled="sendingCode">
            {{ sendingCode ? '发送中...' : '重新发送验证码' }}
          </t-link>
        </div>
      </div>

      <!-- 步骤3：设置新密码 -->
      <div v-if="passwordStep === 2" class="modal-step-content">
        <p class="step-desc">请输入新密码并确认</p>
        <t-form :data="passwordForm" layout="vertical">
          <t-form-item label="新密码" name="newPassword">
            <t-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="至少6位"
            />
          </t-form-item>
          <t-form-item label="确认密码" name="confirmPassword">
            <t-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="再次输入新密码"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="passwordStep = 1">上一步</t-button>
          <t-button theme="primary" :loading="submitting" @click="submitPasswordChange">
            确认修改
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 修改邮箱弹窗 -->
    <t-dialog
      v-model:visible="emailModalVisible"
      header="修改邮箱"
      width="680px"
      :close-on-overlay-click="false"
      :confirm-btn="null"
      :cancel-btn="null"
      @close="resetEmailModal"
    >
      <t-steps :current="emailStep" class="modal-steps">
        <t-step-item title="验证身份" />
        <t-step-item title="验证原邮箱" />
        <t-step-item title="输入新邮箱" />
        <t-step-item title="验证新邮箱" />
      </t-steps>

      <!-- 步骤1：验证身份 -->
      <div v-if="emailStep === 0" class="modal-step-content">
        <p class="step-desc">请输入当前密码以验证身份</p>
        <t-form :data="emailForm" layout="vertical">
          <t-form-item label="当前密码" name="currentPassword">
            <t-input
              v-model="emailForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="emailModalVisible = false">取消</t-button>
          <t-button theme="primary" :loading="verifyingPassword" @click="verifyCurrentPassword">
            下一步
          </t-button>
        </div>
      </div>

      <!-- 步骤2：验证原邮箱 -->
      <div v-if="emailStep === 1" class="modal-step-content">
        <p class="step-desc">验证码已发送到当前邮箱 {{ maskEmail(userInfo.email) }}</p>
        <t-form :data="emailForm" layout="vertical">
          <t-form-item label="验证码" name="oldCode">
            <t-input
              v-model="emailForm.oldCode"
              placeholder="请输入6位验证码"
              maxlength="6"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="emailStep = 0">上一步</t-button>
          <t-button theme="primary" :loading="verifyingCode" @click="verifyOldEmailCode">
            下一步
          </t-button>
        </div>
        <div class="resend-link">
          <t-link theme="primary" @click="sendOldEmailCode" :disabled="sendingCode">
            {{ sendingCode ? '发送中...' : '重新发送验证码' }}
          </t-link>
        </div>
      </div>

      <!-- 步骤3：输入新邮箱 -->
      <div v-if="emailStep === 2" class="modal-step-content">
        <p class="step-desc">请输入您的新邮箱地址</p>
        <t-form :data="emailForm" layout="vertical">
          <t-form-item label="新邮箱" name="newEmail">
            <t-input
              v-model="emailForm.newEmail"
              placeholder="请输入新邮箱地址"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="emailStep = 1">上一步</t-button>
          <t-button theme="primary" :loading="sendingCode" @click="sendNewEmailCode">
            发送验证码
          </t-button>
        </div>
      </div>

      <!-- 步骤4：验证新邮箱 -->
      <div v-if="emailStep === 3" class="modal-step-content">
        <p class="step-desc">验证码已发送到新邮箱 {{ maskEmail(emailForm.newEmail) }}</p>
        <t-form :data="emailForm" layout="vertical">
          <t-form-item label="验证码" name="newCode">
            <t-input
              v-model="emailForm.newCode"
              placeholder="请输入6位验证码"
              maxlength="6"
            />
          </t-form-item>
        </t-form>
        <div class="modal-actions">
          <t-button theme="default" @click="emailStep = 2">上一步</t-button>
          <t-button theme="primary" :loading="submitting" @click="submitEmailChange">
            确认修改
          </t-button>
        </div>
        <div class="resend-link">
          <t-link theme="primary" @click="sendNewEmailCode" :disabled="sendingCode">
            {{ sendingCode ? '发送中...' : '重新发送验证码' }}
          </t-link>
        </div>
      </div>
    </t-dialog>
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
  BarChart3Icon,
  CrownIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuth } from '@/composables/useAuth'
import { apiService } from '@/services/api'

const router = useRouter()
const { user } = useAuth()

// 用户信息
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

// 用户组信息
const userGroup = reactive({
  name: '',
  limits: {
    daily: 50,
    weekly: 300,
    monthly: 1000,
    max_file_size: 10,
    concurrent_uploads: 3,
    storage_space: 100 as number
  },
  usage: {
    daily: 0,
    weekly: 0,
    monthly: 0
  }
})

const redeemKey = ref('')
const redeeming = ref(false)

// 修改密码弹窗
const passwordModalVisible = ref(false)
const passwordStep = ref(0)
const sendingCode = ref(false)
const verifyingCode = ref(false)
const submitting = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 修改邮箱弹窗
const emailModalVisible = ref(false)
const emailStep = ref(0)
const verifyingPassword = ref(false)

const emailForm = reactive({
  currentPassword: '',
  oldCode: '',
  newEmail: '',
  newCode: ''
})

// 打开修改密码弹窗
const openPasswordModal = () => {
  passwordModalVisible.value = true
  passwordStep.value = 0
  resetPasswordForm()
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.code = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 重置密码弹窗
const resetPasswordModal = () => {
  passwordStep.value = 0
  resetPasswordForm()
}

// 打开修改邮箱弹窗
const openEmailModal = () => {
  emailModalVisible.value = true
  emailStep.value = 0
  resetEmailForm()
}

// 重置邮箱表单
const resetEmailForm = () => {
  emailForm.currentPassword = ''
  emailForm.oldCode = ''
  emailForm.newEmail = ''
  emailForm.newCode = ''
}

// 重置邮箱弹窗
const resetEmailModal = () => {
  emailStep.value = 0
  resetEmailForm()
}

// 发送密码修改验证码
const sendPasswordCode = async () => {
  if (!passwordForm.currentPassword) {
    MessagePlugin.error('请输入当前密码')
    return
  }

  sendingCode.value = true
  try {
    const response = await apiService.sendPasswordVerificationCode({
      currentPassword: passwordForm.currentPassword
    })
    if (response.success) {
      MessagePlugin.success('验证码已发送到您的邮箱')
      passwordStep.value = 1
    } else {
      MessagePlugin.error(response.message || '发送验证码失败')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '发送验证码失败'
    MessagePlugin.error(errorMsg)
  } finally {
    sendingCode.value = false
  }
}

// 验证密码修改验证码
const verifyPasswordCode = async () => {
  if (!passwordForm.code || passwordForm.code.length !== 6) {
    MessagePlugin.error('请输入6位验证码')
    return
  }

  verifyingCode.value = true
  try {
    const response = await apiService.verifyPasswordVerificationCode({
      code: passwordForm.code
    })
    if (response.success) {
      MessagePlugin.success('验证成功')
      passwordStep.value = 2
    } else {
      MessagePlugin.error(response.message || '验证码错误')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '验证失败'
    MessagePlugin.error(errorMsg)
  } finally {
    verifyingCode.value = false
  }
}

// 提交密码修改
const submitPasswordChange = async () => {
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    MessagePlugin.error('新密码长度至少6位')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    MessagePlugin.error('两次输入的密码不一致')
    return
  }

  submitting.value = true
  try {
    const response = await apiService.changePasswordWithCode({
      code: passwordForm.code,
      newPassword: passwordForm.newPassword
    })
    if (response.success) {
      MessagePlugin.success('密码修改成功')
      passwordModalVisible.value = false
      resetPasswordForm()
    } else {
      MessagePlugin.error(response.message || '密码修改失败')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '密码修改失败'
    MessagePlugin.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

// 验证当前密码（邮箱修改）
const verifyCurrentPassword = async () => {
  if (!emailForm.currentPassword) {
    MessagePlugin.error('请输入当前密码')
    return
  }

  verifyingPassword.value = true
  try {
    const response = await apiService.verifyCurrentPassword({
      currentPassword: emailForm.currentPassword
    })
    if (response.success) {
      // 发送验证码到当前邮箱
      const sendResponse = await apiService.sendEmailVerificationCode({
        currentPassword: emailForm.currentPassword
      })
      if (sendResponse.success) {
        MessagePlugin.success('验证码已发送到当前邮箱')
        emailStep.value = 1
      } else {
        MessagePlugin.error(sendResponse.message || '发送验证码失败')
      }
    } else {
      MessagePlugin.error(response.message || '密码错误')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '验证失败'
    MessagePlugin.error(errorMsg)
  } finally {
    verifyingPassword.value = false
  }
}

// 发送旧邮箱验证码
const sendOldEmailCode = async () => {
  sendingCode.value = true
  try {
    const response = await apiService.sendEmailVerificationCode({
      currentPassword: emailForm.currentPassword
    })
    if (response.success) {
      MessagePlugin.success('验证码已发送')
    } else {
      MessagePlugin.error(response.message || '发送验证码失败')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '发送验证码失败'
    MessagePlugin.error(errorMsg)
  } finally {
    sendingCode.value = false
  }
}

// 验证旧邮箱验证码
const verifyOldEmailCode = async () => {
  if (!emailForm.oldCode || emailForm.oldCode.length !== 6) {
    MessagePlugin.error('请输入6位验证码')
    return
  }

  verifyingCode.value = true
  try {
    const response = await apiService.verifyEmailVerificationCode({
      code: emailForm.oldCode
    })
    if (response.success) {
      MessagePlugin.success('验证成功')
      emailStep.value = 2
    } else {
      MessagePlugin.error(response.message || '验证码错误')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '验证失败'
    MessagePlugin.error(errorMsg)
  } finally {
    verifyingCode.value = false
  }
}

// 发送新邮箱验证码
const sendNewEmailCode = async () => {
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.newEmail)) {
    MessagePlugin.error('请输入有效的邮箱地址')
    return
  }

  // 检查是否与原邮箱相同
  if (emailForm.newEmail === userInfo.email) {
    MessagePlugin.error('新邮箱不能与当前邮箱相同')
    return
  }

  sendingCode.value = true
  try {
    const response = await apiService.sendNewEmailCode({
      newEmail: emailForm.newEmail
    })
    if (response.success) {
      MessagePlugin.success('验证码已发送到新邮箱')
      emailStep.value = 3
    } else {
      MessagePlugin.error(response.message || '发送验证码失败')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '发送验证码失败'
    MessagePlugin.error(errorMsg)
  } finally {
    sendingCode.value = false
  }
}

// 提交邮箱修改
const submitEmailChange = async () => {
  if (!emailForm.newCode || emailForm.newCode.length !== 6) {
    MessagePlugin.error('请输入6位验证码')
    return
  }

  submitting.value = true
  try {
    const response = await apiService.changeEmail({
      oldCode: emailForm.oldCode,
      newEmail: emailForm.newEmail,
      newCode: emailForm.newCode
    })
    if (response.success) {
      MessagePlugin.success('邮箱修改成功')
      userInfo.email = emailForm.newEmail
      emailModalVisible.value = false
      resetEmailForm()
    } else {
      MessagePlugin.error(response.message || '邮箱修改失败')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '邮箱修改失败'
    MessagePlugin.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await apiService.getUserProfile()
    if (response.success && response.data) {
      const data = response.data
      userInfo.username = data.username || ''
      userInfo.email = data.email || ''
      userInfo.role = data.role || ''
      userInfo.createdAt = data.created_at || ''
      userInfo.lastLoginAt = data.last_login_at || ''
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 加载统计
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

// 加载用户组信息
const loadUserGroup = async () => {
  try {
    const response = await apiService.getMyUserGroup()
    if (response.success && response.data) {
      const { group, usage } = response.data
      userGroup.name = group.name
      userGroup.limits = {
        daily: group.daily_upload_limit,
        weekly: group.weekly_upload_limit,
        monthly: group.monthly_upload_limit,
        max_file_size: group.max_file_size,
        concurrent_uploads: group.concurrent_uploads,
        storage_space: group.storage_space || 100
      }
      userGroup.usage = usage
    }
  } catch (error) {
    console.error('加载用户组信息失败:', error)
  }
}

// 计算使用百分比
const getUsagePercent = (usage: number, limit: number) => {
  if (!limit) return 0
  return Math.min(Math.round((usage / limit) * 100), 100)
}

// 获取进度条颜色
const getProgressColor = (usage: number, limit: number) => {
  const percent = getUsagePercent(usage, limit)
  if (percent >= 90) return '#f53f3f'
  if (percent >= 70) return '#ff7d00'
  return '#0052d9'
}

// 获取使用量文字样式类
const getUsageClass = (usage: number, limit: number) => {
  const percent = getUsagePercent(usage, limit)
  if (percent >= 90) return 'usage-danger'
  if (percent >= 70) return 'usage-warning'
  return 'usage-normal'
}

// 兑换密钥
const redeemGroupKey = async () => {
  if (!redeemKey.value.trim()) {
    MessagePlugin.warning('请输入密钥')
    return
  }
  
  redeeming.value = true
  try {
    const response = await apiService.redeemUserGroupKey(redeemKey.value.trim())
    if (response.success) {
      MessagePlugin.success(response.message || '兑换成功')
      redeemKey.value = ''
      await loadUserGroup()
    } else {
      MessagePlugin.error(response.message || '兑换失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '兑换失败')
  } finally {
    redeeming.value = false
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

// 邮箱脱敏显示
const maskEmail = (email: string) => {
  if (!email) return ''
  const [localPart, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = localPart.length > 2 
    ? localPart.substring(0, 2) + '***' 
    : '***'
  return `${maskedLocal}@${domain}`
}

onMounted(() => {
  if (user.value) {
    Object.assign(userInfo, user.value)
  }
  loadUserInfo()
  loadStats()
  loadUserGroup()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 32px 0;
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

/* 用户信息卡片 */
.user-info-card {
  padding: 20px 24px;
}

.user-info-content {
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

/* 两列布局 */
.profile-columns {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

.profile-left {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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
  margin-bottom: 8px;
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

.section-description {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  margin-bottom: 16px;
  min-height: 20px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--td-bg-color-component);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: var(--td-text-color-primary);
}

.quick-item:hover {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

.quick-icon {
  width: 28px;
  height: 28px;
  padding: 6px;
  border-radius: 8px;
  color: white;
}

.quick-icon.upload { background: linear-gradient(135deg, #0052d9, #0077ff); }
.quick-icon.manage { background: linear-gradient(135deg, #2ba471, #00a870); }
.quick-icon.api { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.quick-icon.password { background: linear-gradient(135deg, #f5a623, #ff9500); }
.quick-icon.email { background: linear-gradient(135deg, #00b4d8, #0077b6); }
.quick-icon.stats { background: linear-gradient(135deg, #e37318, #ff9500); }

/* 弹窗样式 */
.modal-steps {
  margin-bottom: 24px;
}

.modal-step-content {
  padding: 0 4px;
}

.step-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.resend-link {
  text-align: center;
  margin-top: 12px;
}

/* 用户组卡片 */
.group-card {
  grid-column: span 2;
}

.group-tag {
  margin-left: auto;
}

.group-info {
  margin-bottom: 16px;
}

.group-limits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.limit-name {
  width: 70px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  flex-shrink: 0;
}

.limit-value {
  width: 80px;
  font-size: 13px;
  color: var(--td-text-color-primary);
  text-align: right;
  flex-shrink: 0;
}

.limit-item :deep(.t-progress) {
  flex: 1;
  min-width: 0;
}

.group-other-limits {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--td-border-level-1-color);
}

.other-limit {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  background: var(--td-bg-color-component);
  padding: 4px 10px;
  border-radius: 4px;
}

.redeem-section {
  padding-top: 16px;
  border-top: 1px solid var(--td-border-level-1-color);
}

.redeem-section :deep(.t-input-group) {
  display: flex;
  gap: 8px;
}

.redeem-section :deep(.t-input) {
  flex: 1;
}

/* 响应式 */
@media (max-width: 900px) {
  .profile-columns {
    grid-template-columns: 1fr;
  }
  
  .profile-right {
    flex-direction: row;
  }
  
  .profile-right .section-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .sections-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-right {
    flex-direction: column;
  }
  
  .group-card {
    grid-column: span 1;
  }
  
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .limit-item {
    flex-wrap: wrap;
  }
  
  .limit-name {
    width: auto;
  }
  
  .limit-value {
    width: auto;
    margin-left: auto;
  }
  
  .limit-item :deep(.t-progress) {
    width: 100%;
    order: 3;
  }
}
</style>
