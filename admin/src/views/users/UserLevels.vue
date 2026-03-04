<template>
  <div class="user-levels-page">
    <div class="page-header">
      <h1>用户等级管理</h1>
      <p>管理系统中的用户等级分类</p>
    </div>
    
    <!-- 操作栏 -->
    <a-card class="action-card">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <icon-plus />
          </template>
          新增等级
        </a-button>
        <a-button @click="loadData">
          <template #icon>
            <icon-refresh />
          </template>
          刷新
        </a-button>
      </a-space>
    </a-card>
    
    <!-- 等级列表 -->
    <a-card class="table-card">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="false"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="等级名称" data-index="name" :width="150">
            <template #cell="{ record }">
              <a-tag :color="getLevelColor(record.id)">
                {{ record.name }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="价格" data-index="price" :width="120">
            <template #cell="{ record }">
              ¥{{ record.price || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="有效期(天)" data-index="duration" :width="120">
            <template #cell="{ record }">
              {{ record.duration === 0 ? '永久' : record.duration + '天' }}
            </template>
          </a-table-column>
          <a-table-column title="折扣" data-index="discount" :width="100">
            <template #cell="{ record }">
              {{ (record.discount * 100).toFixed(0) }}%
            </template>
          </a-table-column>
          <a-table-column title="特权说明" data-index="privileges" />
          <a-table-column title="排序" data-index="sort" :width="80" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="record.status === 1 ? 'success' : 'danger'"
                :text="record.status === 1 ? '正常' : '禁用'"
              />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="create_time" :width="180" />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button
                  type="text"
                  size="small"
                  @click="handleEdit(record)"
                >
                  编辑
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="handleToggleStatus(record)"
                >
                  {{ record.status === 1 ? '禁用' : '启用' }}
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    
    <!-- 添加/编辑等级模态框 -->
    <a-modal
      v-model:visible="formVisible"
      :title="isEdit ? '编辑等级' : '添加等级'"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitLoading"
    >
      <a-form
        ref="formRef"
        :model="levelForm"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="等级名称">
              <a-input
                v-model="levelForm.name"
                placeholder="请输入等级名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="price" label="价格">
              <a-input-number
                v-model="levelForm.price"
                placeholder="请输入价格"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="duration" label="有效期(天)">
              <a-input-number
                v-model="levelForm.duration"
                placeholder="0表示永久有效"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="discount" label="折扣">
              <a-input-number
                v-model="levelForm.discount"
                placeholder="1.0表示无折扣"
                :min="0"
                :max="1"
                :precision="2"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="privileges" label="特权说明">
          <a-textarea
            v-model="levelForm.privileges"
            placeholder="请输入特权说明"
            :rows="3"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="sort" label="排序">
              <a-input-number
                v-model="levelForm.sort"
                placeholder="数字越小排序越靠前"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="status" label="状态">
              <a-radio-group v-model="levelForm.status">
                <a-radio :value="1">正常</a-radio>
                <a-radio :value="0">禁用</a-radio>
              </a-radio-group>
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
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconPlus,
  IconRefresh
} from '@arco-design/web-vue/es/icon'
import { memberLevelApi } from '@/api/members'

export default {
  name: 'UserLevels',
  components: {
    IconPlus,
    IconRefresh
  },
  setup() {
    const menuStore = useMenuStore()
    
    const loading = ref(false)
    const formVisible = ref(false)
    const isEdit = ref(false)
    const submitLoading = ref(false)
    const formRef = ref(null)
    
    const levelForm = reactive({
      name: '',
      price: 0,
      duration: 0,
      discount: 1.0,
      privileges: '',
      sort: 0,
      status: 1
    })
    
    const rules = {
      name: [
        { required: true, message: '请输入等级名称' },
        { min: 2, max: 20, message: '等级名称长度为2-20个字符' }
      ],
      price: [
        { required: true, message: '请输入价格' }
      ],
      duration: [
        { required: true, message: '请输入有效期' }
      ],
      discount: [
        { required: true, message: '请输入折扣' }
      ],
      privileges: [
        { required: true, message: '请输入特权说明' }
      ],
      sort: [
        { required: true, message: '请输入排序' }
      ]
    }

    const tableData = ref([])
    
    // 获取等级颜色
    const getLevelColor = (levelId) => {
      const colors = {
        1: 'gray',    // 普通用户
        2: 'gold',    // VIP用户
        3: 'purple',  // 高级用户
        4: 'red'      // 管理员
      }
      return colors[levelId] || 'blue'
    }
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      
      try {
        const response = await memberLevelApi.getList({
          page: 1,
          limit: 100 // 获取所有等级
        })
        

        
        // 🎯 标准数据处理逻辑 - 响应拦截器已经解包数据
        if (Array.isArray(response)) {
          // 情况1: 直接返回数组
          tableData.value = response.sort((a, b) => a.sort - b.sort)
        } else if (response && response.list && Array.isArray(response.list)) {
          // 情况2: 分页格式 {list: [], page: 1, total: 100}
          tableData.value = response.list.sort((a, b) => a.sort - b.sort)
        } else {
          // 情况3: 兜底处理
          tableData.value = []
          console.warn('API响应数据格式不符合预期:', response)
        }
        

        
      } catch (error) {
        console.error('加载等级数据失败:', error)
        Message.error('加载等级数据失败')
      } finally {
        loading.value = false
      }
    }
    
    // 新增等级
    const handleAdd = () => {
      isEdit.value = false
      resetForm()
      formVisible.value = true
    }
    
    // 编辑等级
    const handleEdit = (record) => {
      isEdit.value = true
      Object.assign(levelForm, {
        id: record.id,
        name: record.name,
        price: record.price || 0,
        duration: record.duration || 0,
        discount: record.discount || 1.0,
        privileges: record.privileges || '',
        sort: record.sort || 0,
        status: record.status
      })
      formVisible.value = true
    }
    
    // 切换状态
    const handleToggleStatus = (record) => {
      const action = record.status === 1 ? '禁用' : '启用'
      Modal.confirm({
        title: `确认${action}等级`,
        content: `确定要${action}等级 ${record.name} 吗？`,
        onOk: async () => {
          try {
            // 更新状态
            const response = await memberLevelApi.update(record.id, {
              ...record,
              status: record.status === 1 ? 0 : 1
            })
            
    
            
            // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
            Message.success(`等级${action}成功`)
            loadData()
          } catch (error) {
            console.error(`${action}等级失败:`, error)
            Message.error(`等级${action}失败`)
          }
        }
      })
    }
    
    // 删除等级
    const handleDelete = (record) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除等级 ${record.name} 吗？此操作不可恢复。`,
        onOk: async () => {
          try {
            const response = await memberLevelApi.delete(record.id)
            
    
            
            // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
            Message.success('等级删除成功')
            loadData()
          } catch (error) {
            console.error('删除等级失败:', error)
            Message.error('等级删除失败')
          }
        }
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
          response = await memberLevelApi.update(levelForm.id, levelForm)
        } else {
          response = await memberLevelApi.create(levelForm)
        }
        

        
        // 响应拦截器已经处理了成功状态，如果到这里说明操作成功
        Message.success(isEdit.value ? '等级更新成功' : '等级创建成功')
        formVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交表单失败:', error)
        Message.error(isEdit.value ? '等级更新失败' : '等级创建失败')
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
      Object.assign(levelForm, {
        name: '',
        price: 0,
        duration: 0,
        discount: 1.0,
        privileges: '',
        sort: 0,
        status: 1
      })
    }
    
    onMounted(async () => {
      menuStore.generateBreadcrumbs('/users/levels')
      await loadData()
    })
    
    return {
      loading,
      formVisible,
      isEdit,
      submitLoading,
      formRef,
      levelForm,
      rules,
      tableData,
      getLevelColor,
      loadData,
      handleAdd,
      handleEdit,
      handleToggleStatus,
      handleDelete,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.user-levels-page {
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

:deep(.arco-table-th) {
  background-color: #f7f8fa;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f2f3f5;
}
</style> 