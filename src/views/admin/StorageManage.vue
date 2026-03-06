<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-title">
        <h1>存储管理</h1>
        <p class="subtitle">配置对象存储服务，支持腾讯云COS、阿里云OSS等多种云存储</p>
      </div>
      <t-button theme="primary" size="medium" @click="openEdit()">
        <template #icon><PlusIcon :size="16" /></template>
        新增存储
      </t-button>
    </div>

    <!-- Storage Cards Grid -->
    <div v-if="storageList.length > 0" class="storage-grid">
      <div 
        v-for="item in storageList" 
        :key="item.id"
        class="storage-card"
        :class="{ 'is-default': item.isDefault }"
      >
        <div class="card-header">
          <div class="storage-icon" :class="item.type">
            <component :is="getIcon(item.type)" :size="24" />
          </div>
          <div class="storage-status">
            <span class="status-dot" :class="item.status"></span>
          </div>
        </div>

        <div class="card-body">
          <h3 class="storage-name">{{ item.name }}</h3>
          <div class="storage-type">{{ getTypeLabel(item.type) }}</div>
          <div class="storage-domain">{{ item.customDomain || item.endpoint || '-' }}</div>
        </div>

        <div class="card-footer">
          <div class="default-badge" v-if="item.isDefault">
            <CheckCircleIcon :size="14" />
            默认
          </div>
          <div v-else class="default-placeholder"></div>
          
          <div class="card-actions">
            <t-button 
              v-if="!item.isDefault"
              theme="primary" 
              variant="text" 
              size="small"
              :loading="settingDefault === item.id"
              @click="setDefault(item.id)"
            >
              设为默认
            </t-button>
            <t-button theme="default" variant="text" size="small" @click="openEdit(item)">编辑</t-button>
            <t-popconfirm content="确定删除该存储配置？" @confirm="remove(item.id)">
              <t-button theme="danger" variant="text" size="small" :disabled="item.isDefault">删除</t-button>
            </t-popconfirm>
          </div>
        </div>
      </div>

      <!-- Add Card -->
      <div class="storage-card add-card" @click="openEdit()">
        <PlusIcon :size="32" class="add-icon" />
        <span>添加新存储</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <HardDriveIcon :size="48" />
      </div>
      <h3>暂无存储配置</h3>
      <p>点击上方按钮添加第一个存储配置</p>
    </div>

    <!-- Edit Drawer -->
    <t-drawer
      v-model:visible="drawerVisible"
      :header="isEdit ? '编辑存储配置' : '新增存储配置'"
      size="480px"
      :confirm-btn="{ loading: saving, content: isEdit ? '保存' : '创建' }"
      @confirm="submit"
    >
      <div class="drawer-form">
        <div class="form-section">
          <label class="form-label required">存储名称</label>
          <t-input v-model="form.name" placeholder="例如：腾讯云主存储" />
        </div>

        <div class="form-section">
          <label class="form-label required">存储类型</label>
          <div class="type-grid">
            <div 
              v-for="type in storageTypes" 
              :key="type.value"
              class="type-item"
              :class="{ active: form.type === type.value }"
              @click="form.type = type.value"
            >
              <component :is="type.icon" :size="20" />
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>

        <template v-if="form.type">
          <div class="form-divider"></div>
          
          <!-- 动态密钥字段 -->
          <div class="form-row">
            <div class="form-section">
              <label class="form-label">{{ fieldLabels.accessKey }}</label>
              <t-input v-model="form.accessKey" type="password" :placeholder="fieldLabels.accessKeyPlaceholder" />
            </div>
            <div class="form-section">
              <label class="form-label">{{ fieldLabels.secretKey }}</label>
              <t-input v-model="form.secretKey" type="password" :placeholder="fieldLabels.secretKeyPlaceholder" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-section">
              <label class="form-label required">{{ fieldLabels.bucket }}</label>
              <t-input v-model="form.bucket" :placeholder="fieldLabels.bucketPlaceholder" />
            </div>
            
            <!-- 国内四云：统一显示端点地址 -->
            <div class="form-section" v-if="['cos', 'oss', 'qiniu', 'upyun'].includes(form.type)">
              <label class="form-label">端点地址</label>
              <t-input v-model="form.endpoint" :placeholder="fieldLabels.endpointPlaceholder" />
            </div>
            
            <!-- S3：显示 Region -->
            <div class="form-section" v-else-if="form.type === 's3'">
              <label class="form-label required">Region</label>
              <t-input v-model="form.region" placeholder="us-east-1 / auto" />
            </div>
            
            <!-- MinIO：SSL 开关 -->
            <div class="form-section" v-else-if="form.type === 'minio'">
              <label class="form-label">使用 SSL</label>
              <div class="ssl-switch">
                <t-switch v-model="form.useSSL" :customValue="[1, 0]" />
                <span class="ssl-hint">{{ form.useSSL === 1 ? 'HTTPS' : 'HTTP' }}</span>
              </div>
            </div>
          </div>

          <!-- S3/MinIO：端点地址单独一行 -->
          <div class="form-row" v-if="['s3', 'minio'].includes(form.type)">
            <div class="form-section" style="flex: 1;">
              <label class="form-label">{{ form.type === 's3' ? 'Endpoint (可选)' : '服务器地址' }}</label>
              <t-input v-model="form.endpoint" :placeholder="form.type === 's3' ? 'https://s3.amazonaws.com 或 https://xxx.r2.cloudflarestorage.com' : 'localhost:9000'" />
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">{{ fieldLabels.customDomain }}</label>
            <t-input v-model="form.customDomain" :placeholder="fieldLabels.customDomainPlaceholder" />
            <span class="form-hint">{{ fieldLabels.customDomainHint }}</span>
          </div>
        </template>

        <div class="form-divider"></div>

        <div class="form-options">
          <div class="option-item">
            <span>设为默认存储</span>
            <t-switch v-model="form.isDefault" :customValue="[1, 0]" />
          </div>
        </div>
      </div>

      <template #footer>
        <t-space>
          <t-button variant="outline" :loading="testing" @click="testConnection">测试连接</t-button>
          <t-button theme="primary" :loading="saving" @click="submit">{{ isEdit ? '保存' : '创建' }}</t-button>
        </t-space>
      </template>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  PlusIcon, 
  CheckCircleIcon, 
  HardDriveIcon,
  CloudIcon,
  DatabaseIcon,
  ServerIcon,
  BoxIcon,
  LayersIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

