<template>
  <div class="login-container">
    <!-- 背景图片层 -->
    <div class="background-layer">
      <img 
        :src="backgroundImage" 
        alt="Background" 
        class="background-image"
        @error="handleImageError"
      />
      <div class="background-overlay"></div>
    </div>
    
    <!-- 登录表单容器 -->
    <div class="login-wrapper">
      <div class="login-card">
        <!-- 头部Logo和标题 -->
        <div class="login-header">
          <div class="logo-container">
            <img src="/logo.svg" alt="Logo" class="logo-image" />
            <h1 class="system-title">摆渡云后台</h1>
          </div>
          <p class="welcome-text">欢迎回来，请登录您的账户</p>
        </div>
        
        <!-- 登录表单 -->
        <a-form
          :model="loginForm"
          :rules="rules"
          @submit="handleLogin"
          layout="vertical"
          class="login-form"
        >
          <a-form-item field="username" label="用户名" class="form-item">
            <a-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              allow-clear
              class="input-field"
            >
              <template #prefix>
                <icon-user class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item field="password" label="密码" class="form-item">
            <a-input-password
              v-model="loginForm.password"
              placeholder="请输入密码"
              size="large"
              allow-clear
              class="input-field"
            >
              <template #prefix>
                <icon-lock class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item class="form-item">
            <div class="login-options">
              <a-checkbox v-model="loginForm.remember" class="remember-checkbox">
                记住密码
              </a-checkbox>
              <a-link class="forgot-link">忘记密码？</a-link>
            </div>
          </a-form-item>
          
          <a-form-item class="form-item">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              long
              :loading="loading"
              class="login-button"
            >
              <template #icon v-if="!loading">
                <icon-right />
              </template>
              {{ loading ? '登录中...' : '立即登录' }}
            </a-button>
          </a-form-item>
        </a-form>
        
        <!-- 底部信息 -->
        <div class="login-footer">
          <div class="demo-info">
            <a-tag color="blue" size="small">作者QQ:</a-tag>
            <span class="demo-text">515236498</span>
          </div>
          <div class="copyright">
            © 2024 摆渡云后台管理系统. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="decoration-elements">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconLock, IconRight } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '../stores/user'

export default {
  name: 'Login',
  components: {
    IconUser,
    IconLock,
    IconRight
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const loading = ref(false)
    const backgroundImage = ref('https://api.8yun.cc/api/img')
    
    const loginForm = reactive({
      username: '',
      password: '',
      remember: false
    })
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名' },
        { minLength: 3, message: '用户名至少3个字符' }
      ],
      password: [
        { required: true, message: '请输入密码' },
        { minLength: 6, message: '密码至少6个字符' }
      ]
    }
    
    // 处理背景图片加载错误
    const handleImageError = () => {
      // 如果随机图片加载失败，使用备用图片
      backgroundImage.value = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    }
    
    const handleLogin = async (data) => {
      if (!data.errors) {
        loading.value = true
        
        try {
          // 使用用户store进行登录
          const response = await userStore.login({
            username: loginForm.username,
            password: loginForm.password,
            remember: loginForm.remember
          })
          
          if (response && response.token) {
            Message.success('登录成功！')
            
            // 跳转到仪表盘
            try {
              await router.push('/dashboard')
            } catch (routerError) {
              console.error('路由跳转失败:', routerError)
              Message.error('页面跳转失败，请手动刷新页面')
            }
          } else {
            console.warn('登录响应格式异常:', response)
            Message.error('登录响应格式异常，请联系管理员！')
          }
          
        } catch (error) {
          console.error('登录失败:', error)
          
          if (error.message) {
            Message.error(error.message)
          } else {
            Message.error('登录失败，请重试！')
          }
        } finally {
          loading.value = false
        }
      }
    }
    
    // 组件挂载时预加载背景图片
    onMounted(() => {
      const img = new Image()
      img.onload = () => {
        // 图片加载成功
      }
      img.onerror = handleImageError
      img.src = backgroundImage.value
    })
    
    return {
      loginForm,
      rules,
      loading,
      backgroundImage,
      handleLogin,
      handleImageError
    }
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景图片层 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

/* 登录表单容器 */
.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
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

/* 头部样式 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-image {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.system-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  margin: 0;
  color: #666;
  font-size: 16px;
  font-weight: 400;
}

/* 表单样式 */
.login-form {
  margin-bottom: 32px;
}

.form-item {
  margin-bottom: 24px;
}

.form-item :deep(.arco-form-item-label) {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-field {
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
}

.input-field:hover {
  border-color: #1890ff;
}

.input-field:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.input-icon {
  color: #999;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.remember-checkbox {
  color: #666;
}

.forgot-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  color: #40a9ff;
}

.login-button {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 底部样式 */
.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.demo-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.demo-text {
  color: #666;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.copyright {
  color: #999;
  font-size: 12px;
}

/* 装饰元素 */
.decoration-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-wrapper {
    max-width: 100%;
    padding: 16px;
  }
  
  .login-card {
    padding: 32px 24px;
    border-radius: 16px;
  }
  
  .system-title {
    font-size: 24px;
  }
  
  .welcome-text {
    font-size: 14px;
  }
  
  .floating-shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 20px;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .logo-image {
    margin-right: 0;
  }
  
  .demo-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 