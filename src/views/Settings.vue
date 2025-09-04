<template>
  <div class="settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-description">管理系统配置和存储设置（仅管理员可访问）</p>
    </div>

    <!-- 设置选项卡 -->
    <t-tabs v-model="activeTab" placement="top" size="large" class="settings-tabs">
      
      <!-- 对象存储配置 -->
      <t-tab-panel value="storage" label="对象存储">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <CloudIcon class="section-icon" />
              对象存储配置
            </h3>
            <p class="section-desc">配置多个对象存储服务，支持腾讯云COS、阿里云OSS等</p>
          </div>

          <!-- 存储列表 -->
          <div class="storage-list">
            <div 
              v-for="(storage, index) in storageList" 
              :key="storage.id"
              class="storage-card"
              :class="{ 'active': storage.isDefault }"
            >
              <div class="storage-header">
                <div class="storage-info">
                  <h4 class="storage-name">{{ storage.name }}</h4>
                  <span class="storage-type">{{ getStorageTypeLabel(storage.type) }}</span>
                  <t-tag v-if="storage.isDefault" theme="success" size="small">默认</t-tag>
                </div>
                <div class="storage-actions">
                  <t-button 
                    v-if="!storage.isDefault"
                    theme="primary" 
                    variant="outline" 
                    size="small"
                    @click="setDefaultStorage(storage.id)"
                    :loading="settingDefault === storage.id"
                  >
                    设为默认
                  </t-button>
                  <t-button 
                    theme="default" 
                    variant="text" 
                    size="small"
                    @click="editStorage(storage)"
                  >
                    编辑
                  </t-button>
                  <t-button 
                    theme="danger" 
                    variant="text" 
                    size="small"
                    @click="deleteStorage(storage.id)"
                  >
                    删除
                  </t-button>
                </div>
              </div>
              <div class="storage-details">
                <div class="storage-status">
                  <span class="status-dot" :class="storage.status"></span>
                  {{ getStatusText(storage.status) }}
                </div>
                <div class="storage-url">{{ storage.customDomain || '未配置自定义域名' }}</div>
              </div>
            </div>
          </div>

          <!-- 添加存储按钮 -->
          <div class="add-storage-section">
            <t-button theme="primary" @click="showAddStorageDialog">
              <template #icon><PlusIcon /></template>
              添加对象存储
            </t-button>
          </div>
        </div>
      </t-tab-panel>

      <!-- 系统配置 -->
      <t-tab-panel value="system" label="系统配置">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <SettingsIcon class="section-icon" />
              系统基础配置
            </h3>
            <p class="section-desc">配置系统的基本参数和上传限制</p>
          </div>

          <t-form 
            ref="systemForm" 
            :data="systemConfig" 
            layout="vertical"
            :colon="false"
            class="settings-form"
          >
            <!-- 品牌设置 -->
            <div class="form-section">
              <h4 class="form-section-title">品牌设置</h4>
              <div class="form-row">
                <t-form-item label="网站名称" name="siteName" class="form-item">
                  <t-input 
                    v-model="systemConfig.siteName" 
                    placeholder="图床管理系统"
                  />
                </t-form-item>
                <t-form-item label="网站描述" name="siteDescription" class="form-item">
                  <t-input 
                    v-model="systemConfig.siteDescription" 
                    placeholder="专业的图片存储和管理平台"
                  />
                </t-form-item>
              </div>
              <div class="form-row">
                <t-form-item label="网站图标 (Favicon URL)" name="siteIcon" class="form-item">
                  <t-input 
                    v-model="systemConfig.siteIcon" 
                    placeholder="https://example.com/favicon.ico"
                  />
                  <template #help>
                    网站图标URL，显示在浏览器标签页
                  </template>
                </t-form-item>
                <t-form-item label="网站Logo (URL)" name="siteLogo" class="form-item">
                  <t-input 
                    v-model="systemConfig.siteLogo" 
                    placeholder="https://example.com/logo.png"
                  />
                  <template #help>
                    网站Logo URL，显示在导航栏
                  </template>
                </t-form-item>
              </div>
            </div>

            <!-- 上传设置 -->
            <div class="form-section">
              <h4 class="form-section-title">上传设置</h4>
              <div class="form-row">
                <t-form-item label="最大文件大小 (MB)" name="maxFileSize" class="form-item">
                  <t-input-number 
                    v-model="systemConfig.maxFileSize" 
                    :min="1" 
                    :max="100"
                    placeholder="10"
                  />
                </t-form-item>
                <t-form-item label="批量上传数量限制" name="maxBatchCount" class="form-item">
                  <t-input-number 
                    v-model="systemConfig.maxBatchCount" 
                    :min="1" 
                    :max="50"
                    placeholder="20"
                  />
                </t-form-item>
              </div>
            </div>

            <div class="form-row">
              <t-form-item label="允许的文件类型" name="allowedTypes" class="form-item-full">
                <t-select 
                  v-model="systemConfig.allowedTypes" 
                  multiple
                  placeholder="选择允许的文件类型"
                  :options="fileTypeOptions"
                />
              </t-form-item>
            </div>

            <div class="form-row">
              <t-form-item label="自动压缩" name="autoCompress" class="form-item">
                <t-switch v-model="systemConfig.autoCompress" />
              </t-form-item>
              <t-form-item 
                v-if="systemConfig.autoCompress" 
                label="压缩质量 (%)" 
                name="compressQuality" 
                class="form-item"
              >
                <t-slider 
                  v-model="systemConfig.compressQuality" 
                  :min="10" 
                  :max="100"
                  :step="5"
                  :marks="{ 50: '50%', 80: '80%' }"
                />
              </t-form-item>
              <div v-else class="form-item"></div>
            </div>

            <!-- 用户管理设置 -->
            <div class="form-section">
              <h4 class="form-section-title">用户管理</h4>
              <div class="form-row">
                <t-form-item label="允许用户注册" name="allowRegistration" class="form-item">
                  <t-switch v-model="systemConfig.allowRegistration" />
                  <template #help>
                    关闭后，新用户将无法注册账户
                  </template>
                </t-form-item>
                <div class="form-item"></div>
              </div>
            </div>

            <div class="form-actions">
              <t-button theme="primary" @click="saveSystemConfig" :loading="isSaving">
                保存系统配置
              </t-button>
            </div>
          </t-form>
        </div>
      </t-tab-panel>

      <!-- 邮件配置 -->
      <t-tab-panel value="email" label="邮件服务">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <MailIcon class="section-icon" />
              邮件服务配置
            </h3>
            <p class="section-desc">配置SMTP邮件服务，用于发送通知和验证邮件</p>
          </div>

          <t-form 
            ref="emailForm" 
            :data="emailConfig" 
            layout="vertical"
            :colon="false"
            class="settings-form"
          >
            <div class="form-row">
              <t-form-item label="SMTP服务器" name="smtpHost" class="form-item">
                <t-input 
                  v-model="emailConfig.smtpHost" 
                  placeholder="smtp.example.com"
                />
              </t-form-item>
              <t-form-item label="SMTP端口" name="smtpPort" class="form-item">
                <t-input-number 
                  v-model="emailConfig.smtpPort" 
                  :min="1" 
                  :max="65535"
                  placeholder="587"
                />
              </t-form-item>
            </div>

            <div class="form-row">
              <t-form-item label="SSL/TLS加密" name="smtpSecure" class="form-item">
                <t-switch 
                  v-model="emailConfig.smtpSecure"
                />
                <template #help>
                  端口465通常使用SSL，端口587通常使用TLS
                </template>
              </t-form-item>
              <t-form-item label="测试邮箱" name="testEmail" class="form-item">
                <t-input 
                  v-model="emailConfig.testEmail" 
                  placeholder="test@example.com"
                />
                <template #help>
                  用于接收测试邮件的邮箱地址
                </template>
              </t-form-item>
            </div>

            <div class="form-row">
              <t-form-item label="发件人邮箱" name="fromEmail" class="form-item">
                <t-input 
                  v-model="emailConfig.fromEmail" 
                  placeholder="noreply@example.com"
                />
              </t-form-item>
              <t-form-item label="发件人名称" name="fromName" class="form-item">
                <t-input 
                  v-model="emailConfig.fromName" 
                  placeholder="图床系统"
                />
              </t-form-item>
            </div>

            <div class="form-row">
              <t-form-item label="SMTP用户名" name="smtpUser" class="form-item">
                <t-input 
                  v-model="emailConfig.smtpUser" 
                  placeholder="用户名或邮箱"
                />
              </t-form-item>
              <t-form-item label="SMTP密码" name="smtpPass" class="form-item">
                <t-input 
                  v-model="emailConfig.smtpPass" 
                  type="password"
                  placeholder="密码或授权码"
                />
              </t-form-item>
            </div>

            <div class="form-actions">
              <t-button variant="outline" @click="testEmail" :loading="isTesting">
                <template #icon><TestTubeIcon /></template>
                测试邮件发送
              </t-button>
              <t-button theme="primary" @click="saveEmailConfig" :loading="isSaving">
                保存邮件配置
              </t-button>
            </div>
          </t-form>
        </div>
      </t-tab-panel>

      <!-- 安全配置 -->
      <t-tab-panel value="security" label="安全设置">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <ShieldIcon class="section-icon" />
              安全配置
            </h3>
            <p class="section-desc">配置系统安全相关设置</p>
          </div>

          <t-form 
            ref="securityForm" 
            :data="securityConfig" 
            layout="vertical"
            :colon="false"
            class="settings-form"
          >
            <div class="form-row">
              <t-form-item label="启用用户注册" name="allowRegister" class="form-item">
                <t-switch v-model="securityConfig.allowRegister" />
              </t-form-item>
              <t-form-item label="需要邮箱验证" name="requireEmailVerification" class="form-item">
                <t-switch v-model="securityConfig.requireEmailVerification" />
              </t-form-item>
            </div>

            <div class="form-row">
              <t-form-item label="JWT过期时间 (小时)" name="jwtExpiration" class="form-item">
                <t-input-number 
                  v-model="securityConfig.jwtExpiration" 
                  :min="1" 
                  :max="720"
                  placeholder="24"
                />
              </t-form-item>
              <t-form-item label="最大登录尝试次数" name="maxLoginAttempts" class="form-item">
                <t-input-number 
                  v-model="securityConfig.maxLoginAttempts" 
                  :min="3" 
                  :max="20"
                  placeholder="5"
                />
              </t-form-item>
            </div>

            <div class="form-actions">
              <t-button theme="primary" @click="saveSecurityConfig" :loading="isSaving">
                保存安全配置
              </t-button>
            </div>
          </t-form>
        </div>
      </t-tab-panel>
    </t-tabs>

    <!-- 添加/编辑存储对话框 -->
    <t-dialog 
      v-model:visible="storageDialogVisible" 
      :title="isEditingStorage ? '编辑对象存储' : '添加对象存储'"
      width="70%"
      :on-confirm="saveStorageConfig"
      :confirm-btn="{ loading: isSaving }"
    >
      <t-form 
        ref="storageForm" 
        :data="currentStorage" 
        :rules="storageRules"
        layout="vertical"
        :colon="false"
      >
        <t-form-item label="存储名称" name="name">
          <t-input 
            v-model="currentStorage.name" 
            placeholder="例如：腾讯云COS-主存储"
          />
        </t-form-item>

        <t-form-item label="存储类型" name="type">
          <t-select 
            v-model="currentStorage.type" 
            placeholder="选择存储类型"
            :options="storageTypeOptions"
            @change="onStorageTypeChange"
          />
        </t-form-item>

        <!-- 腾讯云COS配置 -->
        <template v-if="currentStorage.type === 'cos'">
          <div class="form-row">
            <t-form-item label="SecretId" name="secretId" class="form-item">
              <t-input 
                v-model="currentStorage.secretId" 
                placeholder="腾讯云SecretId"
              />
            </t-form-item>
            <t-form-item label="SecretKey" name="secretKey" class="form-item">
              <t-input 
                v-model="currentStorage.secretKey" 
                type="password"
                placeholder="腾讯云SecretKey"
              />
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="存储桶名称" name="bucket" class="form-item">
              <t-input 
                v-model="currentStorage.bucket" 
                placeholder="bucket-name"
              />
            </t-form-item>
            <t-form-item label="Endpoint" name="endpoint" class="form-item">
              <t-input 
                v-model="currentStorage.endpoint" 
                placeholder="https://cos.ap-beijing.myqcloud.com"
              />
              <template #help>
                腾讯云COS的访问端点，例如：https://cos.ap-beijing.myqcloud.com
              </template>
            </t-form-item>
          </div>
        </template>

        <!-- 阿里云OSS配置 -->
        <template v-if="currentStorage.type === 'oss'">
          <div class="form-row">
            <t-form-item label="AccessKey ID" name="accessKeyId" class="form-item">
              <t-input 
                v-model="currentStorage.accessKeyId" 
                placeholder="阿里云AccessKey ID"
              />
            </t-form-item>
            <t-form-item label="AccessKey Secret" name="accessKeySecret" class="form-item">
              <t-input 
                v-model="currentStorage.accessKeySecret" 
                type="password"
                placeholder="阿里云AccessKey Secret"
              />
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="存储桶名称" name="bucket" class="form-item">
              <t-input 
                v-model="currentStorage.bucket" 
                placeholder="bucket-name"
              />
            </t-form-item>
            <t-form-item label="Endpoint" name="endpoint" class="form-item">
              <t-input 
                v-model="currentStorage.endpoint" 
                placeholder="https://oss-cn-hangzhou.aliyuncs.com"
              />
              <template #help>
                阿里云OSS的访问端点，例如：https://oss-cn-hangzhou.aliyuncs.com
              </template>
            </t-form-item>
          </div>
        </template>

        <!-- 七牛云KODO配置 -->
        <template v-if="currentStorage.type === 'qiniu'">
          <div class="form-row">
            <t-form-item label="AccessKey" name="accessKey" class="form-item">
              <t-input 
                v-model="currentStorage.accessKey" 
                placeholder="七牛云AccessKey"
              />
            </t-form-item>
            <t-form-item label="SecretKey" name="secretKey" class="form-item">
              <t-input 
                v-model="currentStorage.secretKey" 
                type="password"
                placeholder="七牛云SecretKey"
              />
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="存储桶名称" name="bucket" class="form-item">
              <t-input 
                v-model="currentStorage.bucket" 
                placeholder="bucket-name"
              />
            </t-form-item>
            <t-form-item label="Endpoint" name="endpoint" class="form-item">
              <t-input 
                v-model="currentStorage.endpoint" 
                placeholder="https://s3-cn-east-1.qiniucs.com"
              />
              <template #help>
                七牛云KODO的访问端点，例如：https://s3-cn-east-1.qiniucs.com
              </template>
            </t-form-item>
          </div>
        </template>

        <!-- 又拍云USS配置 -->
        <template v-if="currentStorage.type === 'upyun'">
          <div class="form-row">
            <t-form-item label="操作员账号" name="operator" class="form-item">
              <t-input 
                v-model="currentStorage.operator" 
                placeholder="又拍云操作员账号"
              />
            </t-form-item>
            <t-form-item label="操作员密码" name="password" class="form-item">
              <t-input 
                v-model="currentStorage.password" 
                type="password"
                placeholder="又拍云操作员密码"
              />
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="服务名称" name="bucket" class="form-item">
              <t-input 
                v-model="currentStorage.bucket" 
                placeholder="service-name"
              />
            </t-form-item>
            <t-form-item label="Endpoint" name="endpoint" class="form-item">
              <t-input 
                v-model="currentStorage.endpoint" 
                placeholder="https://v0.api.upyun.com"
              />
              <template #help>
                又拍云USS的访问端点，例如：https://v0.api.upyun.com
              </template>
            </t-form-item>
          </div>
        </template>

        <!-- Amazon S3配置 -->
        <template v-if="currentStorage.type === 's3'">
          <div class="form-row">
            <t-form-item label="Access Key ID" name="accessKeyId" class="form-item">
              <t-input 
                v-model="currentStorage.accessKeyId" 
                placeholder="AWS Access Key ID"
              />
            </t-form-item>
            <t-form-item label="Secret Access Key" name="secretAccessKey" class="form-item">
              <t-input 
                v-model="currentStorage.secretAccessKey" 
                type="password"
                placeholder="AWS Secret Access Key"
              />
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="存储桶名称" name="bucket" class="form-item">
              <t-input 
                v-model="currentStorage.bucket" 
                placeholder="bucket-name"
              />
            </t-form-item>
            <t-form-item label="区域" name="region" class="form-item">
              <t-input 
                v-model="currentStorage.region" 
                placeholder="us-east-1"
              />
              <template #help>
                AWS区域，例如：us-east-1, eu-west-1
              </template>
            </t-form-item>
          </div>
          <t-form-item label="Endpoint (可选)" name="endpoint" class="form-item-full">
            <t-input 
              v-model="currentStorage.endpoint" 
              placeholder="https://s3.amazonaws.com"
            />
            <template #help>
              自定义S3端点，留空使用AWS默认端点
            </template>
          </t-form-item>
        </template>

        <!-- MinIO配置 -->
        <template v-if="currentStorage.type === 'minio'">
          <div class="form-row">
            <t-form-item label="Access Key" name="accessKey" class="form-item">
              <t-input 
                v-model="currentStorage.accessKey" 
                placeholder="MinIO Access Key"
              />
            </t-form-item>
            <t-form-item label="Secret Key" name="secretKey" class="form-item">
              <t-input 
                v-model="currentStorage.secretKey" 
                type="password"
                placeholder="MinIO Secret Key"
              />
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="存储桶名称" name="bucket" class="form-item">
              <t-input 
                v-model="currentStorage.bucket" 
                placeholder="bucket-name"
              />
            </t-form-item>
            <t-form-item label="Endpoint" name="endpoint" class="form-item">
              <t-input 
                v-model="currentStorage.endpoint" 
                placeholder="https://minio.example.com"
              />
              <template #help>
                MinIO服务器地址，例如：https://minio.example.com:9000
              </template>
            </t-form-item>
          </div>
          <div class="form-row">
            <t-form-item label="使用SSL" name="useSSL" class="form-item">
              <t-switch v-model="currentStorage.useSSL" />
              <template #help>
                是否使用HTTPS连接MinIO服务器
              </template>
            </t-form-item>
          </div>
        </template>

        <!-- 自定义域名 -->
        <t-form-item label="自定义访问域名" name="customDomain">
          <t-input 
            v-model="currentStorage.customDomain" 
            placeholder="https://your-domain.com"
          />
          <template #help>
            留空将使用默认域名，建议配置自定义域名以获得更好的访问速度
          </template>
        </t-form-item>

        <!-- 路径前缀 -->
        <t-form-item label="存储路径前缀" name="pathPrefix">
          <t-input 
            v-model="currentStorage.pathPrefix" 
            placeholder="images/"
          />
          <template #help>
            可选，用于在存储桶中创建文件夹结构
          </template>
        </t-form-item>
      </t-form>

      <template #footer>
        <t-button variant="outline" @click="testStorageConnection" :loading="isTesting">
          测试连接
        </t-button>
        <t-button theme="primary" @click="saveStorageConfig" :loading="isSaving">
          {{ isEditingStorage ? '更新' : '添加' }}
        </t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  CloudIcon,
  SettingsIcon,
  MailIcon,
  ShieldIcon,
  PlusIcon,
  TestTubeIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

