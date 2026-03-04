<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>安全管理</h1>
      <p class="subtitle">配置系统安全策略和访问控制</p>
    </div>

    <div class="options-list">
      <div class="option-card">
        <div class="option-main">
          <div class="option-icon green">
            <MailIcon :size="22" />
          </div>
          <div class="option-content">
            <h3>邮箱验证</h3>
            <p>新用户注册需要验证邮箱地址，提高账号安全性</p>
          </div>
        </div>
        <div class="option-control">
          <t-switch v-model="config.requireEmailVerification" size="large" />
        </div>
      </div>

      <div class="option-card">
        <div class="option-main">
          <div class="option-icon orange">
            <ClockIcon :size="22" />
          </div>
          <div class="option-content">
            <h3>登录会话时长</h3>
            <p>用户登录状态保持时间，超过将自动退出</p>
          </div>
        </div>
        <div class="option-control">
          <div class="number-input">
            <t-input-number v-model="config.jwtExpiration" :min="1" :max="720" />
            <span class="unit">小时</span>
          </div>
        </div>
      </div>

      <div class="option-card">
        <div class="option-main">
          <div class="option-icon red">
            <LockIcon :size="22" />
          </div>
          <div class="option-content">
            <h3>最大登录尝试</h3>
            <p>超过次数将暂时锁定账户，防止暴力破解</p>
          </div>
        </div>
        <div class="option-control">
          <div class="number-input">
            <t-input-number v-model="config.maxLoginAttempts" :min="3" :max="20" />
            <span class="unit">次</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <t-button theme="primary" size="large" :loading="saving" @click="save">保存安全设置</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { MailIcon, ClockIcon, LockIcon } from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const saving = ref(false)
const config = reactive({
  requireEmailVerification: false,
  jwtExpiration: 24,
  maxLoginAttempts: 5
})

// 加载安全配置
const loadConfig = async () => {
  try {

    const res = await apiService.getAllSystemConfig()

    if (res.success && res.data) {
      // 安全配置在 security 分组下
      const securityConfig = res.data.security || {}
      
      config.requireEmailVerification = securityConfig.requireEmailVerification ?? false
      config.jwtExpiration = securityConfig.jwtExpiration ?? 24
      config.maxLoginAttempts = securityConfig.maxLoginAttempts ?? 5
    }
  } catch (error) {
    console.error('加载安全配置失败', error)
    MessagePlugin.error('加载安全配置失败')
  }
}

const save = async () => {
  saving.value = true
  try {
    // 先获取现有配置进行合并
    const res = await apiService.getAllSystemConfig()
    const existingSecurity = res.data?.security || {}
    
    // 保存到 security 分组（使用驼峰命名）
    const securityData = {
      requireEmailVerification: config.requireEmailVerification,
      jwtExpiration: config.jwtExpiration,
      maxLoginAttempts: config.maxLoginAttempts
    }
    await apiService.setConfigItem('security', securityData, '安全配置')
    
    MessagePlugin.success('保存成功')
    // 保存成功后重新加载配置
    await loadConfig()
  } catch (error: any) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.admin-page {
  max-width: 800px;
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

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.option-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e6eb;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.option-card:hover {
  border-color: #c9cdd4;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.option-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.option-icon.green { background: linear-gradient(135deg, #00b578, #00d68a); }
.option-icon.blue { background: linear-gradient(135deg, #0052d9, #1890ff); }
.option-icon.orange { background: linear-gradient(135deg, #ff7d00, #ff9a44); }
.option-icon.red { background: linear-gradient(135deg, #f53f3f, #ff7d7d); }

.option-content h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.option-content p {
  font-size: 13px;
  color: #86909c;
  margin: 0;
}

.option-control {
  display: flex;
  align-items: center;
}

.number-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-size: 14px;
  color: #4e5969;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}
</style>
