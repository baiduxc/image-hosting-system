<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <ImageIcon class="logo-icon" />
          </div>
          <h1 class="brand-title">{{ siteName }}</h1>
          <p class="brand-subtitle">{{ siteDescription }}</p>
          <div class="brand-features">
            <div class="feature-item">
              <CheckCircleIcon class="feature-icon" />
              <span>安全可靠的云存储</span>
            </div>
            <div class="feature-item">
              <CheckCircleIcon class="feature-icon" />
              <span>多平台存储支持</span>
            </div>
            <div class="feature-item">
              <CheckCircleIcon class="feature-icon" />
              <span>智能防盗链转存</span>
            </div>
            <div class="feature-item">
              <CheckCircleIcon class="feature-icon" />
              <span>便捷的图片管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">技术验证用，请勿访问</p>
          </div>

          <t-form
            ref="loginForm"
            :data="loginData"
            :rules="loginRules"
            layout="vertical"
            :colon="false"
            @submit="handleLogin"
          >
            <t-form-item label="用户名/邮箱" name="username">
              <t-input
                v-model="loginData.username"
                placeholder="请输入用户名或邮箱地址"
                size="large"
                :disabled="isLoading"
              >
                <template #prefix-icon>
                  <MailIcon class="input-icon" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item label="密码" name="password">
              <t-input
                v-model="loginData.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :disabled="isLoading"
              >
                <template #prefix-icon>
                  <LockIcon class="input-icon" />
                </template>
              </t-input>
            </t-form-item>

            <div class="form-options">
              <t-checkbox v-model="loginData.rememberMe" :disabled="isLoading">
                记住我
              </t-checkbox>
              <t-link theme="primary" @click="showForgotPassword">
                忘记密码？
              </t-link>
            </div>

            <t-button
              theme="primary"
              size="large"
              block
              :loading="isLoading"
              @click="handleLogin"
            >
              登录
            </t-button>
          </t-form>

          <!-- 注册链接 - 根据系统配置显示 -->
          <div v-if="allowRegister" class="form-footer">
            <div class="register-prompt">
              <span>还没有账户？</span>
              <t-link theme="primary" @click="goToRegister">
                立即注册
              </t-link>
            </div>
          </div>

          <!-- 社交登录（可选） -->
          <div class="social-login" v-if="false">
            <div class="divider">
              <span class="divider-text">或者</span>
            </div>
            <div class="social-buttons">
              <t-button variant="outline" size="large" block>
                <template #icon>
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </template>
                使用 Google 登录
              </t-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <t-dialog
      v-model:visible="forgotPasswordVisible"
      header="重置密码"
      width="400px"
      @confirm="handleForgotPassword"
      @cancel="forgotPasswordVisible = false"
    >
      <t-form :data="forgotPasswordData" layout="vertical" :colon="false">
        <t-form-item label="邮箱地址" name="email">
          <t-input
            v-model="forgotPasswordData.email"
            placeholder="请输入注册邮箱"
            size="large"
          >
            <template #prefix-icon>
              <MailIcon class="input-icon" />
            </template>
          </t-input>
        </t-form-item>
        <p class="forgot-tip">
          我们将向您的邮箱发送重置密码的链接
        </p>
      </t-form>
      <template #footer>
        <t-button @click="forgotPasswordVisible = false">取消</t-button>
        <t-button 
          theme="primary" 
          :loading="isSendingReset"
          @click="handleForgotPassword"
        >
          发送重置链接
        </t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ImageIcon,
  CheckCircleIcon,
  MailIcon,
  LockIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useSystemConfig } from '@/composables/useSystemConfig'

const router = useRouter()
const { login, isLoading } = useAuth()
const { siteName, siteDescription, allowRegister, loadPublicSystemConfig } = useSystemConfig()

// 表单引用
const loginForm = ref()

// 响应式数据
const isSendingReset = ref(false)
const forgotPasswordVisible = ref(false)

// 登录表单数据 - 使用reactive
const loginData = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 忘记密码表单数据
const forgotPasswordData = reactive({
  email: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { 
      required: true, 
      message: '请输入用户名或邮箱'
    }
  ],
  password: [
    { 
      required: true, 
      message: '请输入密码'
    }
  ]
}

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    const validateResult = await loginForm.value?.validate()
    if (validateResult !== true) {
      return
    }

    const result = await login({
      username: loginData.username,
      password: loginData.password,
      rememberMe: loginData.rememberMe
    })

    if (result.success) {
      // 跳转到主页面
      router.push('/')
    }
  } catch (error) {

  }
}

// 显示忘记密码对话框
const showForgotPassword = () => {
  // 如果用户名包含@符号，认为是邮箱，自动填入
  if (loginData.username.includes('@')) {
    forgotPasswordData.email = loginData.username
  } else {
    forgotPasswordData.email = ''
  }
  forgotPasswordVisible.value = true
}

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!forgotPasswordData.email) {
    MessagePlugin.warning('请输入邮箱地址')
    return
  }

  isSendingReset.value = true
  try {
    // 这里暂时显示提示，实际需要后端支持
    MessagePlugin.info('忘记密码功能正在开发中，请联系管理员')
    forgotPasswordVisible.value = false
  } catch (error: any) {

    MessagePlugin.error('发送失败')
  } finally {
    isSendingReset.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 组件挂载时加载公开系统配置
import { onMounted } from 'vue'
onMounted(() => {
  loadPublicSystemConfig()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

/* 品牌区域样式 */
.brand-section {
  background: linear-gradient(135deg, var(--td-brand-color-7) 0%, var(--td-brand-color-8) 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
  max-width: 300px;
}

.brand-logo {
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.logo-icon {
  width: 40px;
  height: 40px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 40px 0;
  line-height: 1.5;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.feature-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 表单区域样式 */
.form-section {
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 16px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.input-icon {
  width: 16px;
  height: 16px;
  color: var(--td-text-color-placeholder);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 32px;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
}

.register-prompt {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

/* 社交登录样式 */
.social-login {
  margin-top: 32px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--td-border-level-1-color);
}

.divider-text {
  background-color: white;
  padding: 0 16px;
  font-size: 14px;
  color: var(--td-text-color-placeholder);
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* 忘记密码对话框样式 */
.forgot-tip {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 12px 0 0 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-page {
    padding: 10px;
  }
  
  .login-container {
    grid-template-columns: 1fr;
    max-width: 400px;
    border-radius: 16px;
  }
  
  .brand-section {
    padding: 40px 30px;
  }
  
  .brand-content {
    max-width: none;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .brand-subtitle {
    font-size: 14px;
    margin-bottom: 30px;
  }
  
  .brand-features {
    gap: 12px;
  }
  
  .feature-item {
    font-size: 13px;
  }
  
  .form-section {
    padding: 40px 30px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .form-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 5px;
  }
  
  .brand-section {
    padding: 30px 20px;
  }
  
  .form-section {
    padding: 30px 20px;
  }
  
  .form-container {
    max-width: none;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}

/* 动画效果 */
.login-container {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand-features .feature-item {
  animation: fadeInLeft 0.6s ease-out;
  animation-fill-mode: both;
}

.brand-features .feature-item:nth-child(1) { animation-delay: 0.1s; }
.brand-features .feature-item:nth-child(2) { animation-delay: 0.2s; }
.brand-features .feature-item:nth-child(3) { animation-delay: 0.3s; }
.brand-features .feature-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>