// 响应式数据
const activeTab = ref('storage')
const isSaving = ref(false)
const isTesting = ref(false)
const storageDialogVisible = ref(false)
const isEditingStorage = ref(false)
const settingDefault = ref<string | null>(null)

// 存储列表
const storageList = ref<any[]>([])

// 当前编辑的存储配置
const currentStorage = ref({
  id: '',
  name: '',
  type: '',
  secretId: '',
  secretKey: '',
  accessKey: '',
  accessKeyId: '',
  accessKeySecret: '',
  secretAccessKey: '',
  operator: '',
  password: '',
  bucket: '',
  region: '',
  endpoint: '',
  useSSL: true,
  customDomain: '',
  pathPrefix: ''
})

// 系统配置
const systemConfig = reactive({
  // 品牌设置
  siteName: '图床管理系统',
  siteIcon: '',
  siteLogo: '',
  siteDescription: '专业的图片存储和管理平台',
  
  // 上传设置
  maxFileSize: 10,
  maxBatchCount: 20,
  allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  autoCompress: true,
  compressQuality: 80,
  generateThumbnail: true,
  
  // 用户管理设置
  allowRegistration: true
})

// 邮件配置
const emailConfig = reactive({
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  fromEmail: '',
  fromName: '图床系统',
  smtpUser: '',
  smtpPass: '',
  testEmail: ''
})

