<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  UserIcon,
  SettingsIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuth } from '@/composables/useAuth'
import { apiService } from '@/services/api'

const { user } = useAuth()

// 响应式数据
const activeTab = ref('password')
const isSubmitting = ref(false)

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
  margin-bottom: 32px;
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

.profile-content {
  margin-bottom: 24px;
}

.profile-card,
.settings-card {
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
}
</style>
