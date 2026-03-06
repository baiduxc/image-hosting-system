<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>系统设置</h1>
      <p class="subtitle">配置网站基本信息和上传参数</p>
    </div>

    <div class="settings-container">
      <!-- Site Info Card -->
      <div class="setting-card">
        <div class="card-header">
          <div class="header-icon blue">
            <GlobeIcon :size="20" />
          </div>
          <div class="header-text">
            <h3>网站信息</h3>
            <p>配置网站名称、Logo等基本信息</p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-item">
              <label>网站标题</label>
              <t-input v-model="site.site_title" placeholder="摆渡云图" />
            </div>
            <div class="form-item">
              <label>网站关键词</label>
              <t-input v-model="site.site_keywords" placeholder="图床,图片存储" />
            </div>
            <div class="form-item full">
              <label>网站描述</label>
              <t-textarea v-model="site.site_description" placeholder="专业的图片存储和管理平台" :rows="2" />
            </div>
            <div class="form-item full">
              <label>网站 Logo URL</label>
              <t-input v-model="site.site_logo" placeholder="https://example.com/logo.png" />
            </div>
            <div class="form-item full">
              <div class="switch-wrap">
                <div class="switch-label">
                  <span>开放注册</span>
                  <span class="switch-desc">允许新用户自行注册账号</span>
                </div>
                <t-switch v-model="site.allow_register" size="large" />
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <t-button theme="primary" :loading="saving" @click="saveSite">保存更改</t-button>
        </div>
      </div>

      <!-- Upload Settings Card -->
      <div class="setting-card">
        <div class="card-header">
          <div class="header-icon green">
            <UploadIcon :size="20" />
          </div>
          <div class="header-text">
            <h3>上传设置</h3>
            <p>配置文件上传限制和压缩选项</p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-item">
              <label>最大文件大小 (MB)</label>
              <t-input-number v-model="upload.max_file_size" :min="1" :max="100" />
            </div>
            <div class="form-item">
              <label>批量上传数量</label>
              <t-input-number v-model="upload.max_batch_count" :min="1" :max="50" />
            </div>
            <div class="form-item">
              <label>压缩质量 (%)</label>
              <div class="slider-wrap">
                <t-slider v-model="upload.compress_quality" :min="10" :max="100" />
                <span class="slider-value">{{ upload.compress_quality }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <t-button theme="primary" :loading="savingUpload" @click="saveUpload">保存更改</t-button>
        </div>
      </div>

      <!-- Announcement Settings Card -->
      <div class="setting-card">
        <div class="card-header">
          <div class="header-icon orange">
            <BellIcon :size="20" />
          </div>
          <div class="header-text">
            <h3>系统公告</h3>
            <p>配置网站公告，支持 Markdown 格式</p>
          </div>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-item full">
              <div class="switch-wrap">
                <div class="switch-label">
                  <span>启用公告</span>
                  <span class="switch-desc">开启后用户登录后将看到公告弹窗</span>
                </div>
                <t-switch v-model="announcement.enabled" size="large" />
              </div>
            </div>
            <div class="form-item full" v-if="announcement.enabled">
              <label>公告内容（支持 Markdown）</label>
              <t-textarea 
                v-model="announcement.content" 
                placeholder="请输入公告内容，支持 Markdown 格式&#10;例如：&#10;## 系统维护通知&#10;系统将于今晚 22:00-24:00 进行维护升级"
                :rows="8"
              />
              <div class="markdown-preview" v-if="announcement.content">
                <label>预览：</label>
                <div class="preview-content" v-html="renderMarkdownPreview(announcement.content)"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <t-button theme="primary" :loading="savingAnnouncement" @click="saveAnnouncement">保存更改</t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { GlobeIcon, UploadIcon, BellIcon } from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const saving = ref(false)
const savingUpload = ref(false)
const savingAnnouncement = ref(false)

const site = reactive({
  site_title: '',
  site_logo: '',
  site_description: '',
  site_keywords: '',
  allow_register: true
})

const upload = reactive({
  max_file_size: 10,
  max_batch_count: 20,
  compress_quality: 80
})

const announcement = reactive({
  content: '',
  enabled: false
})

// 加载网站信息（使用公开接口，返回下划线命名）
const loadSiteConfig = async () => {
  try {
    const res = await apiService.getSystemConfig()

    if (res.success && res.data) {
      // 公开接口返回下划线命名
      site.site_title = res.data.site_title || ''
      site.site_logo = res.data.site_logo || ''
      site.site_description = res.data.site_description || ''
      site.site_keywords = res.data.site_keywords || ''
    }
  } catch (error) {
    console.error('加载网站配置失败', error)
    MessagePlugin.error('加载配置失败')
  }
}

// 加载系统基础配置（包括开放注册）
const loadSystemConfig = async () => {
  try {
    const res = await apiService.getAllSystemConfig()

    if (res.success && res.data) {
      const systemConfig = res.data.system || {}
      site.allow_register = systemConfig.allowRegistration ?? true
    }
  } catch (error) {
    console.error('加载系统配置失败', error)
  }
}

// 加载上传设置
const loadUploadConfig = async () => {
  try {
    const res = await apiService.getAllSystemConfig()

    if (res.success && res.data) {
      // 上传配置在 system 分组下
      const systemConfig = res.data.system || res.data
      upload.max_file_size = systemConfig.maxFileSize || systemConfig.max_file_size || 10
      upload.max_batch_count = systemConfig.maxBatchCount || systemConfig.max_batch_count || 20
      upload.compress_quality = systemConfig.compressQuality || systemConfig.compress_quality || 80
    }
  } catch (error) {
    console.error('加载上传配置失败', error)
  }
}

// 加载公告配置
const loadAnnouncementConfig = async () => {
  try {
    const res = await apiService.getAllSystemConfig()

    if (res.success && res.data) {
      const systemConfig = res.data.system || res.data
      announcement.content = systemConfig.announcement || ''
      announcement.enabled = systemConfig.announcementEnabled || false
    }
  } catch (error) {
    console.error('加载公告配置失败', error)
  }
}

// 简单的 Markdown 预览渲染
const renderMarkdownPreview = (content: string): string => {
  if (!content) return ''
  // 简单的 Markdown 转换
  let html = content
    // 转义 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 换行
    .replace(/\n/g, '<br>')
  return html
}

const saveSite = async () => {
  saving.value = true
  try {
    // 先获取现有 system 配置进行合并（只保留非表单字段）
    const res = await apiService.getAllSystemConfig()
    const existing = res.data?.system || {}
    
    // 提取非表单管理的字段（上传设置等），排除表单管理的字段避免重复
    const { 
      siteName, siteLogo, siteDescription, siteKeywords, siteIcon, allowRegistration,
      ...keepFields 
    } = existing
    
    // 转换为后端存储用的驼峰命名，只提交需要的字段
    const saveData = {
      // 保留上传相关配置和其他非表单字段
      ...keepFields,
      // 网站信息（驼峰命名）
      siteName: site.site_title,
      siteLogo: site.site_logo,
      siteDescription: site.site_description,
      siteKeywords: site.site_keywords,
      allowRegistration: site.allow_register
    }
    await apiService.setConfigItem('system', saveData, '系统基础配置')
    MessagePlugin.success('保存成功')
    // 保存成功后重新加载配置
    await loadSiteConfig()
    await loadSystemConfig()
  } catch (error: any) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const saveUpload = async () => {
  savingUpload.value = true
  try {
    // 保存到 system 分组，需要和后端现有配置合并
    const res = await apiService.getAllSystemConfig()
    const existing = res.data?.system || {}
    
    // 提取非表单管理的字段（网站信息等），排除表单管理的字段避免重复
    const { 
      maxFileSize, maxBatchCount, compressQuality, allowedTypes, autoCompress, generateThumbnail,
      ...keepFields 
    } = existing
    
    const saveData = {
      // 保留网站信息和其他非表单字段
      ...keepFields,
      // 上传设置（驼峰命名）
      maxFileSize: upload.max_file_size,
      maxBatchCount: upload.max_batch_count,
      compressQuality: upload.compress_quality
    }
    await apiService.setConfigItem('system', saveData, '系统基础配置')
    MessagePlugin.success('保存成功')
    // 保存成功后重新加载配置
    await loadUploadConfig()
  } catch (error: any) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    savingUpload.value = false
  }
}

const saveAnnouncement = async () => {
  savingAnnouncement.value = true
  try {
    // 保存到 system 分组，需要和后端现有配置合并
    const res = await apiService.getAllSystemConfig()
    const existing = res.data?.system || {}
    
    // 提取非表单管理的字段，排除公告字段避免重复
    const { 
      announcement: _, announcementEnabled: __,
      ...keepFields 
    } = existing
    
    const saveData = {
      // 保留其他配置
      ...keepFields,
      // 公告配置
      announcement: announcement.content,
      announcementEnabled: announcement.enabled
    }
    await apiService.setConfigItem('system', saveData, '系统基础配置')
    MessagePlugin.success('保存成功')
    // 保存成功后重新加载配置
    await loadAnnouncementConfig()
  } catch (error: any) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    savingAnnouncement.value = false
  }
}