// 安全配置
const securityConfig = reactive({
  allowRegister: true,
  requireEmailVerification: false,
  jwtExpiration: 24,
  maxLoginAttempts: 5
})

// 表单验证规则
const storageRules = {
  name: [{ required: true, message: '请输入存储名称' }],
  type: [{ required: true, message: '请选择存储类型' }]
}

// 选项数据
const storageTypeOptions = [
  { label: '腾讯云COS', value: 'cos' },
  { label: '阿里云OSS', value: 'oss' },
  { label: '七牛云KODO', value: 'qiniu' },
  { label: '又拍云USS', value: 'upyun' },
  { label: 'Amazon S3', value: 's3' },
  { label: 'MinIO', value: 'minio' }
]

const fileTypeOptions = [
  { label: 'JPEG', value: 'jpeg' },
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'GIF', value: 'gif' },
  { label: 'WebP', value: 'webp' },
  { label: 'BMP', value: 'bmp' },
  { label: 'SVG', value: 'svg' }
]


// 方法
const getStorageTypeLabel = (type: string) => {
  const option = storageTypeOptions.find(opt => opt.value === type)
  return option?.label || type
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'connected': '连接正常',
    'error': '连接错误',
    'testing': '测试中...'
  }
  return statusMap[status] || '未知状态'
}