const storageList = ref<any[]>([])
const drawerVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const testing = ref(false)
const settingDefault = ref<number | null>(null)

const form = reactive({
  id: '',
  name: '',
  type: '',
  accessKey: '',
  secretKey: '',
  bucket: '',
  endpoint: '',
  region: '',      // S3 专用
  useSSL: 1,      // MinIO 等专用，默认开启
  customDomain: '',
  isDefault: 0
})

const storageTypes = [
  { value: 'cos', label: '腾讯云COS', icon: CloudIcon },
  { value: 'oss', label: '阿里云OSS', icon: DatabaseIcon },
  { value: 'qiniu', label: '七牛云', icon: ServerIcon },
  { value: 'upyun', label: '又拍云', icon: BoxIcon },
  { value: 's3', label: 'Amazon S3', icon: LayersIcon },
  { value: 'minio', label: 'MinIO', icon: HardDriveIcon }
]

const getIcon = (type: string) => {
  const t = storageTypes.find(i => i.value === type)
  return t?.icon || HardDriveIcon
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cos: '腾讯云COS', oss: '阿里云OSS', qiniu: '七牛云KODO',
    upyun: '又拍云USS', s3: 'Amazon S3', minio: 'MinIO'
  }
  return labels[type] || type
}

// 根据存储类型动态生成表单标签
const fieldLabels = computed(() => {
  const type = form.type
  const labels: Record<string, Record<string, string>> = {
    cos: {
      accessKey: 'SecretId',
      accessKeyPlaceholder: 'AKID-your-secret-id-here',
      secretKey: 'SecretKey',
      secretKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      bucket: '存储桶名称',
      bucketPlaceholder: 'mybucket-1250000000',
      endpointPlaceholder: 'cos.ap-beijing.myqcloud.com',
      customDomain: '自定义域名',
      customDomainPlaceholder: 'https://cdn.example.com',
      customDomainHint: '配置自定义 CDN 域名，留空使用腾讯云默认域名'
    },
    oss: {
      accessKey: 'AccessKey ID',
      accessKeyPlaceholder: 'LTAIxxxxxxxxxxxxxxxx',
      secretKey: 'AccessKey Secret',
      secretKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      bucket: 'Bucket 名称',
      bucketPlaceholder: 'my-bucket',
      endpointPlaceholder: 'oss-cn-hangzhou.aliyuncs.com',
      customDomain: '自定义域名',
      customDomainPlaceholder: 'https://cdn.example.com',
      customDomainHint: '配置自定义 CDN 域名，留空使用阿里云默认域名'
    },
    qiniu: {
      accessKey: 'AccessKey',
      accessKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      secretKey: 'SecretKey',
      secretKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      bucket: '空间名称',
      bucketPlaceholder: 'my-bucket',
      endpointPlaceholder: 's3-cn-east-1.qiniucs.com',
      customDomain: '自定义域名',
      customDomainPlaceholder: 'https://cdn.example.com',
      customDomainHint: '配置自定义 CDN 域名，留空使用七牛默认域名'
    },
    upyun: {
      accessKey: '操作员账号',
      accessKeyPlaceholder: 'operator',
      secretKey: '操作员密码',
      secretKeyPlaceholder: 'password',
      bucket: '服务名称',
      bucketPlaceholder: 'my-service',
      endpointPlaceholder: 'v0.api.upyun.com',
      customDomain: '自定义域名',
      customDomainPlaceholder: 'https://cdn.example.com',
      customDomainHint: '配置自定义 CDN 域名，留空使用又拍云默认域名'
    },
    s3: {
      accessKey: 'Access Key ID',
      accessKeyPlaceholder: 'AKIAxxxxxxxxxxxxxxxx',
      secretKey: 'Secret Access Key',
      secretKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      bucket: 'Bucket 名称',
      bucketPlaceholder: 'my-bucket',
      endpointPlaceholder: 'https://s3.amazonaws.com',
      customDomain: '自定义域名',
      customDomainPlaceholder: 'https://cdn.example.com',
      customDomainHint: '配置 CloudFront CDN 域名，留空使用 S3 默认域名'
    },
    minio: {
      accessKey: 'Access Key',
      accessKeyPlaceholder: 'minioadmin',
      secretKey: 'Secret Key',
      secretKeyPlaceholder: 'minioadmin',
      bucket: 'Bucket 名称',
      bucketPlaceholder: 'my-bucket',
      endpoint: '服务器地址',
      endpointPlaceholder: 'http://localhost:9000',
      customDomain: '自定义域名',
      customDomainPlaceholder: 'https://cdn.example.com',
      customDomainHint: '配置反向代理域名，留空使用 MinIO 默认地址'
    }
  }
  
  // 默认标签（用于 S3、MinIO 等）
  const defaultLabels = {
    accessKey: 'Access Key',
    accessKeyPlaceholder: '请输入 Access Key',
    secretKey: 'Secret Key',
    secretKeyPlaceholder: '请输入 Secret Key',
    bucket: '存储桶名称',
    bucketPlaceholder: 'bucket-name',
    endpointPlaceholder: '请输入服务器地址',
    customDomain: '自定义域名',
    customDomainPlaceholder: 'https://cdn.example.com',
    customDomainHint: '留空将使用默认域名'
  }
  
  return labels[type] || defaultLabels
})

