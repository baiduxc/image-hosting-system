<template>
  <div class="site-config-page">
    <div class="page-header">
      <h1>站点配置</h1>
      <p>管理网站的基本信息和系统参数</p>
    </div>
    
    <a-card class="config-card">
      <a-spin :loading="dataLoading" tip="正在加载配置数据...">
        <a-tabs default-active-key="basic" type="line">
          <!-- 基本信息 -->
          <a-tab-pane key="basic" title="基本信息">
            <a-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              layout="vertical"
              @submit="handleSaveBasic"
            >
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="name" label="网站名称">
                    <a-input
                      v-model="basicForm.name"
                      placeholder="请输入网站名称"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="title" label="网站标题">
                    <a-input
                      v-model="basicForm.title"
                      placeholder="请输入网站标题"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item field="url" label="网站地址">
                <a-input
                  v-model="basicForm.url"
                  placeholder="请输入网站地址，如：https://example.com"
                />
              </a-form-item>
              

              
              <a-form-item field="description" label="网站描述">
                <a-textarea
                  v-model="basicForm.description"
                  placeholder="请输入网站描述"
                  :rows="4"
                />
              </a-form-item>
              
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="keywords" label="网站关键词">
                    <a-input
                      v-model="basicForm.keywords"
                      placeholder="请输入网站关键词，用逗号分隔"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="copyright" label="版权信息">
                    <a-input
                      v-model="basicForm.copyright"
                      placeholder="请输入版权信息，如：© 2024 通用摆渡云后台管理系统"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item field="logo" label="网站Logo">
                <a-upload
                  :action="uploadUrl"
                  :file-list="logoFileList"
                  :show-file-list="false"
                  @change="handleLogoChange"
                  accept="image/*"
                  :headers="uploadHeaders"
                >
                  <template #upload-button>
                    <div class="upload-area">
                      <div v-if="basicForm.logo" class="logo-preview">
                        <img :src="basicForm.logo" alt="Logo" />
                      </div>
                      <div v-else class="upload-placeholder">
                        <icon-plus />
                        <div>上传Logo</div>
                      </div>
                    </div>
                  </template>
                </a-upload>
              </a-form-item>
              
              <a-form-item field="icp" label="ICP备案号">
                <a-input
                  v-model="basicForm.icp"
                  placeholder="请输入ICP备案号"
                />
              </a-form-item>
              
              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="basicLoading">
                  保存基本信息
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          
          <!-- SEO设置 -->
          <a-tab-pane key="seo" title="SEO设置">
            <a-form
              ref="seoFormRef"
              :model="seoForm"
              :rules="seoRules"
              layout="vertical"
              @submit="handleSaveSeo"
            >
              <a-form-item field="seo_title" label="网站标题">
                <a-input
                  v-model="seoForm.seo_title"
                  placeholder="请输入网站标题"
                />
              </a-form-item>
              
              <a-form-item field="seo_keywords" label="关键词">
                <a-input
                  v-model="seoForm.seo_keywords"
                  placeholder="请输入关键词，用逗号分隔"
                />
              </a-form-item>
              
              <a-form-item field="seo_description" label="网站描述">
                <a-textarea
                  v-model="seoForm.seo_description"
                  placeholder="请输入网站描述"
                  :rows="4"
                />
              </a-form-item>
              
              <a-form-item field="google_analytics_id" label="Google Analytics ID">
                <a-input
                  v-model="seoForm.google_analytics_id"
                  placeholder="请输入Google Analytics ID"
                />
              </a-form-item>
              
              <a-form-item field="baidu_statistics_code" label="百度统计代码">
                <a-textarea
                  v-model="seoForm.baidu_statistics_code"
                  placeholder="请输入百度统计代码"
                  :rows="3"
                />
              </a-form-item>
              
              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="seoLoading">
                  保存SEO设置
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          
          <!-- 系统参数 -->
          <a-tab-pane key="system" title="系统参数">
            <a-form
              ref="systemFormRef"
              :model="systemForm"
              layout="vertical"
              @submit="handleSaveSystem"
            >
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="user_register_enabled" label="用户注册">
                    <a-switch
                      v-model="systemForm.user_register_enabled"
                      :checked-value="1"
                      :unchecked-value="0"
                      checked-text="开启"
                      unchecked-text="关闭"
                    />
                    <div class="form-help">是否允许用户注册</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="email_verify_enabled" label="邮箱验证">
                    <a-switch
                      v-model="systemForm.email_verify_enabled"
                      :checked-value="1"
                      :unchecked-value="0"
                      checked-text="开启"
                      unchecked-text="关闭"
                    />
                    <div class="form-help">注册时是否需要邮箱验证</div>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="maintenance_mode" label="维护模式">
                    <a-switch
                      v-model="systemForm.maintenance_mode"
                      :checked-value="1"
                      :unchecked-value="0"
                      checked-text="开启"
                      unchecked-text="关闭"
                    />
                    <div class="form-help">开启后网站将显示维护页面</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="session_expire_time" label="会话过期时间(分钟)">
                    <a-input-number
                      v-model="systemForm.session_expire_time"
                      :min="1"
                      :max="1440"
                      placeholder="请输入会话过期时间"
                    />
                    <div class="form-help">用户登录会话的过期时间</div>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="upload_max_size" label="上传文件大小限制(MB)">
                    <a-input-number
                      v-model="systemForm.upload_max_size"
                      :min="1"
                      :max="100"
                      placeholder="请输入文件大小限制"
                    />
                    <div class="form-help">单个文件的最大上传大小</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="allowed_file_types" label="允许上传的文件类型">
                    <a-select
                      v-model="systemForm.allowed_file_types"
                      multiple
                      placeholder="请选择允许的文件类型"
                      :options="fileTypeOptions"
                    />
                    <div class="form-help">选择允许上传的文件类型</div>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="24">
                <a-col :span="8">
                  <a-form-item field="timezone" label="时区设置">
                    <a-select
                      v-model="systemForm.timezone"
                      placeholder="请选择时区"
                    >
                      <a-option value="Asia/Shanghai">Asia/Shanghai</a-option>
                      <a-option value="Asia/Beijing">Asia/Beijing</a-option>
                      <a-option value="UTC">UTC</a-option>
                      <a-option value="America/New_York">America/New_York</a-option>
                      <a-option value="Europe/London">Europe/London</a-option>
                    </a-select>
                    <div class="form-help">系统默认时区</div>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item field="date_format" label="日期格式">
                    <a-select
                      v-model="systemForm.date_format"
                      placeholder="请选择日期格式"
                    >
                      <a-option value="Y-m-d H:i:s">Y-m-d H:i:s</a-option>
                      <a-option value="Y/m/d H:i:s">Y/m/d H:i:s</a-option>
                      <a-option value="m/d/Y H:i:s">m/d/Y H:i:s</a-option>
                      <a-option value="d/m/Y H:i:s">d/m/Y H:i:s</a-option>
                    </a-select>
                    <div class="form-help">系统日期显示格式</div>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item field="page_size" label="分页大小">
                    <a-input-number
                      v-model="systemForm.page_size"
                      :min="10"
                      :max="100"
                      :step="5"
                      placeholder="请输入分页大小"
                    />
                    <div class="form-help">列表页面默认分页大小</div>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="systemLoading">
                  保存系统参数
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          
          <!-- 邮件配置 -->
          <a-tab-pane key="email" title="邮件配置">
            <a-form
              ref="emailFormRef"
              :model="emailForm"
              :rules="emailRules"
              layout="vertical"
              @submit="handleSaveEmail"
            >
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="smtp_host" label="SMTP服务器">
                    <a-input
                      v-model="emailForm.smtp_host"
                      placeholder="请输入SMTP服务器地址"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="smtp_port" label="SMTP端口">
                    <a-input-number
                      v-model="emailForm.smtp_port"
                      :min="1"
                      :max="65535"
                      placeholder="请输入SMTP端口"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="smtp_username" label="SMTP用户名">
                    <a-input
                      v-model="emailForm.smtp_username"
                      placeholder="请输入SMTP用户名"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="smtp_password" label="SMTP密码">
                    <a-input-password
                      v-model="emailForm.smtp_password"
                      placeholder="请输入SMTP密码"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item field="smtp_encryption" label="加密方式">
                    <a-select
                      v-model="emailForm.smtp_encryption"
                      placeholder="请选择加密方式"
                    >
                      <a-option value="tls">TLS</a-option>
                      <a-option value="ssl">SSL</a-option>
                      <a-option value="">无加密</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item field="sender_name" label="发件人名称">
                    <a-input
                      v-model="emailForm.sender_name"
                      placeholder="请输入发件人名称"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item field="sender_email" label="发件人邮箱">
                <a-input
                  v-model="emailForm.sender_email"
                  placeholder="请输入发件人邮箱"
                />
              </a-form-item>
              
              <a-form-item>
                <a-space>
                  <a-button type="primary" html-type="submit" :loading="emailLoading">
                    保存邮件配置
                  </a-button>
                  <a-button type="outline" @click="handleTestEmail">
                    发送测试邮件
                  </a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </a-card>
    
    <!-- 测试邮件弹窗 -->
    <a-modal
      v-model:visible="testEmailVisible"
      title="发送测试邮件"
      :ok-loading="testEmailLoading"
      @ok="handleSendTestEmail"
      @cancel="() => { testEmailVisible = false }"
    >
      <a-form :model="{ test_email: testEmailAddress }" layout="vertical">
        <a-form-item field="test_email" label="测试邮箱地址">
          <a-input
            v-model="testEmailAddress"
            placeholder="请输入要接收测试邮件的邮箱地址"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { configsApi } from '@/api/configs'
