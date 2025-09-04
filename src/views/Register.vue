<template>
  <div class="register-page">
    <div class="register-container">
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
              <ShieldIcon class="feature-icon" />
              <span>安全的数据保护</span>
            </div>
            <div class="feature-item">
              <CloudIcon class="feature-icon" />
              <span>多云存储选择</span>
            </div>
            <div class="feature-item">
              <ZapIcon class="feature-icon" />
              <span>快速上传体验</span>
            </div>
            <div class="feature-item">
              <UsersIcon class="feature-icon" />
              <span>专业团队支持</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">创建账户</h2>
            <p class="form-subtitle">填写信息完成注册</p>
          </div>

          <!-- 注册关闭提示 -->
          <div v-if="!registrationAllowed" class="registration-disabled-notice">
            <div class="notice-content">
              <LockIcon class="notice-icon" />
              <div class="notice-text">
                <h3>注册功能已关闭</h3>
                <p>系统管理员已关闭用户注册功能，如需账户请联系管理员</p>
              </div>
            </div>
            <div class="notice-actions">
              <t-button theme="default" @click="$router.push('/login')">
                返回登录
              </t-button>
            </div>
          </div>

          <t-form
            v-else
            ref="registerForm"
            :data="registerData"
            :rules="registerRules"
            layout="vertical"
            :colon="false"
            @submit="handleRegister"
          >
            <t-form-item label="用户名" name="username">
              <t-input
                v-model="registerData.username"
                placeholder="请输入用户名"
                size="large"
                :disabled="isLoading"
              >
                <template #prefix-icon>
                  <UserIcon class="input-icon" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item label="邮箱" name="email">
              <t-input
                v-model="registerData.email"
                placeholder="请输入邮箱地址"
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
                v-model="registerData.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :disabled="isLoading"
              >
                <template #prefix-icon>
                  <LockIcon class="input-icon" />
                </template>
              </t-input>
              <div class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.level"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.level">
                  {{ passwordStrength.text }}
                </span>
              </div>
            </t-form-item>

            <t-form-item label="确认密码" name="confirmPassword">
              <t-input
                v-model="registerData.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                :disabled="isLoading"
                @keyup.enter="handleRegister"
              >
                <template #prefix-icon>
                  <LockIcon class="input-icon" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item name="agreeTerms">
              <div class="form-agreements">
                <t-checkbox v-model="registerData.agreeTerms" :disabled="isLoading">
                  我已阅读并同意
                  <t-link theme="primary" @click="showTerms">
                    《服务条款》
                  </t-link>
                  和
                  <t-link theme="primary" @click="showPrivacy">
                    《隐私政策》
                  </t-link>
                </t-checkbox>
              </div>
            </t-form-item>

            <t-button
              theme="primary"
              size="large"
              block
              :loading="isLoading"
              :disabled="!registerData.agreeTerms"
              @click="handleRegister"
            >
              创建账户
            </t-button>
          </t-form>

          <div class="form-footer">
            <p class="login-prompt">
              已有账户？
              <t-link theme="primary" @click="goToLogin">
                立即登录
              </t-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务条款对话框 -->
    <t-dialog
      v-model:visible="termsVisible"
      header="服务条款"
      width="600px"
      :footer="false"
    >
      <div class="terms-content">
        <h4>1. 服务说明</h4>
        <p>本图床管理系统为用户提供图片存储、管理和分享服务。</p>
        
        <h4>2. 用户责任</h4>
        <p>用户应确保上传的内容合法合规，不得上传违法、有害或侵权内容。</p>
        
        <h4>3. 服务限制</h4>
        <p>我们保留对服务进行维护、升级和调整的权利。</p>
        
        <h4>4. 隐私保护</h4>
        <p>我们承诺保护用户隐私，不会未经授权分享用户信息。</p>
        
        <h4>5. 免责声明</h4>
        <p>用户使用本服务产生的任何损失，本平台不承担责任。</p>
      </div>
      <template #footer>
        <t-button theme="primary" @click="termsVisible = false">
          我已了解
        </t-button>
      </template>
    </t-dialog>

    <!-- 隐私政策对话框 -->
    <t-dialog
      v-model:visible="privacyVisible"
      header="隐私政策"
      width="600px"
      :footer="false"
    >
      <div class="privacy-content">
        <h4>1. 信息收集</h4>
        <p>我们仅收集提供服务所必需的用户信息，包括邮箱、用户名等。</p>
        
        <h4>2. 信息使用</h4>
        <p>收集的信息仅用于提供服务、改善用户体验和系统安全。</p>
        
        <h4>3. 信息保护</h4>
        <p>我们采用行业标准的安全措施保护用户信息安全。</p>
        
        <h4>4. 信息分享</h4>
        <p>除法律要求外，我们不会向第三方分享用户个人信息。</p>
        
        <h4>5. Cookie使用</h4>
        <p>我们使用Cookie来改善用户体验，用户可以选择禁用。</p>
      </div>
      <template #footer>
        <t-button theme="primary" @click="privacyVisible = false">
          我已了解
        </t-button>
      </template>
    </t-dialog>

    <!-- 邮箱验证对话框 -->
    <t-dialog
      v-model:visible="verificationVisible"
      header="邮箱验证"
      width="400px"
      :footer="false"
      :close-on-overlay-click="false"
    >
      <div class="verification-content">
        <div class="verification-icon">
          <MailIcon class="mail-icon" />
        </div>
        <h4 class="verification-title">验证邮件已发送</h4>
        <p class="verification-text">
          我们已向 <strong>{{ registerData.email }}</strong> 发送了验证邮件。
          请查收邮件并点击验证链接完成注册。
        </p>
        <div class="verification-actions">
          <t-button @click="resendVerification" :loading="isResending">
            重新发送
          </t-button>
          <t-button theme="primary" @click="goToLogin">
            去登录
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ImageIcon,
  ShieldIcon,
  CloudIcon,
  ZapIcon,
  UsersIcon,
  UserIcon,
  MailIcon,
  LockIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useSystemConfig } from '@/composables/useSystemConfig'
