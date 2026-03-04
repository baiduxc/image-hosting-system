<template>
  <div class="users-page">
    <div class="page-header">
      <h1>用户管理</h1>
      <p>管理系统中的所有用户</p>
    </div>
    
    <!-- 搜索和操作栏 -->
    <a-card class="search-card">
      <a-row :gutter="16" align="center">
        <a-col :span="5">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/昵称"
            allow-clear
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="用户状态"
            allow-clear
          >
            <a-option value="1">正常</a-option>
            <a-option value="0">禁用</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.level_id"
            placeholder="用户等级"
            allow-clear
          >
            <a-option
              v-for="level in userLevels"
              :key="level.id"
              :value="level.id"
            >
              {{ level.name }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="7">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" @click="handleAdd">
              <template #icon>
                <icon-plus />
              </template>
              新增用户
            </a-button>
            <a-button @click="handleExport">
              <template #icon>
                <icon-download />
              </template>
              导出数据
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>
    
    <!-- 用户列表 -->
    <a-card class="table-card">
      <a-table
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="头像" data-index="avatar" :width="80">
            <template #cell="{ record }">
              <a-avatar :size="40">
                <img v-if="record.avatar" :src="record.avatar" :alt="record.username" />
                <span v-else>{{ record.username?.charAt(0)?.toUpperCase() }}</span>
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column title="用户名" data-index="username" :width="150">
            <template #cell="{ record }">
              <div class="user-info">
                <div class="username">{{ record.username }}</div>
                <div class="nickname">{{ record.nickname }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="邮箱" data-index="email" :width="200" />
          <a-table-column title="手机号" data-index="phone" :width="130" />
          <a-table-column title="用户等级" data-index="level_id" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getLevelColor(record.level_id)">
                {{ getLevelName(record.level_id) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="余额" data-index="balance" :width="100">
            <template #cell="{ record }">
              ¥{{ record.balance || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="getStatusBadge(record.status)"
                :text="getStatusText(record.status)"
              />
            </template>
          </a-table-column>
          <a-table-column title="注册时间" data-index="create_time" :width="180" />
          <a-table-column title="最后登录" data-index="last_login_time" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
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
                <a-dropdown>
                  <a-button type="text" size="small">
                    更多
                    <icon-down />
                  </a-button>
                  <template #content>
                    <a-doption @click="handleRecharge(record)">
                      会员充值
                    </a-doption>
                    <a-doption @click="handleSetLevel(record)">
                      设置等级
                    </a-doption>
                    <a-doption @click="handleResetPassword(record)">
                      重置密码
                    </a-doption>
                    <a-doption @click="handleToggleStatus(record)">
                      {{ record.status === 1 ? '禁用' : '启用' }}
                    </a-doption>
                    <a-doption @click="handleDelete(record)" class="danger">
                      删除用户
                    </a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    
    <!-- 用户详情模态框 -->
    <a-modal
      v-model:visible="detailVisible"
      title="用户详情"
      width="600px"
      :footer="false"
    >
      <div v-if="currentUser" class="user-detail">
        <div class="detail-header">
          <a-avatar :size="80">
            <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.username" />
            <span v-else>{{ currentUser.username?.charAt(0)?.toUpperCase() }}</span>
          </a-avatar>
          <div class="header-info">
            <h3>{{ currentUser.username }}</h3>
            <p>{{ currentUser.nickname }}</p>
          </div>
        </div>
        
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="用户ID">
            {{ currentUser.id }}
          </a-descriptions-item>
          <a-descriptions-item label="邮箱">
            {{ currentUser.email }}
          </a-descriptions-item>
          <a-descriptions-item label="手机号">
            {{ currentUser.phone }}
          </a-descriptions-item>
          <a-descriptions-item label="用户等级">
            {{ getLevelName(currentUser.level_id) }}
          </a-descriptions-item>
          <a-descriptions-item label="余额">
            ¥{{ currentUser.balance || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-badge
              :status="getStatusBadge(currentUser.status)"
              :text="getStatusText(currentUser.status)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="注册时间">
            {{ currentUser.create_time }}
          </a-descriptions-item>
          <a-descriptions-item label="最后登录">
            {{ currentUser.last_login_time }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
    
    <!-- 添加/编辑用户模态框 -->
    <a-modal
      v-model:visible="formVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitLoading"
    >
      <a-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="username" label="用户名">
              <a-input
                v-model="userForm.username"
                placeholder="请输入用户名"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="nickname" label="昵称">
              <a-input
                v-model="userForm.nickname"
                placeholder="请输入昵称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="email" label="邮箱">
              <a-input
                v-model="userForm.email"
                placeholder="请输入邮箱"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="phone" label="手机号">
              <a-input
                v-model="userForm.phone"
                placeholder="请输入手机号"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="password" label="密码" v-if="!isEdit">
          <a-input-password
            v-model="userForm.password"
            placeholder="请输入密码"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="gender" label="性别">
              <a-radio-group v-model="userForm.gender">
                <a-radio :value="1">男</a-radio>
                <a-radio :value="2">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="level_id" label="用户等级">
              <a-select
                v-model="userForm.level_id"
                placeholder="请选择用户等级"
              >
                <a-option
                  v-for="level in userLevels"
                  :key="level.id"
                  :value="level.id"
                >
                  {{ level.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="userForm.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 会员充值模态框 -->
    <a-modal
      v-model:visible="rechargeVisible"
      title="会员充值"
      width="500px"
      @ok="handleRechargeSubmit"
      @cancel="handleRechargeCancel"
      :confirm-loading="rechargeLoading"
    >
      <a-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeRules"
        layout="vertical"
      >
        <div class="recharge-user-info">
          <a-avatar :size="50">
            <img v-if="currentRechargeUser?.avatar" :src="currentRechargeUser.avatar" :alt="currentRechargeUser.username" />
            <span v-else>{{ currentRechargeUser?.username?.charAt(0)?.toUpperCase() }}</span>
          </a-avatar>
          <div class="user-info-text">
            <div class="username">{{ currentRechargeUser?.username }}</div>
            <div class="balance">当前余额：¥{{ currentRechargeUser?.balance || 0 }}</div>
          </div>
        </div>
        
        <a-form-item field="amount" label="充值金额">
          <a-input-number
            v-model="rechargeForm.amount"
            placeholder="请输入充值金额"
            :min="0.01"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        
        <a-form-item field="description" label="充值说明">
          <a-textarea
            v-model="rechargeForm.description"
            placeholder="请输入充值说明（可选）"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 设置等级模态框 -->
    <a-modal
      v-model:visible="setLevelVisible"
      title="设置用户等级"
      width="500px"
      @ok="handleSetLevelSubmit"
      @cancel="handleSetLevelCancel"
      :confirm-loading="setLevelLoading"
    >
      <a-form
        ref="setLevelFormRef"
        :model="setLevelForm"
        :rules="setLevelRules"
        layout="vertical"
      >
        <div class="set-level-user-info">
          <a-avatar :size="50">
            <img v-if="currentSetLevelUser?.avatar" :src="currentSetLevelUser.avatar" :alt="currentSetLevelUser.username" />
            <span v-else>{{ currentSetLevelUser?.username?.charAt(0)?.toUpperCase() }}</span>
          </a-avatar>
          <div class="user-info-text">
            <div class="username">{{ currentSetLevelUser?.username }}</div>
            <div class="current-level">当前等级：{{ getLevelName(currentSetLevelUser?.level_id) }}</div>
          </div>
        </div>
        
        <a-form-item field="level_id" label="新等级">
          <a-select
            v-model="setLevelForm.level_id"
            placeholder="请选择新等级"
          >
            <a-option
              v-for="level in userLevels"
              :key="level.id"
              :value="level.id"
            >
              {{ level.name }}
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="expire_time" label="到期时间">
          <a-date-picker
            v-model="setLevelForm.expire_time"
            placeholder="请选择到期时间（可选）"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconDown
} from '@arco-design/web-vue/es/icon'
import { memberApi, memberLevelApi } from '@/api/members'

export default {
  name: 'UserList',
  components: {
    IconSearch,
    IconPlus,
    IconDownload,
    IconDown
  },
  setup() {
    const menuStore = useMenuStore()
    
    const loading = ref(false)
    const detailVisible = ref(false)
    const currentUser = ref(null)
    const formVisible = ref(false)
    const isEdit = ref(false)
    const submitLoading = ref(false)
    const formRef = ref(null)
    const userLevels = ref([])
    
    // 充值相关
    const rechargeVisible = ref(false)
    const currentRechargeUser = ref(null)
    const rechargeLoading = ref(false)
    const rechargeFormRef = ref(null)
    
    // 设置等级相关
    const setLevelVisible = ref(false)
    const currentSetLevelUser = ref(null)
    const setLevelLoading = ref(false)
    const setLevelFormRef = ref(null)
    
    const searchForm = reactive({
      keyword: '',
      status: '',
      level_id: ''
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showTotal: true,
      showPageSize: true
    })
    
    const userForm = reactive({
      username: '',
      nickname: '',
      email: '',
      phone: '',
      password: '',
      gender: 1,
      level_id: '',
      status: 1
    })
    
    // 充值表单
    const rechargeForm = reactive({
      amount: null,
      description: ''
    })
    
    // 设置等级表单
    const setLevelForm = reactive({
      level_id: '',
      expire_time: ''
    })
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' }
      ],
      nickname: [
        { required: true, message: '请输入昵称' }
      ],
      email: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入正确的邮箱格式' }
      ],
      phone: [
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
      ],
      password: [
        { required: !isEdit.value, message: '请输入密码' },
        { min: 6, message: '密码长度至少6位' }
      ],
      level_id: [
        { required: true, message: '请选择用户等级' }
      ]
    }

    // 充值表单验证规则
    const rechargeRules = {
      amount: [
        { required: true, message: '请输入充值金额' },
        { type: 'number', min: 0.01, message: '充值金额必须大于0' }
      ]
    }

    // 设置等级表单验证规则
    const setLevelRules = {
      level_id: [
        { required: true, message: '请选择新等级' }
      ]
    }

    const tableData = ref([])
    
    // 获取状态徽章
    const getStatusBadge = (status) => {
      const badges = {
        1: 'success',
        0: 'danger'
      }
      return badges[status] || 'normal'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        1: '正常',
        0: '禁用'
      }
      return texts[status] || '未知'
    }
    
    // 获取等级颜色
    const getLevelColor = (levelId) => {
      const level = userLevels.value.find(l => l.id === levelId)
      if (!level) return 'blue'
      
      const colors = {
        1: 'gray',    // 普通用户
        2: 'gold',    // VIP用户
        3: 'purple',  // 高级用户
        4: 'red'      // 管理员
      }
      return colors[levelId] || 'blue'
    }
    
    // 获取等级名称
    const getLevelName = (levelId) => {
      const level = userLevels.value.find(l => l.id === levelId)
      return level ? level.name : '未知等级'
    }
    
    // 加载用户等级
    const loadUserLevels = async () => {
      try {
        const response = await memberLevelApi.getAll()
        
        // 🎯 标准数据处理逻辑 - 响应拦截器已经解包数据
        if (Array.isArray(response)) {
          userLevels.value = response
        } else if (response && response.list && Array.isArray(response.list)) {
          userLevels.value = response.list
        } else {
          userLevels.value = []
          console.warn('用户等级API响应数据格式不符合预期:', response)
        }
        
      } catch (error) {
        console.error('加载用户等级失败:', error)
      }
    }
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      
      try {
        const params = {
          page: pagination.current,
          limit: pagination.pageSize,
          ...searchForm
        }
        
        const response = await memberApi.getList(params)
        
        // 🎯 标准数据处理逻辑 - 响应拦截器已经解包数据
        if (Array.isArray(response)) {
          // 情况1: 直接返回数组
          tableData.value = response
          pagination.total = response.length
        } else if (response && response.list && Array.isArray(response.list)) {
          // 情况2: 分页格式 {list: [], page: 1, total: 100}
          tableData.value = response.list
          pagination.total = response.total || 0
        } else {
          // 情况3: 兜底处理
          tableData.value = []
          pagination.total = 0
          console.warn('用户列表API响应数据格式不符合预期:', response)
        }
        
      } catch (error) {
        console.error('加载用户数据失败:', error)
        Message.error('加载用户数据失败')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      loadData()
    }
    
    // 重置
    const handleReset = () => {
      searchForm.keyword = ''
      searchForm.status = ''
      searchForm.level_id = ''
      pagination.current = 1
      loadData()
    }
    
    // 新增用户
    const handleAdd = () => {
      isEdit.value = false
      resetForm()
      formVisible.value = true
    }
    
    // 导出数据
    const handleExport = () => {
      Message.info('导出功能开发中...')
    }
    
    // 查看用户
    const handleView = (record) => {
      currentUser.value = record
      detailVisible.value = true
    }
    
    // 编辑用户
    const handleEdit = (record) => {
      isEdit.value = true
      Object.assign(userForm, {
        id: record.id,
        username: record.username,
        nickname: record.nickname,
        email: record.email,
        phone: record.phone,
        gender: record.gender || 1,
        level_id: record.level_id,
        status: record.status
      })
      formVisible.value = true
    }

    // 会员充值
    const handleRecharge = (record) => {
      currentRechargeUser.value = record
      rechargeForm.amount = null
      rechargeForm.description = ''
      rechargeVisible.value = true
    }

    // 提交充值
    const handleRechargeSubmit = async () => {
      try {
        const valid = await rechargeFormRef.value.validate()
        if (valid) return
        
        rechargeLoading.value = true
        
        const response = await memberApi.recharge(currentRechargeUser.value.id, {
          amount: rechargeForm.amount,
          description: rechargeForm.description || '管理员充值'
        })
        
        // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
        Message.success('充值成功')
        rechargeVisible.value = false
        loadData() // 刷新列表数据
      } catch (error) {
        console.error('充值失败:', error)
        Message.error('充值失败')
      } finally {
        rechargeLoading.value = false
      }
    }

    // 取消充值
    const handleRechargeCancel = () => {
      rechargeVisible.value = false
      rechargeForm.amount = null
      rechargeForm.description = ''
    }

    // 设置等级
    const handleSetLevel = (record) => {
      currentSetLevelUser.value = record
      setLevelForm.level_id = record.level_id
      setLevelForm.expire_time = ''
      setLevelVisible.value = true
    }

    // 提交设置等级
    const handleSetLevelSubmit = async () => {
      try {
        const valid = await setLevelFormRef.value.validate()
        if (valid) return
        
        setLevelLoading.value = true
        
        const data = {
          level_id: setLevelForm.level_id
        }
        
        // 如果设置了到期时间，添加到请求数据中
        if (setLevelForm.expire_time) {
          data.expire_time = setLevelForm.expire_time
        }
        
        const response = await memberApi.setLevel(currentSetLevelUser.value.id, data)
        
        // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
        Message.success('等级设置成功')
        setLevelVisible.value = false
        loadData() // 刷新列表数据
      } catch (error) {
        console.error('设置等级失败:', error)
        Message.error('设置等级失败')
      } finally {
        setLevelLoading.value = false
      }
    }

    // 取消设置等级
    const handleSetLevelCancel = () => {
      setLevelVisible.value = false
      setLevelForm.level_id = ''
      setLevelForm.expire_time = ''
    }
    
    // 重置密码
    const handleResetPassword = (record) => {
      Modal.confirm({
        title: '确认重置密码',
        content: `确定要重置用户 ${record.username} 的密码吗？`,
        onOk: async () => {
          try {
            const response = await memberApi.resetPassword(record.id, {
              password: '123456'
            })
            
            // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
            Message.success('密码重置成功，新密码为：123456')
          } catch (error) {
            console.error('重置密码失败:', error)
            Message.error('密码重置失败')
          }
        }
      })
    }
    
    // 切换状态
    const handleToggleStatus = (record) => {
      const action = record.status === 1 ? '禁用' : '启用'
      Modal.confirm({
        title: `确认${action}用户`,
        content: `确定要${action}用户 ${record.username} 吗？`,
        onOk: async () => {
          try {
            const response = await memberApi.toggleStatus(record.id)
            
            // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
            Message.success(`用户${action}成功`)
            loadData()
          } catch (error) {
            console.error(`${action}用户失败:`, error)
            Message.error(`用户${action}失败`)
          }
        }
      })
    }
    
    // 删除用户
    const handleDelete = (record) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除用户 ${record.username} 吗？此操作不可恢复。`,
        onOk: async () => {
          try {
            const response = await memberApi.delete(record.id)
            
            // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
            Message.success('用户删除成功')
            loadData()
          } catch (error) {
            console.error('删除用户失败:', error)
            Message.error('用户删除失败')
          }
        }
      })
    }
    
    // 分页变化
    const handlePageChange = (page) => {
      pagination.current = page
      loadData()
    }
    
    // 页大小变化
    const handlePageSizeChange = (pageSize) => {
      pagination.pageSize = pageSize
      pagination.current = 1
      loadData()
    }
    
    // 重置表单
    const resetForm = () => {
      Object.assign(userForm, {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        password: '',
        gender: 1,
        level_id: '',
        status: 1
      })
    }
    
    // 提交表单
    const handleSubmit = async () => {
      try {
        const valid = await formRef.value.validate()
        if (valid) return
        
        submitLoading.value = true
        
        let response
        if (isEdit.value) {
          // 编辑用户时不传密码
          const { password, ...updateData } = userForm
          response = await memberApi.update(userForm.id, updateData)
        } else {
          // 新增用户
          response = await memberApi.create(userForm)
        }
        
        // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
        Message.success(isEdit.value ? '用户更新成功' : '用户创建成功')
        formVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交表单失败:', error)
        Message.error(isEdit.value ? '用户更新失败' : '用户创建失败')
      } finally {
        submitLoading.value = false
      }
    }
    
    // 取消表单
    const handleCancel = () => {
      formVisible.value = false
      resetForm()
    }
    
    onMounted(async () => {
      menuStore.generateBreadcrumbs('/users/list')
      await loadUserLevels()
      await loadData()
    })
    
    return {
      loading,
      detailVisible,
      currentUser,
      formVisible,
      isEdit,
      submitLoading,
      searchForm,
      pagination,
      tableData,
      userForm,
      userLevels,
      rules,
      formRef,
      // 充值相关
      rechargeVisible,
      currentRechargeUser,
      rechargeLoading,
      rechargeForm,
      rechargeRules,
      rechargeFormRef,
      // 设置等级相关
      setLevelVisible,
      currentSetLevelUser,
      setLevelLoading,
      setLevelForm,
      setLevelRules,
      setLevelFormRef,
      getStatusBadge,
      getStatusText,
      getLevelColor,
      getLevelName,
      loadData,
      handleSearch,
      handleReset,
      handleAdd,
      handleExport,
      handleView,
      handleEdit,
      handleRecharge,
      handleRechargeSubmit,
      handleRechargeCancel,
      handleSetLevel,
      handleSetLevelSubmit,
      handleSetLevelCancel,
      handleResetPassword,
      handleToggleStatus,
      handleDelete,
      handlePageChange,
      handlePageSizeChange,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.users-page {
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

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.user-info .username {
  font-weight: 500;
  color: #1d2129;
}

.user-info .nickname {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

.user-detail {
  padding: 16px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.header-info {
  margin-left: 16px;
}

.header-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.header-info p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

/* 充值和设置等级模态框样式 */
.recharge-user-info,
.set-level-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

.user-info-text {
  margin-left: 16px;
}

.user-info-text .username {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.user-info-text .balance,
.user-info-text .current-level {
  font-size: 14px;
  color: #86909c;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
}

:deep(.arco-dropdown-option.danger) {
  color: #f53f3f;
}

:deep(.arco-dropdown-option.danger:hover) {
  background-color: #ffece8;
  color: #f53f3f;
}
</style> 