const showAddStorageDialog = () => {
  isEditingStorage.value = false
  currentStorage.value = {
    id: '',
    name: '',
    type: '',
    secretId: '',
    secretKey: '',
    accessKey: '',
    accessKeyId: '',
    accessKeySecret: '',
    secretAccessKey: '',
    operator: '',
    password: '',
    bucket: '',
    region: '',
    endpoint: '',
    useSSL: true,
    customDomain: '',
    pathPrefix: ''
  }
  storageDialogVisible.value = true
}

const editStorage = (storage: any) => {
  isEditingStorage.value = true
  currentStorage.value = { ...storage }
  storageDialogVisible.value = true
}

const onStorageTypeChange = () => {
  // 清空相关字段
  currentStorage.value.secretId = ''
  currentStorage.value.secretKey = ''
  currentStorage.value.accessKey = ''
  currentStorage.value.accessKeyId = ''
  currentStorage.value.accessKeySecret = ''
  currentStorage.value.secretAccessKey = ''
  currentStorage.value.operator = ''
  currentStorage.value.password = ''
  currentStorage.value.bucket = ''
  currentStorage.value.region = ''
  currentStorage.value.endpoint = ''
  currentStorage.value.useSSL = true
}

const testStorageConnection = async () => {
  isTesting.value = true
  try {
    const response = await apiService.testStorageConnection(
      currentStorage.value.type,
      currentStorage.value
    )
    if (response.success) {
      MessagePlugin.success('存储连接测试成功')
    } else {
      MessagePlugin.error('连接测试失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('测试连接失败:', error)
    MessagePlugin.error('连接测试失败: ' + error.message)
  } finally {
    isTesting.value = false
  }
}

const saveStorageConfig = async () => {
  isSaving.value = true
  try {
    const { id, name, type, ...config } = currentStorage.value
    
    if (isEditingStorage.value && id) {
      // 更新存储配置
      await apiService.updateStorage(id, name, type, config)
      MessagePlugin.success('存储配置更新成功')
    } else {
      // 创建存储配置
      await apiService.createStorage(name, type, config)
      MessagePlugin.success('存储配置创建成功')
    }
    
    storageDialogVisible.value = false
    loadStorageList()
  } catch (error: any) {
    console.error('保存存储配置失败:', error)
    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

// 设置默认存储
const setDefaultStorage = async (storageId: string) => {
  settingDefault.value = storageId
  try {
    const response = await apiService.setDefaultStorage(parseInt(storageId))
    if (response.success) {
      MessagePlugin.success('默认存储设置成功')
      loadStorageList()
    } else {
      MessagePlugin.error('设置失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('设置默认存储失败:', error)
    MessagePlugin.error('设置失败: ' + error.message)
  } finally {
    settingDefault.value = null
  }
}

const deleteStorage = async (storageId: string) => {
  try {
    await apiService.deleteStorage(storageId)
    MessagePlugin.success('存储配置删除成功')
    loadStorageList()
  } catch (error: any) {
    console.error('删除存储配置失败:', error)
    MessagePlugin.error('删除失败: ' + error.message)
  }
}

const saveSystemConfig = async () => {
  isSaving.value = true
  try {
    const response = await apiService.setConfigItem('system', systemConfig, '系统基础配置')
    if (response.success) {
      MessagePlugin.success('系统配置保存成功')
    } else {
      MessagePlugin.error('保存失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('保存系统配置失败:', error)
    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const testEmail = async () => {
  isTesting.value = true
  try {
    const response = await apiService.testEmailConnection(emailConfig)
    if (response.success) {
      MessagePlugin.success('测试邮件发送成功')
    } else {
      MessagePlugin.error('发送失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('测试邮件失败:', error)
    MessagePlugin.error('发送失败: ' + error.message)
  } finally {
    isTesting.value = false
  }
}

const saveEmailConfig = async () => {
  isSaving.value = true
  try {
    const response = await apiService.setConfigItem('email', emailConfig, '邮件服务配置')
    if (response.success) {
      MessagePlugin.success('邮件配置保存成功')
    } else {
      MessagePlugin.error('保存失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('保存邮件配置失败:', error)
    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const saveSecurityConfig = async () => {
  isSaving.value = true
  try {
    const response = await apiService.setConfigItem('security', securityConfig, '系统安全配置')
    if (response.success) {
      MessagePlugin.success('安全配置保存成功')
    } else {
      MessagePlugin.error('保存失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('保存安全配置失败:', error)
    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const loadStorageList = async () => {
  try {
    const response = await apiService.getAllStorages()
    if (response.success && response.data) {

      storageList.value = response.data.map(storage => {
        const mapped = {
          id: storage.id.toString(),
          name: storage.name,
          type: storage.type,
          isDefault: storage.is_default,
          status: 'connected', // TODO: 实现真实的连接状态检测
          customDomain: storage.config.customDomain || '',
          ...storage.config
        }

        return mapped
      })

    }
  } catch (error) {

    MessagePlugin.error('加载存储配置失败')
  }
}

const loadConfigs = async () => {
  try {
    const response = await apiService.getConfig()
    if (response.success && response.data) {
      // 加载系统配置
      if (response.data.system) {
        Object.assign(systemConfig, response.data.system)
      }
      // 加载安全配置
      if (response.data.security) {
        Object.assign(securityConfig, response.data.security)
      }
      // 加载邮件配置
      if (response.data.email) {
        Object.assign(emailConfig, response.data.email)
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    MessagePlugin.error('加载配置失败')
  }
}

// 生命周期
onMounted(() => {
  loadConfigs()
  loadStorageList()
})
</script>

<style scoped>
.settings-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
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

.settings-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-section {
  padding: 32px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.section-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: var(--td-brand-color);
}

.section-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

/* 存储列表样式 */
.storage-list {
  margin-bottom: 24px;
}

.storage-card {
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.storage-card:hover {
  border-color: var(--td-brand-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.storage-card.active {
  border-color: var(--td-brand-color);
  background: var(--td-brand-color-light);
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.storage-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.storage-type {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  background: var(--td-bg-color-container);
  padding: 2px 8px;
  border-radius: 4px;
}

.storage-actions {
  display: flex;
  gap: 8px;
}

.storage-details {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.storage-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.connected {
  background: var(--td-success-color);
}

.status-dot.error {
  background: var(--td-error-color);
}

.status-dot.testing {
  background: var(--td-warning-color);
}

.add-storage-section {
  border: 2px dashed var(--td-border-level-1-color);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
}

/* 表单样式 */
.settings-form {
  max-width: 800px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 16px 0;
  padding-left: 8px;
  border-left: 3px solid var(--td-brand-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-item-full {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--td-border-level-1-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }
  
  .settings-section {
    padding: 24px 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .storage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .storage-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>