import { apiService } from '@/services/api'

const router = useRouter()
const { register, isLoading } = useAuth()
const { siteName, siteDescription } = useSystemConfig()

// 注册状态
const registrationAllowed = ref(true)

// 响应式数据
const isResending = ref(false)
const termsVisible = ref(false)
const privacyVisible = ref(false)
const verificationVisible = ref(false)

// 注册表单数据
const registerData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', type: 'error' },
    { min: 3, message: '用户名长度不能少于3位', type: 'error' },
    { max: 20, message: '用户名长度不能超过20位', type: 'error' },
    { 
      pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 
      message: '用户名只能包含字母、数字、下划线和中文', 
      type: 'error' 
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', type: 'error' },
    { 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: '请输入有效的邮箱地址', 
      type: 'error' 
    }
  ],
  password: [
    { required: true, message: '请输入密码', type: 'error' },
    { min: 6, message: '密码长度不能少于6位', type: 'error' },
    { 
      pattern: /^[a-zA-Z0-9]+$/, 
      message: '密码只能包含字母和数字', 
      type: 'error' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', type: 'error' },
    { 
      validator: (val: string) => val === registerData.password, 
      message: '两次输入的密码不一致', 
      type: 'error' 
    }
  ],
  agreeTerms: [
    { 
      validator: (val: boolean) => val === true, 
      message: '请同意服务条款和隐私政策', 
      type: 'error' 
    }
  ]
}

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerData.password
  if (!password) {
    return { level: 'weak', width: '0%', text: '' }
  }

  let score = 0
  let checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  score = Object.values(checks).filter(Boolean).length

  if (score < 2) {
    return { level: 'weak', width: '25%', text: '弱' }
  } else if (score < 4) {
    return { level: 'medium', width: '50%', text: '中等' }
  } else if (score < 5) {
    return { level: 'strong', width: '75%', text: '强' }
  } else {
    return { level: 'very-strong', width: '100%', text: '很强' }
  }
})