const loadData = async () => {
  try {
    const res = await apiService.getAllStorages()
    if (res.success) storageList.value = res.data || []
  } catch (error) {
    MessagePlugin.error('加载失败')
  }
}

const openEdit = (item?: any) => {
  isEdit.value = !!item
  if (item) {
    const cfg = item.config || {}
    // 根据不同存储类型映射字段名
    const fieldMap: Record<string, {accessKey?: string, secretKey?: string}> = {
      cos: { accessKey: 'secretId', secretKey: 'secretKey' },
      oss: { accessKey: 'accessKeyId', secretKey: 'accessKeySecret' },
      qiniu: { accessKey: 'accessKey', secretKey: 'secretKey' },
      upyun: { accessKey: 'operator', secretKey: 'password' },
      s3: { accessKey: 'accessKeyId', secretKey: 'secretAccessKey' },
      minio: { accessKey: 'accessKey', secretKey: 'secretKey' }
    }
    const mapping = fieldMap[item.type] || {}
    
    // 将 config 对象展开到 form 中，并做字段映射
    Object.assign(form, {
      id: item.id,
      name: item.name,
      type: item.type,
      isDefault: item.isDefault === true ? 1 : 0,  // 确保是数字
      // 通用字段
      bucket: cfg.bucket || '',
      endpoint: cfg.endpoint || '',
      customDomain: cfg.customDomain || '',
      useSSL: cfg.useSSL === false ? 0 : 1,  // 转换为数字
      // S3 专用
      region: cfg.region || '',
      // 映射密钥字段
      accessKey: cfg[mapping.accessKey || 'accessKey'] || cfg.accessKeyId || cfg.secretId || cfg.operator || '',
      secretKey: cfg[mapping.secretKey || 'secretKey'] || cfg.accessKeySecret || cfg.secretAccessKey || cfg.password || ''
    })
  } else {
    Object.assign(form, {
      id: '', name: '', type: '', accessKey: '', secretKey: '',
      bucket: '', endpoint: '', region: '', useSSL: 1, customDomain: '', isDefault: 0
    })
  }
  drawerVisible.value = true
}

