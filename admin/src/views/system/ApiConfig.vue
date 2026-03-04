<template>
  <div class="api-config-page">
    <div class="page-header">
      <h1>API配置管理</h1>
      <p>管理系统的API连接配置和数据模式</p>
    </div>
    
    <!-- API状态卡片 -->
    <a-card class="status-card" title="API连接状态">
      <div class="status-content">
        <div class="status-item">
          <div class="status-label">当前API地址：</div>
          <div class="status-value">{{ apiConfig.BASE_URL }}</div>
        </div>
        <div class="status-item">
          <div class="status-label">连接状态：</div>
          <div class="status-value">
            <a-badge 
              :status="apiStatus ? 'success' : 'danger'" 
              :text="apiStatus ? '连接正常' : '连接失败'" 
            />
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">最后检查时间：</div>
          <div class="status-value">{{ lastCheckTime }}</div>
        </div>
      </div>
      
      <template #extra>
        <a-space>
          <a-button @click="checkApiStatus" :loading="checking">
            <template #icon>
              <icon-refresh />
            </template>
            检查连接
          </a-button>
        </a-space>
      </template>
    </a-card>
    
    <!-- API配置表单 -->
    <a-card class="config-card" title="API配置">
      <a-form
        ref="formRef"
        :model="configForm"
        :rules="rules"
        layout="vertical"
        @submit="handleSaveConfig"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="API基础地址" field="baseUrl">
              <a-input 
                v-model="configForm.baseUrl" 
                placeholder="请输入API基础地址"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="请求超时时间(ms)" field="timeout">
              <a-input-number 
                v-model="configForm.timeout" 
                :min="1000"
                :max="60000"
                :step="1000"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="上传文件最大大小(MB)" field="uploadMaxSize">
              <a-input-number 
                v-model="configForm.uploadMaxSize" 
                :min="1"
                :max="100"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="saving">
              保存配置
            </a-button>
            <a-button @click="resetConfig">
              重置配置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- API端点列表 -->
    <a-card class="endpoints-card" title="API端点列表">
      <template #extra>
        <a-tag color="blue">共 {{ endpointsList.length }} 个端点</a-tag>
      </template>
      
      <a-table 
        :data="endpointsList" 
        :pagination="false"
        size="small"
        :scroll="{ y: 600 }"
      >
        <template #columns>
          <a-table-column title="功能模块" data-index="module" :width="150">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.module }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="端点路径" data-index="endpoint" :width="300">
            <template #cell="{ record }">
              <code style="background: #f2f3f5; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                {{ record.endpoint }}
              </code>
            </template>
          </a-table-column>
          <a-table-column title="请求方法" data-index="method" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getMethodColor(record.method)">
                {{ record.method }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="record.status === 'active' ? 'success' : 'normal'"
                :text="record.status === 'active' ? '正常' : '异常'"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'
import { API_CONFIG } from '@/api/config'
import { apiChecker } from '@/utils/apiChecker'
import { useMenuStore } from '@/stores/menu'

export default {
  name: 'ApiConfig',
  components: {
    IconRefresh
  },
  setup() {
    const menuStore = useMenuStore()
    const formRef = ref()
    
    const checking = ref(false)
    const saving = ref(false)
    const apiStatus = ref(null)
    const lastCheckTime = ref('')
    
    // API配置
    const apiConfig = reactive({ ...API_CONFIG })
    
    // 配置表单
    const configForm = reactive({
      baseUrl: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      uploadMaxSize: Math.round(API_CONFIG.UPLOAD?.MAX_SIZE / 1024 / 1024) || 10,
      useMockData: API_CONFIG.USE_MOCK_DATA
    })
    
    // 表单验证规则
    const rules = {
      baseUrl: [
        { required: true, message: '请输入API基础地址' },
        { 
          pattern: /^https?:\/\/.+/, 
          message: '请输入有效的URL地址' 
        }
      ],
      timeout: [
        { required: true, message: '请输入超时时间' }
      ],
      uploadMaxSize: [
        { required: true, message: '请输入上传文件最大大小' }
      ]
    }
    
    // API端点列表 - 根据通用摆渡云后台管理系统API文档更新
    const endpointsList = computed(() => [
      // 认证管理
      { module: '认证管理', endpoint: '/auth/login', method: 'POST', description: '管理员登录', status: 'active' },
      { module: '认证管理', endpoint: '/auth/logout', method: 'POST', description: '退出登录', status: 'active' },
      { module: '认证管理', endpoint: '/auth/info', method: 'GET', description: '获取当前用户信息', status: 'active' },
      { module: '认证管理', endpoint: '/auth/profile', method: 'PUT', description: '更新个人信息', status: 'active' },
      { module: '认证管理', endpoint: '/auth/change-password', method: 'POST', description: '修改密码', status: 'active' },
      
      // 用户管理
      { module: '用户管理', endpoint: '/users', method: 'GET', description: '获取用户列表', status: 'active' },
      { module: '用户管理', endpoint: '/users', method: 'POST', description: '创建用户', status: 'active' },
      { module: '用户管理', endpoint: '/users/{id}', method: 'GET', description: '获取用户详情', status: 'active' },
      { module: '用户管理', endpoint: '/users/{id}', method: 'PUT', description: '更新用户信息', status: 'active' },
      { module: '用户管理', endpoint: '/users/{id}', method: 'DELETE', description: '删除用户', status: 'active' },
      { module: '用户管理', endpoint: '/users/{id}/reset-password', method: 'POST', description: '重置用户密码', status: 'active' },
      { module: '用户管理', endpoint: '/users/{id}/toggle-status', method: 'POST', description: '切换用户状态', status: 'active' },
      { module: '用户管理', endpoint: '/users/{id}/recharge', method: 'POST', description: '用户充值', status: 'active' },
      
      // 用户等级管理
      { module: '用户等级', endpoint: '/user-levels', method: 'GET', description: '获取用户等级列表', status: 'active' },
      { module: '用户等级', endpoint: '/user-levels', method: 'POST', description: '创建用户等级', status: 'active' },
      { module: '用户等级', endpoint: '/user-levels/{id}', method: 'GET', description: '获取等级详情', status: 'active' },
      { module: '用户等级', endpoint: '/user-levels/{id}', method: 'PUT', description: '更新用户等级', status: 'active' },
      { module: '用户等级', endpoint: '/user-levels/{id}', method: 'DELETE', description: '删除用户等级', status: 'active' },
      { module: '用户等级', endpoint: '/user-levels/all', method: 'GET', description: '获取所有等级（下拉选择）', status: 'active' },
      
      // 文章管理
      { module: '文章管理', endpoint: '/articles', method: 'GET', description: '获取文章列表', status: 'active' },
      { module: '文章管理', endpoint: '/articles', method: 'POST', description: '创建文章', status: 'active' },
      { module: '文章管理', endpoint: '/articles/{id}', method: 'GET', description: '获取文章详情', status: 'active' },
      { module: '文章管理', endpoint: '/articles/{id}', method: 'PUT', description: '更新文章', status: 'active' },
      { module: '文章管理', endpoint: '/articles/{id}', method: 'DELETE', description: '删除文章', status: 'active' },
      
      // 文章分类管理
      { module: '文章分类', endpoint: '/article-categories', method: 'GET', description: '获取分类列表', status: 'active' },
      { module: '文章分类', endpoint: '/article-categories', method: 'POST', description: '创建分类', status: 'active' },
      { module: '文章分类', endpoint: '/article-categories/{id}', method: 'PUT', description: '更新分类', status: 'active' },
      { module: '文章分类', endpoint: '/article-categories/{id}', method: 'DELETE', description: '删除分类', status: 'active' },
      { module: '文章分类', endpoint: '/article-categories/all', method: 'GET', description: '获取所有分类', status: 'active' },
      
      // 文章标签管理
      { module: '文章标签', endpoint: '/article-tags', method: 'GET', description: '获取标签列表', status: 'active' },
      { module: '文章标签', endpoint: '/article-tags', method: 'POST', description: '创建标签', status: 'active' },
      { module: '文章标签', endpoint: '/article-tags/{id}', method: 'PUT', description: '更新标签', status: 'active' },
      { module: '文章标签', endpoint: '/article-tags/{id}', method: 'DELETE', description: '删除标签', status: 'active' },
      { module: '文章标签', endpoint: '/article-tags/all', method: 'GET', description: '获取所有标签', status: 'active' },
      
      // 存储配置管理
      { module: '存储管理', endpoint: '/storage', method: 'GET', description: '获取存储配置列表', status: 'active' },
      { module: '存储管理', endpoint: '/storage', method: 'POST', description: '创建存储配置', status: 'active' },
      { module: '存储管理', endpoint: '/storage/{id}', method: 'GET', description: '获取存储配置详情', status: 'active' },
      { module: '存储管理', endpoint: '/storage/{id}', method: 'PUT', description: '更新存储配置', status: 'active' },
      { module: '存储管理', endpoint: '/storage/{id}', method: 'DELETE', description: '删除存储配置', status: 'active' },
      { module: '存储管理', endpoint: '/storage/{id}/default', method: 'POST', description: '设置默认存储', status: 'active' },
      
      // 文件管理
      { module: '文件管理', endpoint: '/storage/upload', method: 'POST', description: '文件上传', status: 'active' },
      { module: '文件管理', endpoint: '/storage/files', method: 'GET', description: '获取文件列表', status: 'active' },
      { module: '文件管理', endpoint: '/storage/files/{id}', method: 'DELETE', description: '删除文件', status: 'active' },
      
      // 系统配置管理
      { module: '系统配置', endpoint: '/configs/site/info', method: 'GET', description: '获取网站配置', status: 'active' },
      { module: '系统配置', endpoint: '/configs/site/save', method: 'POST', description: '保存网站配置', status: 'active' },
      { module: '系统配置', endpoint: '/configs/system/info', method: 'GET', description: '获取系统配置', status: 'active' },
      { module: '系统配置', endpoint: '/configs/system/save', method: 'POST', description: '保存系统配置', status: 'active' },
      { module: '系统配置', endpoint: '/configs/email/info', method: 'GET', description: '获取邮件配置', status: 'active' },
      { module: '系统配置', endpoint: '/configs/email/save', method: 'POST', description: '保存邮件配置', status: 'active' },
      { module: '系统配置', endpoint: '/configs/email/test', method: 'POST', description: '测试邮件配置', status: 'active' }
    ])
    
    // 检查API状态
    const checkApiStatus = async () => {
      checking.value = true
      try {
        const status = await apiChecker.getApiStatus(true)
        apiStatus.value = status
        lastCheckTime.value = new Date().toLocaleString()
        
        if (status) {
          Message.success('API连接检查成功')
        } else {
          Message.warning('API连接检查失败')
        }
      } catch (error) {
        Message.error('检查API状态时发生错误')
      } finally {
        checking.value = false
      }
    }
    
    // 保存配置
    const handleSaveConfig = async (data) => {
      if (!data.errors) {
        saving.value = true
        try {
          // 更新API配置
          apiConfig.BASE_URL = configForm.baseUrl
          apiConfig.TIMEOUT = configForm.timeout
          apiConfig.USE_MOCK_DATA = configForm.useMockData
          apiConfig.UPLOAD.MAX_SIZE = configForm.uploadMaxSize * 1024 * 1024
          
          // 保存到本地存储
          localStorage.setItem('api_config', JSON.stringify({
            baseUrl: configForm.baseUrl,
            timeout: configForm.timeout,
            uploadMaxSize: configForm.uploadMaxSize,
            useMockData: configForm.useMockData
          }))
          
          Message.success('配置保存成功')
          
          // 重新检查API状态
          await checkApiStatus()
        } catch (error) {
          Message.error('保存配置失败')
        } finally {
          saving.value = false
        }
      }
    }
    
    // 重置配置
    const resetConfig = () => {
      configForm.baseUrl = 'http://localhost:8000/admin'
      configForm.timeout = 10000
      configForm.uploadMaxSize = 10
      configForm.useMockData = false
      
      Message.info('配置已重置')
    }
    
    // 获取请求方法颜色
    const getMethodColor = (method) => {
      const colors = {
        'GET': 'green',
        'POST': 'blue',
        'PUT': 'orange',
        'DELETE': 'red',
        'PATCH': 'purple'
      }
      return colors[method] || 'gray'
    }
    
    onMounted(async () => {
      menuStore.generateBreadcrumbs('/system/api-config')
      
      // 加载保存的配置
      const savedConfig = localStorage.getItem('api_config')
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig)
          Object.assign(configForm, config)
        } catch (error) {
          // 配置加载失败，使用默认配置
        }
      }
      

      
      // 初始检查API状态
      await checkApiStatus()
    })
    
    return {
      formRef,
      checking,
      saving,
      apiStatus,
      lastCheckTime,
      apiConfig,
      configForm,
      rules,
      endpointsList,
      checkApiStatus,
      handleSaveConfig,
      resetConfig,
      getMethodColor
    }
  }
}
</script>

<style scoped>
.api-config-page {
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

.status-card,
.config-card,
.endpoints-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
}

.status-label {
  width: 120px;
  color: #86909c;
  font-size: 14px;
}

.status-value {
  flex: 1;
  font-size: 14px;
}
</style> 