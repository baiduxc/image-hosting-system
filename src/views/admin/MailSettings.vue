<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>邮件服务</h1>
      <p class="subtitle">配置 SMTP 邮件服务器用于发送通知和验证邮件</p>
    </div>

    <div class="setting-card">
      <div class="card-header">
        <div class="header-icon purple">
          <MailIcon :size="20" />
        </div>
        <div class="header-text">
          <h3>SMTP 配置</h3>
          <p>配置邮件服务器连接参数</p>
        </div>
      </div>
      
      <div class="card-body">
        <div class="form-grid three-col">
          <div class="form-item">
            <label>SMTP 服务器</label>
            <t-input v-model="form.smtp_host" placeholder="smtp.gmail.com" />
          </div>
          <div class="form-item">
            <label>SMTP 端口</label>
            <t-input-number v-model="form.smtp_port" :min="1" :max="65535" />
          </div>
          <div class="form-item">
            <label>加密方式</label>
            <t-select v-model="form.smtp_secure">
              <t-option label="TLS/SSL" :value="true" />
              <t-option label="无加密" :value="false" />
            </t-select>
          </div>
          
          <div class="form-item">
            <label>SMTP 用户名</label>
            <t-input v-model="form.smtp_user" placeholder="邮箱地址" />
          </div>
          <div class="form-item">
            <label>SMTP 密码</label>
            <t-input v-model="form.smtp_pass" type="password" placeholder="授权码或密码" />
          </div>
          <div class="form-item">
            <label>发件人名称</label>
            <t-input v-model="form.from_name" placeholder="图床系统" />
          </div>
          
          <div class="form-item full">
            <label>发件人邮箱</label>
            <t-input v-model="form.from_email" placeholder="noreply@example.com" />
          </div>
        </div>
      </div>
      
      <div class="card-footer">
        <t-space>
          <t-button variant="outline" :loading="testing" @click="handleTest">发送测试邮件</t-button>
          <t-button theme="primary" :loading="saving" @click="handleSave">保存配置</t-button>
        </t-space>
      </div>
    </div>

    <t-dialog v-model:visible="testDialog" header="发送测试邮件" @confirm="sendTestMail">
      <t-input v-model="testEmail" placeholder="请输入接收测试邮件的邮箱地址" />
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { MailIcon } from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const saving = ref(false)
const testing = ref(false)
const testDialog = ref(false)
const testEmail = ref('')

const form = reactive({
  smtp_host: '',
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: '',
  smtp_pass: '',
  from_email: '',
  from_name: '图床系统'
})

// 加载邮件配置
const loadConfig = async () => {
  try {

    const res = await apiService.getAllSystemConfig()

    if (res.success && res.data) {
      // 邮件配置在 email 分组下（后端用驼峰命名）
      const emailConfig = res.data.email || {}
      form.smtp_host = emailConfig.smtpHost || ''
      form.smtp_port = emailConfig.smtpPort || 587
      form.smtp_secure = emailConfig.smtpSecure || false
      form.smtp_user = emailConfig.smtpUser || ''
      form.smtp_pass = emailConfig.smtpPass || ''
      form.from_email = emailConfig.fromEmail || ''
      form.from_name = emailConfig.fromName || '图床系统'
    }
  } catch (error) {
    console.error('加载邮件配置失败', error)
    MessagePlugin.error('加载邮件配置失败')
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    // 转换回后端用的驼峰命名
    const saveData = {
      smtpHost: form.smtp_host,
      smtpPort: form.smtp_port,
      smtpSecure: form.smtp_secure,
      smtpUser: form.smtp_user,
      smtpPass: form.smtp_pass,
      fromEmail: form.from_email,
      fromName: form.from_name
    }
    await apiService.setConfigItem('email', saveData, '邮件配置')
    MessagePlugin.success('保存成功')
    // 保存成功后重新加载配置
    await loadConfig()
  } catch (error: any) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleTest = () => {
  testEmail.value = ''
  testDialog.value = true
}

const sendTestMail = async () => {
  if (!testEmail.value) {
    MessagePlugin.warning('请输入邮箱地址')
    return
  }
  testing.value = true
  try {
    const res = await apiService.testEmailConnection({ 
      ...form, 
      test_email: testEmail.value 
    })
    MessagePlugin[res.success ? 'success' : 'error'](res.message || '测试完成')
    if (res.success) testDialog.value = false
  } catch (error: any) {
    MessagePlugin.error('发送失败')
  } finally {
    testing.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.admin-page {
  max-width: 900px;
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

.setting-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e6eb;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.header-icon.purple {
  background: linear-gradient(135deg, #722ed1, #a854f5);
}

.header-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.header-text p {
  font-size: 13px;
  color: #86909c;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 16px 20px;
  background: #f7f8fa;
  border-top: 1px solid #e5e6eb;
  display: flex;
  justify-content: flex-end;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item.full {
  grid-column: span 3;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-item.full {
    grid-column: span 1;
  }
}
</style>
