<template>
  <div class="storage-page">
    <div class="page-header">
      <h1>存储设置</h1>
      <p>管理系统的文件存储配置，支持本地存储和多种云存储服务</p>
    </div>
    
    <!-- 操作栏 -->
    <a-card class="action-card">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <icon-plus />
          </template>
          新增存储配置
        </a-button>
        <a-button @click="loadData">
          <template #icon>
            <icon-refresh />
          </template>
          刷新
        </a-button>
      </a-space>
    </a-card>
    
    <!-- 存储配置列表 -->
    <a-card class="table-card">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="false"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="存储名称" data-index="name" :width="150" />
          <a-table-column title="存储类型" data-index="type" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeText(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="访问域名" data-index="config" :width="200">
            <template #cell="{ record }">
              {{ record.config?.url || record.config?.domain || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="存储桶/目录" data-index="config" :width="150">
            <template #cell="{ record }">
              {{ record.config?.bucket || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="record.status === 1 ? 'success' : 'danger'"
                :text="record.status === 1 ? '启用' : '禁用'"
              />
            </template>
          </a-table-column>
          <a-table-column title="默认配置" data-index="is_default" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.is_default" color="gold">默认</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="create_time" :width="180" />
          <a-table-column title="操作" :width="250" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  @click="handleView(record)"
                >
                  查看
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="handleEdit(record)"
                >
                  编辑
                </a-button>
                <a-button
                  v-if="!record.is_default"
                  type="text"
                  size="small"
                  status="success"
                  @click="handleSetDefault(record)"
                >
                  设为默认
                </a-button>
                <a-popconfirm
                  content="确定要删除这个存储配置吗？"
                  @ok="handleDelete(record)"
                >
                  <a-button
                    type="text"
                    size="small"
                    status="danger"
                    :disabled="!!record.is_default"
                  >
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    
    <!-- 存储配置详情模态框 -->
    <a-modal
      v-model:visible="detailVisible"
      title="存储配置详情"
      width="600px"
      :footer="false"
    >
      <div v-if="currentStorage" class="storage-detail">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="存储名称">
            {{ currentStorage.name }}
          </a-descriptions-item>
          <a-descriptions-item label="存储类型">
            <a-tag :color="getTypeColor(currentStorage.type)">
              {{ getTypeText(currentStorage.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="访问域名">
            {{ currentStorage.config?.url || currentStorage.config?.domain || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="存储桶">
            {{ currentStorage.config?.bucket || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="访问密钥" v-if="currentStorage.type !== 'local'">
            {{ getAccessKey(currentStorage) }}
          </a-descriptions-item>
          <a-descriptions-item label="地域" v-if="currentStorage.config?.region">
            {{ currentStorage.config.region }}
          </a-descriptions-item>
          <a-descriptions-item label="节点/Endpoint" v-if="currentStorage.config?.endpoint">
            {{ currentStorage.config.endpoint }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-badge
              :status="currentStorage.status === 1 ? 'success' : 'danger'"
              :text="currentStorage.status === 1 ? '启用' : '禁用'"
            />
          </a-descriptions-item>
          <a-descriptions-item label="默认配置">
            <a-tag v-if="currentStorage.is_default" color="gold">默认</a-tag>
            <span v-else>否</span>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ currentStorage.create_time }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
    
    <!-- 添加/编辑存储配置模态框 -->
    <a-modal
      v-model:visible="formVisible"
      :title="isEdit ? '编辑存储配置' : '添加存储配置'"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitLoading"
    >
      <a-form
        ref="formRef"
        :model="storageForm"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="存储名称">
              <a-input
                v-model="storageForm.name"
                placeholder="请输入存储名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="type" label="存储类型">
              <a-select
                v-model="storageForm.type"
                placeholder="请选择存储类型"
                @change="handleTypeChange"
              >
                <a-option value="local">本地存储</a-option>
                <a-option value="aliyun_oss">阿里云OSS</a-option>
                <a-option value="tencent_cos">腾讯云COS</a-option>
                <a-option value="backblaze_b2">Backblaze B2</a-option>
                <a-option value="minio">MinIO</a-option>
                <a-option value="cloudflare_r2">Cloudflare R2</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <!-- 访问域名 -->
        <a-form-item field="config.url" label="访问域名">
          <a-input
            v-model="storageForm.config.url"
            placeholder="请输入访问域名，如：https://your-domain.com"
          />
        </a-form-item>
        
        <!-- 本地存储配置 -->
        <template v-if="storageForm.type === 'local'">
          <!-- 本地存储无需额外配置 -->
        </template>
        
        <!-- 阿里云OSS配置 -->
        <template v-if="storageForm.type === 'aliyun_oss'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.access_id" label="AccessKey ID">
                <a-input
                  v-model="storageForm.config.access_id"
                  placeholder="请输入AccessKey ID"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.access_secret" label="AccessKey Secret">
                <a-input-password
                  v-model="storageForm.config.access_secret"
                  placeholder="请输入AccessKey Secret"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.bucket" label="Bucket名称">
                <a-input
                  v-model="storageForm.config.bucket"
                  placeholder="请输入Bucket名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.endpoint" label="Endpoint">
                <a-input
                  v-model="storageForm.config.endpoint"
                  placeholder="如：oss-cn-hangzhou.aliyuncs.com"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
        
        <!-- 腾讯云COS配置 -->
        <template v-if="storageForm.type === 'tencent_cos'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.secret_id" label="SecretId">
                <a-input
                  v-model="storageForm.config.secret_id"
                  placeholder="请输入SecretId"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.secret_key" label="SecretKey">
                <a-input-password
                  v-model="storageForm.config.secret_key"
                  placeholder="请输入SecretKey"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="config.app_id" label="AppId">
                <a-input
                  v-model="storageForm.config.app_id"
                  placeholder="请输入AppId"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="config.region" label="地域">
                <a-input
                  v-model="storageForm.config.region"
                  placeholder="如：ap-beijing"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="config.bucket" label="Bucket名称">
                <a-input
                  v-model="storageForm.config.bucket"
                  placeholder="请输入Bucket名称"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
        
        <!-- Backblaze B2配置 -->
        <template v-if="storageForm.type === 'backblaze_b2'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.access_key" label="Access Key">
                <a-input
                  v-model="storageForm.config.access_key"
                  placeholder="请输入Key ID"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.secret_key" label="Secret Key">
                <a-input-password
                  v-model="storageForm.config.secret_key"
                  placeholder="请输入Application Key"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="config.region" label="地域">
                <a-input
                  v-model="storageForm.config.region"
                  placeholder="如：us-west-000"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="config.bucket" label="Bucket名称">
                <a-input
                  v-model="storageForm.config.bucket"
                  placeholder="请输入Bucket名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="config.endpoint" label="Endpoint">
                <a-input
                  v-model="storageForm.config.endpoint"
                  placeholder="如：s3.us-west-000.backblazeb2.com"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.use_path_style_endpoint" label="路径样式">
                <a-switch
                  v-model="storageForm.config.use_path_style_endpoint"
                  checked-text="启用"
                  unchecked-text="禁用"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
        
        <!-- MinIO配置 -->
        <template v-if="storageForm.type === 'minio'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.access_key" label="Access Key">
                <a-input
                  v-model="storageForm.config.access_key"
                  placeholder="请输入Access Key"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.secret_key" label="Secret Key">
                <a-input-password
                  v-model="storageForm.config.secret_key"
                  placeholder="请输入Secret Key"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.bucket" label="Bucket名称">
                <a-input
                  v-model="storageForm.config.bucket"
                  placeholder="请输入Bucket名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.endpoint" label="MinIO服务地址">
                <a-input
                  v-model="storageForm.config.endpoint"
                  placeholder="如：https://minio.example.com"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.region" label="地域">
                <a-input
                  v-model="storageForm.config.region"
                  placeholder="默认：us-east-1"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.use_path_style_endpoint" label="路径样式">
                <a-switch
                  v-model="storageForm.config.use_path_style_endpoint"
                  checked-text="启用"
                  unchecked-text="禁用"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
        
        <!-- Cloudflare R2配置 -->
        <template v-if="storageForm.type === 'cloudflare_r2'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.access_key" label="Access Key ID">
                <a-input
                  v-model="storageForm.config.access_key"
                  placeholder="请输入Access Key ID"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.secret_key" label="Secret Access Key">
                <a-input-password
                  v-model="storageForm.config.secret_key"
                  placeholder="请输入Secret Access Key"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.bucket" label="Bucket名称">
                <a-input
                  v-model="storageForm.config.bucket"
                  placeholder="请输入Bucket名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.endpoint" label="Endpoint">
                <a-input
                  v-model="storageForm.config.endpoint"
                  placeholder="https://account_id.r2.cloudflarestorage.com"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="config.region" label="地域">
                <a-input
                  v-model="storageForm.config.region"
                  placeholder="默认：auto"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="config.use_path_style_endpoint" label="路径样式">
                <a-switch
                  v-model="storageForm.config.use_path_style_endpoint"
                  checked-text="启用"
                  unchecked-text="禁用"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="status" label="状态">
              <a-radio-group v-model="storageForm.status">
                <a-radio :value="1">启用</a-radio>
                <a-radio :value="0">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="is_default" label="设为默认">
              <a-switch
                v-model="storageForm.is_default"
                :checked-value="1"
                :unchecked-value="0"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { storageApi } from '@/api/storage'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconRefresh
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'Storage',
  components: {
    IconPlus,
    IconRefresh
  },
  setup() {
    const menuStore = useMenuStore()
    
    const loading = ref(false)
    const detailVisible = ref(false)
    const formVisible = ref(false)
    const submitLoading = ref(false)
    const isEdit = ref(false)
    const currentStorage = ref(null)
    const formRef = ref(null)
    
    const storageForm = reactive({
      name: '',
      type: 'local',
      config: {
        url: '',
        bucket: '',
        access_id: '',
        access_secret: '',
        region: '',
        endpoint: '',
        secret_id: '',
        secret_key: '',
        app_id: '',
        access_key: '',
        use_path_style_endpoint: false
      },
      is_default: 0,
      status: 1,
      remark: ''
    })
    
    const rules = {
      name: [{ required: true, message: '请输入存储名称' }],
      type: [{ required: true, message: '请选择存储类型' }],
      'config.url': [{ required: true, message: '请输入访问域名' }],
      'config.bucket': [{ required: true, message: '请输入存储桶/目录' }]
    }
    
    const tableData = ref([])
    
    // 获取存储类型颜色
    const getTypeColor = (type) => {
      const colors = {
        local: 'blue',
        aliyun_oss: 'orange',
        tencent_cos: 'purple',
        backblaze_b2: 'cyan',
        minio: 'magenta',
        cloudflare_r2: 'red'
      }
      return colors[type] || 'gray'
    }
    
    // 获取存储类型文本
    const getTypeText = (type) => {
      const texts = {
        local: '本地存储',
        aliyun_oss: '阿里云OSS',
        tencent_cos: '腾讯云COS',
        backblaze_b2: 'Backblaze B2',
        minio: 'MinIO',
        cloudflare_r2: 'Cloudflare R2'
      }
      return texts[type] || '未知'
    }
    
    // 获取存储桶占位符
    const getBucketPlaceholder = (type) => {
      const placeholders = {
        local: '请输入存储目录',
        qiniu_kodo: '请输入存储空间名称',
        aliyun_oss: '请输入Bucket名称',
        tencent_cos: '请输入Bucket名称',
        aws_s3: '请输入Bucket名称'
      }
      return placeholders[type] || '请输入存储桶/目录'
    }
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      try {
        const result = await storageApi.getStorageConfigs()
        

        
        // 🎯 响应拦截器已经解包数据
        if (Array.isArray(result)) {
          tableData.value = result
        } else if (result && Array.isArray(result.data)) {
          tableData.value = result.data
        } else {
          tableData.value = []
        }
        

      } catch (error) {
        console.error('加载存储配置失败:', error)
        Message.error('加载数据失败')
      } finally {
        loading.value = false
      }
    }
    
    // 新增存储配置
    const handleAdd = () => {
      isEdit.value = false
      resetForm()
      formVisible.value = true
    }
    
    // 查看存储配置
    const handleView = (record) => {
      currentStorage.value = record
      detailVisible.value = true
    }
    
    // 编辑存储配置
    const handleEdit = (record) => {
      isEdit.value = true
      
      // 正确处理config对象的数据结构
      Object.assign(storageForm, {
        id: record.id,
        name: record.name,
        type: record.type,
        config: {
          url: record.config?.url || '',
          bucket: record.config?.bucket || '',
          access_id: record.config?.access_id || '',
          access_secret: record.config?.access_secret || '',
          region: record.config?.region || '',
          endpoint: record.config?.endpoint || '',
          secret_id: record.config?.secret_id || '',
          secret_key: record.config?.secret_key || '',
          app_id: record.config?.app_id || '',
          access_key: record.config?.access_key || '',
          use_path_style_endpoint: record.config?.use_path_style_endpoint || false
        },
        is_default: record.is_default,
        status: record.status,
        remark: record.remark || ''
      })
      
      formVisible.value = true
    }
    
    // 设为默认
    const handleSetDefault = async (record) => {
      try {
        await storageApi.setDefaultStorage(record.id)
        Message.success('设置成功')
        loadData()
      } catch (error) {
        console.error('设置默认存储失败:', error)
        Message.error(`设置失败: ${error.message || '未知错误'}`)
      }
    }
    
    // 删除存储配置
    const handleDelete = async (record) => {
      try {
        await storageApi.deleteStorageConfig(record.id)
        Message.success('删除成功')
        loadData()
      } catch (error) {
        console.error('删除存储配置失败:', error)
        Message.error('删除失败')
      }
    }
    
    // 存储类型变化
    const handleTypeChange = (type) => {
      // 清空配置
      Object.assign(storageForm.config, {
        url: '',
        bucket: '',
        access_id: '',
        access_secret: '',
        region: '',
        endpoint: '',
        secret_id: '',
        secret_key: '',
        app_id: '',
        access_key: '',
        use_path_style_endpoint: false
      })
      
      // 根据类型设置默认值
      if (type === 'minio') {
        storageForm.config.region = 'us-east-1'
        storageForm.config.use_path_style_endpoint = true
      } else if (type === 'cloudflare_r2') {
        storageForm.config.region = 'auto'
        storageForm.config.use_path_style_endpoint = false
      } else if (type === 'backblaze_b2') {
        storageForm.config.use_path_style_endpoint = true
      }
    }
    
    // 提交表单
    const handleSubmit = async () => {
      try {
        const valid = await formRef.value.validate()
        if (!valid) {
          submitLoading.value = true
          
          if (isEdit.value) {
            await storageApi.updateStorageConfig(storageForm.id, storageForm)
            Message.success('更新成功')
          } else {
            await storageApi.createStorageConfig(storageForm)
            Message.success('添加成功')
          }
          
          formVisible.value = false
          loadData()
        }
      } catch (error) {
        console.error('提交存储配置失败:', error)
        Message.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    // 取消
    const handleCancel = () => {
      formVisible.value = false
      resetForm()
    }
    
    // 重置表单
    const resetForm = () => {
      Object.assign(storageForm, {
        name: '',
        type: 'local',
        config: {
          url: '',
          bucket: '',
          access_id: '',
          access_secret: '',
          region: '',
          endpoint: '',
          secret_id: '',
          secret_key: '',
          app_id: '',
          access_key: '',
          use_path_style_endpoint: false
        },
        is_default: 0,
        status: 1,
        remark: ''
      })
    }
    
    // 获取访问密钥
    const getAccessKey = (storage) => {
      if (storage.type === 'aliyun_oss') {
        return `${storage.config.access_id}/*${storage.config.access_secret}`
      } else if (storage.type === 'tencent_cos') {
        return `${storage.config.secret_id}/*${storage.config.secret_key}`
      } else if (storage.type === 'backblaze_b2') {
        return `${storage.config.access_key}:${storage.config.secret_key}`
      } else if (storage.type === 'minio') {
        return `${storage.config.access_key}:${storage.config.secret_key}`
      } else if (storage.type === 'cloudflare_r2') {
        return `${storage.config.access_key}:${storage.config.secret_key}`
      }
      return '-'
    }
    
    onMounted(() => {
      menuStore.generateBreadcrumbs('/system/storage')
      loadData()
    })
    
    return {
      loading,
      detailVisible,
      formVisible,
      submitLoading,
      isEdit,
      currentStorage,
      formRef,
      storageForm,
      rules,
      tableData,
      getTypeColor,
      getTypeText,
      getBucketPlaceholder,
      loadData,
      handleAdd,
      handleView,
      handleEdit,
      handleSetDefault,
      handleDelete,
      handleTypeChange,
      handleSubmit,
      handleCancel,
      getAccessKey
    }
  }
}
</script>

<style scoped>
.storage-page {
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

.action-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.storage-detail {
  padding: 16px 0;
}
</style> 