import { Message } from '@arco-design/web-vue'
import { API_CONFIG, getApiUrl, getAuthToken } from '@/api/config'
import { IconPlus } from '@arco-design/web-vue/es/icon'

export default {
  name: 'SiteConfig',
  components: {
    IconPlus
  },
  setup() {
    const menuStore = useMenuStore()
    
    const basicFormRef = ref(null)
    const seoFormRef = ref(null)
    const systemFormRef = ref(null)
    const emailFormRef = ref(null)
    
    const basicLoading = ref(false)
    const seoLoading = ref(false)
    const systemLoading = ref(false)
    const emailLoading = ref(false)
    const testEmailLoading = ref(false)
    const testEmailVisible = ref(false)
    const testEmailAddress = ref('')
    const logoFileList = ref([])
    
    // 添加数据加载状态
    const dataLoading = ref(true)
    
    // 文件类型选项 - 根据API文档支持的类型
    const fileTypeOptions = [
      { label: 'JPG', value: 'jpg' },
      { label: 'PNG', value: 'png' },
      { label: 'GIF', value: 'gif' },
      { label: 'JPEG', value: 'jpeg' },
      { label: 'PDF', value: 'pdf' },
      { label: 'DOC', value: 'doc' },
      { label: 'DOCX', value: 'docx' },
      { label: 'XLS', value: 'xls' },
      { label: 'XLSX', value: 'xlsx' },
      { label: 'ZIP', value: 'zip' },
      { label: 'RAR', value: 'rar' }
    ]
    
    // 获取认证token和上传配置
    const authToken = getAuthToken()
    const uploadHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {}
    const uploadUrl = getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD)
    
    // 基本信息表单 - 根据API文档字段
    const basicForm = reactive({
      name: '',
      title: '',
      url: '',
      keywords: '',
      description: '',
      logo: '',
      favicon: '',
      copyright: '',
      icp: ''
    })
    
    const basicRules = {
      name: [{ required: true, message: '请输入网站名称' }],
      url: [{ required: true, message: '请输入网站地址' }]
    }
    
    // SEO设置表单
    const seoForm = reactive({
      seo_title: '',
      seo_keywords: '',
      seo_description: '',
      google_analytics_id: '',
      baidu_statistics_code: ''
    })
    
    const seoRules = {
      seo_title: [{ required: true, message: '请输入网站标题' }],
      seo_description: [{ required: true, message: '请输入网站描述' }]
    }
    
    // 系统参数表单 - 根据API文档字段
    const systemForm = reactive({
      user_register_enabled: 1,
      email_verify_enabled: 1,
      maintenance_mode: 0,
      session_expire_time: 30,
      upload_max_size: 10,
      allowed_file_types: ['jpg', 'png', 'gif'],
      timezone: 'Asia/Shanghai',
      date_format: 'Y-m-d H:i:s',
      page_size: 20
    })
    
    // 邮件配置表单 - 根据API文档字段
    const emailForm = reactive({
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_encryption: 'tls',
      sender_email: '',
      sender_name: ''
    })
    
    const emailRules = {
      smtp_host: [{ required: true, message: '请输入SMTP服务器地址' }],
      smtp_port: [{ required: true, message: '请输入SMTP端口' }],
      smtp_username: [{ required: true, message: '请输入SMTP用户名' }],
      smtp_password: [{ required: true, message: '请输入SMTP密码' }],
      sender_email: [
        { required: true, message: '请输入发件人邮箱' },
        { type: 'email', message: '请输入正确的邮箱格式' }
      ]
    }
    
    // 将配置数组转换为键值对对象
    const arrayToObject = (configArray) => {
      const result = {}
      if (Array.isArray(configArray)) {
        configArray.forEach(item => {
          if (item.name && item.value !== undefined) {
            result[item.name] = item.value
          }
        })
      }
      return result
    }

    // 加载网站配置
    const loadSiteConfig = async () => {
      try {
        const response = await configsApi.getSiteConfig()
        

        
        // 🎯 根据API文档 GET /configs/site/info 响应格式
        if (response && typeof response === 'object') {
          // 严格按照API文档的字段映射
          basicForm.name = response.name || ''
          basicForm.title = response.title || ''
          basicForm.url = response.url || ''
          basicForm.keywords = response.keywords || ''
          basicForm.description = response.description || ''
          basicForm.logo = response.logo || ''
          basicForm.favicon = response.favicon || ''
          basicForm.copyright = response.copyright || ''
          basicForm.icp = response.icp || ''
          

        } else {
          console.warn('网站配置响应格式不符合预期:', response)
        }
      } catch (error) {
        console.error('加载网站配置失败:', error)
        Message.error('加载网站配置失败')
      }
    }
    
    // 加载SEO配置
    const loadSeoConfig = async () => {
      try {
        const response = await configsApi.getSeoConfig()
        

        
        // 🎯 根据API文档，SEO配置应该返回对象格式
        if (response && typeof response === 'object') {
          seoForm.seo_title = response.seo_title || ''
          seoForm.seo_keywords = response.seo_keywords || ''
          seoForm.seo_description = response.seo_description || ''
          seoForm.google_analytics_id = response.google_analytics_id || ''
          seoForm.baidu_statistics_code = response.baidu_statistics_code || ''
          

        } else {
          console.warn('SEO配置响应格式不符合预期:', response)
        }
      } catch (error) {
        console.error('加载SEO配置失败:', error)
        Message.error('加载SEO配置失败')
      }
    }
    
    // 加载系统配置
    const loadSystemConfig = async () => {
      try {
        const response = await configsApi.getSystemConfig()
        

        
        // 🎯 根据API文档 GET /configs/system/info 响应格式
        if (response && typeof response === 'object') {
          // 根据API文档的字段映射
          systemForm.user_register_enabled = response.user_register_enabled === "1" || response.user_register_enabled === true ? 1 : 0
          systemForm.email_verify_enabled = response.email_verify_enabled === "1" || response.email_verify_enabled === true ? 1 : 0
          systemForm.maintenance_mode = response.maintenance_mode === "1" || response.maintenance_mode === true ? 1 : 0
          systemForm.session_expire_time = Number(response.session_expire_time) || 30
          systemForm.upload_max_size = Number(response.upload_max_size) || 10
          systemForm.timezone = response.timezone || 'Asia/Shanghai'
          systemForm.date_format = response.date_format || 'Y-m-d H:i:s'
          systemForm.page_size = Number(response.page_size) || 20
          
          // 处理文件类型 - API文档显示是逗号分隔的字符串
          if (response.allowed_file_types) {
            if (typeof response.allowed_file_types === 'string') {
              systemForm.allowed_file_types = response.allowed_file_types.split(',').map(type => type.trim().toLowerCase()).filter(type => type)
            } else if (Array.isArray(response.allowed_file_types)) {
              systemForm.allowed_file_types = response.allowed_file_types.map(type => type.toLowerCase())
            }
          }
          

        } else {
          console.warn('系统配置响应格式不符合预期:', response)
        }
      } catch (error) {
        console.error('加载系统配置失败:', error)
        Message.error('加载系统配置失败')
      }
    }
    
    // 加载邮件配置
    const loadEmailConfig = async () => {
      try {
        const response = await configsApi.getEmailConfig()
        

        
        // 🎯 根据API文档 GET /configs/email/info 响应格式
        if (response && typeof response === 'object') {
          emailForm.smtp_host = response.smtp_host || ''
          emailForm.smtp_port = Number(response.smtp_port) || 587
          emailForm.smtp_username = response.smtp_username || ''
          emailForm.smtp_password = response.smtp_password || ''
          emailForm.smtp_encryption = response.smtp_encryption || 'tls'
          emailForm.sender_email = response.sender_email || ''
          emailForm.sender_name = response.sender_name || ''
          

        } else {
          console.warn('邮件配置响应格式不符合预期:', response)
        }
      } catch (error) {
        console.error('加载邮件配置失败:', error)
        Message.error('加载邮件配置失败')
      }
    }
    
    // Logo上传处理
    const handleLogoChange = (fileList) => {
      if (fileList.length > 0) {
        const file = fileList[0]

        
        if (file.status === 'done' && file.response) {
          // 🎯 上传组件收到的是完整响应格式，需要手动解包
          let actualData = file.response
          
          // 如果是标准API响应格式，解包data字段
          if (actualData && actualData.code === 200 && actualData.data) {
            actualData = actualData.data

          }
          
          if (actualData && actualData.url) {
            basicForm.logo = actualData.url
            Message.success('Logo上传成功')

          } else {
            console.error('Logo上传响应格式错误，期望包含url字段:', actualData)
            console.error('原始响应:', file.response)
            Message.error('Logo上传失败：响应格式错误')
          }
        } else if (file.status === 'error') {
          console.error('Logo上传失败，错误响应:', file.response)
          Message.error('Logo上传失败，请重试')
        }
      }
    }
    
    // 保存基本信息
    const handleSaveBasic = async (data) => {
      if (!data.errors) {
        basicLoading.value = true
        try {
          // 🎯 根据API文档 POST /configs/site/save 请求格式
          const requestData = {
            name: basicForm.name,
            title: basicForm.title || basicForm.name, // 如果没有标题，使用网站名称
            url: basicForm.url,
            keywords: basicForm.keywords,
            description: basicForm.description,
            logo: basicForm.logo,
            favicon: basicForm.favicon,
            copyright: basicForm.copyright,
            icp: basicForm.icp
          }
          

          const response = await configsApi.saveSiteConfig(requestData)
          Message.success('基本信息保存成功！')
        } catch (error) {
          console.error('保存基本信息失败:', error)
          Message.error('保存失败，请重试！')
        } finally {
          basicLoading.value = false
        }
      }
    }
    
    // 保存SEO设置
    const handleSaveSeo = async (data) => {
      if (!data.errors) {
        seoLoading.value = true
        try {
          // 根据API文档，直接传递表单数据
          const response = await configsApi.saveSeoConfig(seoForm)
          Message.success('SEO设置保存成功！')
        } catch (error) {
          console.error('保存SEO设置失败:', error)
          Message.error('保存失败，请重试！')
        } finally {
          seoLoading.value = false
        }
      }
    }
    
    // 保存系统参数
    const handleSaveSystem = async () => {
      systemLoading.value = true
      try {
        // 🎯 根据API文档 POST /configs/system/save 请求格式
        const requestData = {
          user_register_enabled: systemForm.user_register_enabled ? "1" : "0",
          email_verify_enabled: systemForm.email_verify_enabled ? "1" : "0", 
          maintenance_mode: systemForm.maintenance_mode ? "1" : "0",
          session_expire_time: String(systemForm.session_expire_time),
          upload_max_size: String(systemForm.upload_max_size),
          allowed_file_types: Array.isArray(systemForm.allowed_file_types) ? systemForm.allowed_file_types.join(',') : systemForm.allowed_file_types,
          timezone: systemForm.timezone,
          date_format: systemForm.date_format,
          page_size: String(systemForm.page_size)
        }
        

        const response = await configsApi.saveSystemConfig(requestData)
        Message.success('系统参数保存成功！')
      } catch (error) {
        console.error('保存系统参数失败:', error)
        Message.error('保存失败，请重试！')
      } finally {
        systemLoading.value = false
      }
    }
    
    // 保存邮件配置
    const handleSaveEmail = async (data) => {
      if (!data.errors) {
        emailLoading.value = true
        try {
          // 🎯 根据API文档 POST /configs/email/save 请求格式
          const requestData = {
            smtp_host: emailForm.smtp_host,
            smtp_port: String(emailForm.smtp_port), // 转为字符串
            smtp_username: emailForm.smtp_username,
            smtp_password: emailForm.smtp_password,
            smtp_encryption: emailForm.smtp_encryption.toLowerCase(), // 转为小写
            sender_email: emailForm.sender_email,
            sender_name: emailForm.sender_name
          }
          
  
          const response = await configsApi.saveEmailConfig(requestData)
          Message.success('邮件配置保存成功！')
        } catch (error) {
          console.error('保存邮件配置失败:', error)
          Message.error('保存失败，请重试！')
        } finally {
          emailLoading.value = false
        }
      }
    }
    
    // 发送测试邮件
    const handleTestEmail = () => {
      testEmailAddress.value = ''
      testEmailVisible.value = true
    }
    
    // 发送测试邮件
    const handleSendTestEmail = async () => {
      if (!testEmailAddress.value) {
        Message.error('请输入测试邮箱地址')
        return
      }
      
      testEmailLoading.value = true
      try {
        const response = await configsApi.testEmailConfig({
          test_email: testEmailAddress.value
        })
        Message.success('测试邮件发送成功！')
        testEmailVisible.value = false
      } catch (error) {
        console.error('测试邮件发送失败:', error)
        Message.error('测试邮件发送失败！')
      } finally {
        testEmailLoading.value = false
      }
    }
    
    onMounted(async () => {
      menuStore.generateBreadcrumbs('/system/site-config')
      
      // 显示加载状态
      dataLoading.value = true
      
      try {
        // 加载所有配置数据
        await Promise.all([
          loadSiteConfig(),
          loadSeoConfig(),
          loadSystemConfig(),
          loadEmailConfig()
        ])
      } catch (error) {
        Message.error('加载配置数据失败')
      } finally {
        // 隐藏加载状态
        dataLoading.value = false
      }
    })
    
    return {
      basicFormRef,
      seoFormRef,
      systemFormRef,
      emailFormRef,
      basicLoading,
      seoLoading,
      systemLoading,
      emailLoading,
      testEmailLoading,
      testEmailVisible,
      testEmailAddress,
      logoFileList,
      uploadHeaders,
      uploadUrl,
      dataLoading,
      basicForm,
      basicRules,
      seoForm,
      seoRules,
      systemForm,
      emailForm,
      emailRules,
      fileTypeOptions,
      handleLogoChange,
      handleSaveBasic,
      handleSaveSeo,
      handleSaveSystem,
      handleSaveEmail,
      handleTestEmail,
      handleSendTestEmail
    }
  }
}
</script>

<style scoped>
.site-config-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.config-card {
  border-radius: 8px;
}

.upload-area {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
}

.logo-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  text-align: center;
  color: #999;
}

.upload-placeholder .arco-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.form-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}
</style> 