<template>
  <div class="verify-page">
    <div class="verify-container">
      <div class="verify-card">
        <!-- 加载中 -->
        <div v-if="status === 'loading'" class="status-content">
          <t-loading size="large" />
          <p class="status-text">正在验证邮箱...</p>
        </div>

        <!-- 验证成功 -->
        <div v-else-if="status === 'success'" class="status-content">
          <div class="status-icon success">
            <CheckCircleIcon :size="64" />
          </div>
          <h2 class="status-title">验证成功！</h2>
          <p class="status-desc">您的邮箱已成功验证，现在可以登录使用了。</p>
          <t-button theme="primary" size="large" @click="goToLogin">
            去登录
          </t-button>
        </div>

        <!-- 验证失败 -->
        <div v-else-if="status === 'error'" class="status-content">
          <div class="status-icon error">
            <XCircleIcon :size="64" />
          </div>
          <h2 class="status-title">验证失败</h2>
          <p class="status-desc">{{ errorMessage }}</p>
          <div class="action-buttons">
            <t-button theme="primary" size="large" @click="goToLogin">
              去登录
            </t-button>
            <t-button variant="outline" size="large" @click="goToRegister">
              重新注册
            </t-button>
          </div>
        </div>

        <!-- 缺少token -->
        <div v-else-if="status === 'invalid'" class="status-content">
          <div class="status-icon warning">
            <AlertCircleIcon :size="64" />
          </div>
          <h2 class="status-title">无效链接</h2>
          <p class="status-desc">验证链接缺少必要参数，请检查邮件中的链接是否完整。</p>
          <t-button theme="primary" size="large" @click="goToLogin">
            去登录
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from 'lucide-vue-next'
import { apiService } from '@/services/api'

const route = useRoute()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error' | 'invalid'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    status.value = 'invalid'
    return
  }

  try {
    const result = await apiService.verifyEmail(token)
    if (result.success) {
      status.value = 'success'
    } else {
      status.value = 'error'
      errorMessage.value = result.message || '验证失败，链接可能已过期'
    }
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error.response?.data?.message || '验证失败，请稍后重试'
  }
})

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.verify-container {
  width: 100%;
  max-width: 480px;
}

.verify-card {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success {
  background: #e8f5e9;
  color: #00b578;
}

.status-icon.error {
  background: #ffebee;
  color: #f53f3f;
}

.status-icon.warning {
  background: #fff3e0;
  color: #ff7d00;
}

.status-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.status-desc {
  font-size: 14px;
  color: #86909c;
  line-height: 1.6;
  margin: 0;
  max-width: 320px;
}

.status-text {
  font-size: 14px;
  color: #4e5969;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 480px) {
  .verify-card {
    padding: 32px 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons .t-button {
    width: 100%;
  }
}
</style>
