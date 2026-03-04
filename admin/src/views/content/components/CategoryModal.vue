<template>
  <a-modal
    v-model:visible="modalVisible"
    title="分类管理"
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="category-modal">
      <!-- 添加分类 -->
      <a-card title="添加分类" class="add-card">
        <a-form
          ref="formRef"
          :model="categoryForm"
          :rules="rules"
          layout="inline"
        >
          <a-form-item field="name" label="分类名称">
            <a-input
              v-model="categoryForm.name"
              placeholder="请输入分类名称"
              style="width: 200px"
            />
          </a-form-item>
          
          <a-form-item field="parent_id" label="父级分类">
            <a-select
              v-model="categoryForm.parent_id"
              placeholder="请选择父级分类"
              style="width: 200px"
              allow-clear
            >
              <a-option :value="0">顶级分类</a-option>
              <a-option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
                :disabled="editingId === category.id"
              >
                {{ category.name }}
              </a-option>
            </a-select>
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
      
      <!-- 分类列表 -->
      <a-card title="分类列表" class="list-card">
        <a-table
          :data="categories"
          :pagination="false"
          :loading="loading"
        >
          <template #columns>
            <a-table-column title="ID" data-index="id" :width="80" />
            <a-table-column title="分类名称" data-index="name" :width="200" />
            <a-table-column title="父级分类" :width="150">
              <template #cell="{ record }">
                {{ getParentName(record.parent_id) }}
              </template>
            </a-table-column>
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
                    content="确定要删除这个分类吗？"
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
import { Message } from '@arco-design/web-vue'
import { categoryApi } from '@/api/articles'

export default {
  name: 'CategoryModal',
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
    const categories = ref([])
    const editingId = ref(null)
    
    const modalVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    })
    
    const categoryForm = reactive({
      name: '',
      parent_id: 0,
      description: '',
      sort: 0,
      status: 1
    })
    
    const rules = {
      name: [
        { required: true, message: '请输入分类名称' },
        { max: 50, message: '分类名称不能超过50个字符' }
      ]
    }
    
    // 获取父级分类名称
    const getParentName = (parentId) => {
      if (parentId === 0) return '顶级分类'
      const parent = categories.value.find(item => item.id === parentId)
      return parent ? parent.name : '-'
    }
    
    // 加载分类列表
    const loadCategories = async () => {
      loading.value = true
      try {
        const response = await categoryApi.getList({ limit: 100 })
        // 🎯 响应拦截器已经解包数据
        if (response && response.list) {
          categories.value = response.list
        } else {
          Message.error('获取分类列表失败')
        }
      } catch (error) {
        Message.error('获取分类列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 重置表单
    const resetForm = () => {
      categoryForm.name = ''
      categoryForm.parent_id = 0
      categoryForm.description = ''
      categoryForm.sort = 0
      categoryForm.status = 1
      editingId.value = null
      formRef.value?.resetFields()
    }
    
    // 添加/更新分类
    const handleAdd = async () => {
      try {
        // 验证表单
        await formRef.value?.validate()
        
        addLoading.value = true
        
        let response
        if (editingId.value) {
          response = await categoryApi.update(editingId.value, categoryForm)
        } else {
          response = await categoryApi.create(categoryForm)
        }
        
        // 🎯 响应拦截器已经解包数据
        if (response) {
          Message.success(editingId.value ? '分类更新成功' : '分类添加成功')
          resetForm()
          loadCategories()
          emit('refresh')
        } else {
          Message.error(editingId.value ? '分类更新失败' : '分类添加失败')
        }
      } catch (error) {
        // 如果是表单验证错误，不显示错误消息
        if (error.name === 'ValidateError') {
          return
        }
        Message.error(editingId.value ? '分类更新失败' : '分类添加失败')
      } finally {
        addLoading.value = false
      }
    }
    
    // 编辑分类
    const handleEdit = (record) => {
      editingId.value = record.id
      categoryForm.name = record.name
      categoryForm.parent_id = record.parent_id
      categoryForm.description = record.description || ''
      categoryForm.sort = record.sort
      categoryForm.status = record.status
    }
    
    // 取消编辑
    const handleCancelEdit = () => {
      resetForm()
    }
    
    // 删除分类
    const handleDelete = async (record) => {
      try {
        const response = await categoryApi.delete(record.id)
        // 🎯 响应拦截器已经解包数据
        if (response) {
          Message.success('分类删除成功')
          loadCategories()
          emit('refresh')
        } else {
          Message.error('分类删除失败')
        }
      } catch (error) {
        Message.error('分类删除失败')
      }
    }
    
    // 关闭模态框
    const handleCancel = () => {
      modalVisible.value = false
      resetForm()
    }
    
    // 确认按钮
    const handleOk = () => {
      modalVisible.value = false
      resetForm()
    }
    
    // 监听模态框显示状态
    watch(modalVisible, (visible) => {
      if (visible) {
        loadCategories()
      }
    })
    
    return {
      formRef,
      loading,
      addLoading,
      categories,
      editingId,
      modalVisible,
      categoryForm,
      rules,
      getParentName,
      handleAdd,
      handleEdit,
      handleCancelEdit,
      handleDelete,
      handleCancel,
      handleOk
    }
  }
}
</script>

<style scoped>
.category-modal {
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
</style> 