onMounted(() => {
  loadSiteConfig()
  loadSystemConfig()
  loadUploadConfig()
  loadAnnouncementConfig()
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

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.header-icon.blue { background: linear-gradient(135deg, #0052d9, #1890ff); }
.header-icon.green { background: linear-gradient(135deg, #00b578, #00d68a); }
.header-icon.orange { background: linear-gradient(135deg, #ff7d00, #ff9a2e); }

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
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item.full {
  grid-column: span 2;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
}

.slider-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-wrap :deep(.t-slider) {
  flex: 1;
}

.slider-value {
  font-size: 13px;
  color: #86909c;
  min-width: 40px;
  text-align: right;
}

.switch-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
}

.switch-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.switch-label span:first-child {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.switch-desc {
  font-size: 13px;
  color: #86909c;
}

.markdown-preview {
  margin-top: 12px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
}

.markdown-preview label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.preview-content {
  font-size: 14px;
  line-height: 1.6;
  color: #1d2129;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin: 12px 0 8px;
  color: #1d2129;
}

.preview-content h1 {
  font-size: 18px;
}

.preview-content h2 {
  font-size: 16px;
}

.preview-content h3 {
  font-size: 14px;
}

.preview-content strong {
  font-weight: 600;
}

.preview-content em {
  font-style: italic;
}

.preview-content code {
  background: #e8e8e8;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.preview-content a {
  color: #0052d9;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.preview-content br {
  display: block;
  margin: 4px 0;
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
