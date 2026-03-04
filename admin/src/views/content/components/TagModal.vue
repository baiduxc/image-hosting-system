<template>
  <a-modal
    v-model:visible="modalVisible"
    title="标签管理"
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="tag-modal">
      <!-- 添加标签 -->
      <a-card title="添加标签" class="add-card">
        <a-form
          ref="formRef"
          :model="tagForm"
          :rules="rules"
          layout="inline"
        >
          <a-form-item field="name" label="标签名称">
            <a-input
              v-model="tagForm.name"
              placeholder="请输入标签名称"
              style="width: 200px"
            />
          </a-form-item>
          
          <a-form-item field="color" label="标签颜色">
            <a-select
              v-model="tagForm.color"
              placeholder="请选择颜色"
              style="width: 150px"
            >
              <a-option value="blue">蓝色</a-option>
              <a-option value="green">绿色</a-option>
              <a-option value="orange">橙色</a-option>
              <a-option value="red">红色</a-option>
              <a-option value="purple">紫色</a-option>
              <a-option value="cyan">青色</a-option>
              <a-option value="gold">金色</a-option>
              <a-option value="gray">灰色</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item field="sort" label="排序">
            <a-input-number
              v-model="tagForm.sort"
              placeholder="排序"
              :min="0"
              style="width: 100px"
            />
          </a-form-item>
          
          <a-form-item>
            <a-button
              type="primary"
              :loading="addLoading"
              @click="handleAdd"
            >
              {{ editingId ? '更新' : '添加' }}
            </a-button>
            <a-button
              v-if="editingId"
              @click="handleCancelEdit"
              style="margin-left: 8px"
            >
              取消
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
      
      <!-- 标签列表 -->
      <a-card title="标签列表" class="list-card">
        <div class="batch-actions">
          <a-space>
            <a-button
              type="primary"
              size="small"
              :disabled="selectedRowKeys.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </a-button>
            <span v-if="selectedRowKeys.length > 0" class="selected-info">
              已选择 {{ selectedRowKeys.length }} 项
            </span>
          </a-space>
        </div>
        
        <a-table
          :data="tags"
          :pagination="pagination"
          :loading="loading"
          :row-selection="rowSelection"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #columns>
            <a-table-column title="ID" data-index="id" :width="80" />
            <a-table-column title="标签名称" :width="150">
              <template #cell="{ record }">
                <a-tag :color="record.color">{{ record.name }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="颜色" data-index="color" :width="100">
              <template #cell="{ record }">
                <div class="color-preview" :style="{ backgroundColor: getColorValue(record.color) }"></div>
              </template>
            </a-table-column>
            <a-table-column title="使用次数" data-index="use_count" :width="100" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-badge
                  :status="record.status === 1 ? 'success' : 'normal'"
                  :text="record.status === 1 ? '正常' : '禁用'"
                />
              </template>
            </a-table-column>
            <a-table-column title="排序" data-index="sort" :width="80" />
            <a-table-column title="创建时间" :width="180">
              <template #cell="{ record }">
                {{ record.create_time }}
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="150" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button
                    type="text"
                    size="small"
                    @click="handleEdit(record)"
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    content="确定要删除这个标签吗？"
                    @ok="handleDelete(record)"
                  >
                    <a-button
                      type="text"
                      size="small"
                      status="danger"
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
    </div>
    
    <template #footer>
      <a-button @click="handleCancel">关闭</a-button>
    </template>
  </a-modal>
</template>

<script>
import { ref, reactive, watch, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { tagApi } from '@/api/articles'

export default {
  name: 'TagModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'refresh'],
  setup(props, { emit }) {
    const formRef = ref()
    const loading = ref(false)
    const addLoading = ref(false)
    const tags = ref([])
    const editingId = ref(null)
    const selectedRowKeys = ref([])
    
    const modalVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showTotal: true,
      showPageSize: true
    })
    
    const rowSelection = reactive({
      type: 'checkbox',
      showCheckedAll: true,
      selectedRowKeys,
      onSelect: (rowKeys) => {
        selectedRowKeys.value = rowKeys
      },
      onSelectAll: (checked) => {
        if (checked) {
          selectedRowKeys.value = tags.value.map(item => item.id)
        } else {
          selectedRowKeys.value = []
        }
      }
    })
    
    const tagForm = reactive({
      name: '',
      color: 'blue',
      description: '',
      sort: 0,
      status: 1
    })
    
    const rules = {
      name: [
        { required: true, message: '请输入标签名称' },
        { max: 50, message: '标签名称不能超过50个字符' }
      ],
      color: [
        { required: true, message: '请选择标签颜色' }
      ]
    }
    
    // 获取颜色值
    const getColorValue = (color) => {
      const colorMap = {
        blue: '#165dff',
        green: '#00b42a',
        orange: '#ff7d00',
        red: '#f53f3f',
        purple: '#722ed1',
        cyan: '#14c9c9',
        gold: '#f7ba1e',
        gray: '#86909c'
      }
      return colorMap[color] || '#165dff'
    }
    
    // 加载标签列表
    const loadTags = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.current,
          limit: pagination.pageSize
        }
        
        const response = await tagApi.getList(params)
        // 🎯 响应拦截器已经解包数据
        if (response && response.list) {
          tags.value = response.list
          pagination.total = response.total
        } else {
          Message.error('获取标签列表失败')
        }
      } catch (error) {
        Message.error('获取标签列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 重置表单
    const resetForm = () => {
      tagForm.name = ''
      tagForm.color = 'blue'
      tagForm.description = ''
      tagForm.sort = 0
      tagForm.status = 1
      editingId.value = null
      formRef.value?.resetFields()
    }
    
    // 添加/更新标签
    const handleAdd = async () => {
      try {
        // 验证表单
        await formRef.value?.validate()
        
        addLoading.value = true
        
        let response
        if (editingId.value) {
          response = await tagApi.update(editingId.value, tagForm)
        } else {
          response = await tagApi.create(tagForm)
        }
        
        // 🎯 响应拦截器已经解包数据，成功时直接返回数据
        if (response) {
          Message.success(editingId.value ? '标签更新成功' : '标签添加成功')
          resetForm()
          loadTags()
          emit('refresh')
        } else {
          Message.error(editingId.value ? '标签更新失败' : '标签添加失败')
        }
      } catch (error) {
        // 如果是表单验证错误，不显示错误消息
        if (error.name === 'ValidateError') {
          return
        }
        Message.error(editingId.value ? '标签更新失败' : '标签添加失败')
      } finally {
        addLoading.value = false
      }
    }
    
    // 编辑标签
    const handleEdit = (record) => {
      editingId.value = record.id
      tagForm.name = record.name
      tagForm.color = record.color || 'blue'
      tagForm.description = record.description || ''
      tagForm.sort = record.sort
      tagForm.status = record.status
    }
    
    // 取消编辑
    const handleCancelEdit = () => {
      resetForm()
    }
    
    // 删除标签
    const handleDelete = async (record) => {
      try {
        const response = await tagApi.delete(record.id)
        // 🎯 响应拦截器已经解包数据
        if (response) {
          Message.success('标签删除成功')
          loadTags()
          emit('refresh')
        } else {
          Message.error('标签删除失败')
        }
      } catch (error) {
        Message.error('标签删除失败')
      }
    }
    
    // 批量删除
    const handleBatchDelete = () => {
      if (selectedRowKeys.value.length === 0) {
        Message.warning('请先选择要删除的标签')
        return
      }
      
      Modal.confirm({
        title: '确认批量删除',
        content: `确定要删除选中的 ${selectedRowKeys.value.length} 个标签吗？`,
        onOk: async () => {
          try {
            const response = await tagApi.batchDelete(selectedRowKeys.value)
            // 🎯 响应拦截器已经解包数据
            if (response) {
              Message.success('批量删除成功')
              selectedRowKeys.value = []
              loadTags()
              emit('refresh')
            } else {
              Message.error('批量删除失败')
            }
          } catch (error) {
            Message.error('批量删除失败')
          }
        }
      })
    }
    
    // 分页变化
    const handlePageChange = (page) => {
      pagination.current = page
      loadTags()
    }
    
    const handlePageSizeChange = (pageSize) => {
      pagination.pageSize = pageSize
      pagination.current = 1
      loadTags()
    }
    
    // 关闭模态框
    const handleCancel = () => {
      modalVisible.value = false
      resetForm()
      selectedRowKeys.value = []
    }
    
    // 确认按钮
    const handleOk = () => {
      modalVisible.value = false
      resetForm()
      selectedRowKeys.value = []
    }
    
    // 监听模态框显示状态
    watch(modalVisible, (visible) => {
      if (visible) {
        loadTags()
      }
    })
    
    return {
      formRef,
      loading,
      addLoading,
      tags,
      editingId,
      selectedRowKeys,
      modalVisible,
      pagination,
      rowSelection,
      tagForm,
      rules,
      getColorValue,
      handleAdd,
      handleEdit,
      handleCancelEdit,
      handleDelete,
      handleBatchDelete,
      handlePageChange,
      handlePageSizeChange,
      handleCancel,
      handleOk
    }
  }
}
</script>

<style scoped>
.tag-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.add-card {
  margin-bottom: 16px;
  border-radius: 6px;
}

.list-card {
  border-radius: 6px;
}

.batch-actions {
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
}

.selected-info {
  color: #86909c;
  font-size: 14px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}
</style> 