const submit = async () => {
  if (!form.name || !form.type) {
    MessagePlugin.warning('请填写存储名称并选择存储类型')
    return
  }
  if (!form.accessKey || !form.secretKey) {
    MessagePlugin.warning('请填写密钥信息')
    return
  }
  if (!form.bucket) {
    MessagePlugin.warning('请填写存储桶名称')
    return
  }
  // S3需要region，MinIO需要endpoint
  if (form.type === 's3' && !form.region) {
    MessagePlugin.warning('请填写Region')
    return
  }
  saving.value = true
  try {
    const { id, name, type, accessKey, secretKey, isDefault, region, useSSL, endpoint, bucket, customDomain } = form
    
    // 根据不同存储类型映射密钥字段
    const fieldMap: Record<string, {accessKey?: string, secretKey?: string}> = {
      cos: { accessKey: 'secretId', secretKey: 'secretKey' },
      oss: { accessKey: 'accessKeyId', secretKey: 'accessKeySecret' },
      qiniu: { accessKey: 'accessKey', secretKey: 'secretKey' },
      upyun: { accessKey: 'operator', secretKey: 'password' },
      s3: { accessKey: 'accessKeyId', secretKey: 'secretAccessKey' },
      minio: { accessKey: 'accessKey', secretKey: 'secretKey' }
    }
    const mapping = fieldMap[type] || {}
    
    // 构建 config 对象，使用后端期望的字段名
    const config: any = {
      bucket,
      endpoint: endpoint || '',
      customDomain: customDomain || '',
      [mapping.accessKey || 'accessKey']: accessKey,
      [mapping.secretKey || 'secretKey']: secretKey
    }
    
    // S3 添加 region 字段
    if (type === 's3') {
      config.region = region || ''
    }
    
    // MinIO 添加 useSSL 字段
    if (type === 'minio') {
      config.useSSL = useSSL === 1
    }
    
    if (isEdit.value && id) {
      await apiService.updateStorage(id, name, type, config)
    } else {
      await apiService.createStorage(name, type, config)
    }
    MessagePlugin.success(isEdit.value ? '保存成功' : '创建成功')
    drawerVisible.value = false
    loadData()
  } catch (error: any) {
    MessagePlugin.error(error.message || '操作失败')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  if (!form.type) {
    MessagePlugin.warning('请先选择存储类型')
    return
  }
  if (!form.accessKey || !form.secretKey) {
    MessagePlugin.warning('请填写密钥信息')
    return
  }
  if (!form.bucket) {
    MessagePlugin.warning('请填写存储桶名称')
    return
  }
  if (form.type === 's3' && !form.region) {
    MessagePlugin.warning('请填写Region')
    return
  }
  testing.value = true
  try {
    const { type, accessKey, secretKey, region, useSSL, endpoint, bucket, customDomain } = form
    
    // 根据不同存储类型映射密钥字段
    const fieldMap: Record<string, {accessKey?: string, secretKey?: string}> = {
      cos: { accessKey: 'secretId', secretKey: 'secretKey' },
      oss: { accessKey: 'accessKeyId', secretKey: 'accessKeySecret' },
      qiniu: { accessKey: 'accessKey', secretKey: 'secretKey' },
      upyun: { accessKey: 'operator', secretKey: 'password' },
      s3: { accessKey: 'accessKeyId', secretKey: 'secretAccessKey' },
      minio: { accessKey: 'accessKey', secretKey: 'secretKey' }
    }
    const mapping = fieldMap[type] || {}
    
    // 构建 config 对象
    const config: any = {
      bucket,
      endpoint: endpoint || '',
      customDomain: customDomain || '',
      [mapping.accessKey || 'accessKey']: accessKey,
      [mapping.secretKey || 'secretKey']: secretKey
    }
    
    // S3 添加 region 字段
    if (type === 's3') {
      config.region = region || ''
    }
    
    // MinIO 添加 useSSL 字段
    if (type === 'minio') {
      config.useSSL = useSSL === 1
    }
    
    const res = await apiService.testStorageConnection(type, config)
    MessagePlugin[res.success ? 'success' : 'error'](res.message || '测试完成')
  } catch (error: any) {
    MessagePlugin.error(error.response?.data?.message || '测试失败')
  } finally {
    testing.value = false
  }
}

const setDefault = async (id: number) => {
  settingDefault.value = id
  try {
    await apiService.setDefaultStorage(id)
    MessagePlugin.success('设置成功')
    loadData()
  } catch (error: any) {
    MessagePlugin.error(error.message)
  } finally {
    settingDefault.value = null
  }
}

const remove = async (id: string) => {
  try {
    await apiService.deleteStorage(id)
    MessagePlugin.success('删除成功')
    loadData()
  } catch (error: any) {
    MessagePlugin.error(error.message)
  }
}

onMounted(loadData)
</script>

<style scoped>
.admin-page {
  max-width: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-title h1 {
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

/* Storage Grid */
.storage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.storage-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s;
}

.storage-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #c9cdd4;
}

.storage-card.is-default {
  border-color: var(--td-brand-color);
  background: linear-gradient(135deg, #fff 0%, var(--td-brand-color-light) 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.storage-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.storage-icon.cos { background: linear-gradient(135deg, #0052d9, #1890ff); }
.storage-icon.oss { background: linear-gradient(135deg, #ff6a00, #ff9a44); }
.storage-icon.qiniu { background: linear-gradient(135deg, #00b578, #00d68a); }
.storage-icon.upyun { background: linear-gradient(135deg, #f53f3f, #ff7d7d); }
.storage-icon.s3 { background: linear-gradient(135deg, #232f3e, #37475a); }
.storage-icon.minio { background: linear-gradient(135deg, #c72c48, #e85d75); }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c9cdd4;
}

.status-dot.connected { background: #00b578; }
.status-dot.error { background: #f53f3f; }

.card-body {
  margin-bottom: 16px;
}

.storage-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.storage-type {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
}

.storage-domain {
  font-size: 13px;
  color: #4e5969;
  word-break: break-all;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.default-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--td-brand-color);
  font-weight: 500;
}

.default-placeholder {
  width: 50px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* Add Card */
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 2px dashed #c9cdd4;
  cursor: pointer;
  color: #86909c;
  gap: 8px;
}

.add-card:hover {
  border-color: var(--td-brand-color);
  color: var(--td-brand-color);
  background: var(--td-brand-color-light);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #c9cdd4;
}

.empty-icon {
  color: #c9cdd4;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 500;
  color: #4e5969;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

/* Drawer Form */
.drawer-form {
  padding: 8px 0;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: #f53f3f;
  margin-left: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-divider {
  height: 1px;
  background: #e5e6eb;
  margin: 24px 0;
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

/* Type Grid */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #4e5969;
}

.type-item:hover {
  border-color: var(--td-brand-color);
  color: var(--td-brand-color);
}

.type-item.active {
  border-color: var(--td-brand-color);
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

/* Options */
.form-options {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
}

/* SSL 开关样式 */
.ssl-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 32px;
}

.ssl-hint {
  font-size: 13px;
  color: #4e5969;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #1d2129;
}
</style>