// 表单引用
const registerForm = ref()

// 处理注册
const handleRegister = async () => {
  // 表单验证
  const validateResult = await registerForm.value?.validate()
  if (validateResult !== true) {
    return
  }

  if (!registerData.agreeTerms) {
    MessagePlugin.warning('请先同意服务条款和隐私政策')
    return
  }

  const result = await register({
    username: registerData.username,
    email: registerData.email,
    password: registerData.password,
    confirmPassword: registerData.confirmPassword
  })

  if (result.success) {
    // 暂时直接跳转到登录页面，邮箱验证功能后续开发
    MessagePlugin.success('注册成功，请登录')
    router.push('/login')
  }
}

// 重新发送验证邮件
const resendVerification = async () => {
  isResending.value = true
  try {
    // 这里暂时显示提示，实际需要后端支持
    MessagePlugin.info('邮箱验证功能正在开发中')
  } catch (error: any) {
    console.error('重新发送验证邮件失败:', error)
    MessagePlugin.error('发送失败')
  } finally {
    isResending.value = false
  }
}

// 显示服务条款
const showTerms = () => {
  termsVisible.value = true
}

// 显示隐私政策
const showPrivacy = () => {
  privacyVisible.value = true
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 检查注册状态
const checkRegistrationStatus = async () => {
  try {
    const response = await apiService.getRegistrationStatus()
    if (response.success && response.data) {
      registrationAllowed.value = response.data.allowRegistration
    }
  } catch (error) {
    console.error('检查注册状态失败:', error)
    // 如果检查失败，默认允许注册
    registrationAllowed.value = true
  }
}

// 监听确认密码变化，重新验证
watch(() => registerData.password, () => {
  if (registerData.confirmPassword && registerForm.value) {
    // 触发确认密码字段的重新验证
    registerForm.value.validate(['confirmPassword'])
  }
})

// 生命周期
onMounted(() => {
  checkRegistrationStatus()
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 1000px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 700px;
}

/* 品牌区域样式 */
.brand-section {
  background: linear-gradient(135deg, var(--td-success-color) 0%, #00a870 100%);
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

/* 密码强度样式 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: var(--td-bg-color-component);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background-color: var(--td-error-color);
}

.strength-fill.medium {
  background-color: var(--td-warning-color);
}

.strength-fill.strong {
  background-color: var(--td-brand-color);
}

.strength-fill.very-strong {
  background-color: var(--td-success-color);
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  min-width: 30px;
}

.strength-text.weak {
  color: var(--td-error-color);
}

.strength-text.medium {
  color: var(--td-warning-color);
}

.strength-text.strong {
  color: var(--td-brand-color);
}

.strength-text.very-strong {
  color: var(--td-success-color);
}

.form-agreements {
  margin: 20px 0 32px;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
}

.login-prompt {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

/* 对话框内容样式 */
.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 4px;
}

.terms-content h4,
.privacy-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 20px 0 8px 0;
}

.terms-content h4:first-child,
.privacy-content h4:first-child {
  margin-top: 0;
}

.terms-content p,
.privacy-content p {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

/* 邮箱验证对话框样式 */
.verification-content {
  text-align: center;
  padding: 20px 0;
}

.verification-icon {
  width: 80px;
  height: 80px;
  background-color: var(--td-success-color-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.mail-icon {
  width: 40px;
  height: 40px;
  color: var(--td-success-color);
}

.verification-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 16px 0;
}

.verification-text {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.verification-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 注册关闭提示样式 */
.registration-disabled-notice {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
}

.notice-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.notice-icon {
  width: 64px;
  height: 64px;
  color: var(--td-warning-color);
  margin-bottom: 16px;
}

.notice-text h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.notice-text p {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

.notice-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-page {
    padding: 10px;
  }
  
  .register-container {
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
  .register-page {
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
  
  .verification-actions {
    flex-direction: column;
  }
}

/* 动画效果 */
.register-container {
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