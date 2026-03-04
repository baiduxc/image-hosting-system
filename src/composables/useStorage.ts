import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export interface StorageOption {
  id: number
  name: string
  isDefault: boolean
}

// 全局状态
const storageOptions = ref<StorageOption[]>([])
const selectedStorageId = ref('')
const isLoading = ref(false)
const isLoaded = ref(false)

export function useStorage() {
  // 加载存储选项
  const loadStorageOptions = async () => {
    if (isLoaded.value) return
    
    isLoading.value = true
    try {
      const response = await apiService.getAvailableStorages()
      if (response.success && response.data) {
        storageOptions.value = response.data
        
        // 优先选择默认存储，如果没有则从localStorage获取用户上次选择的存储
        const defaultStorage = response.data.find(storage => storage.isDefault)
        if (defaultStorage) {
          selectedStorageId.value = defaultStorage.id.toString()
        } else {
          const lastSelectedStorage = localStorage.getItem('selectedStorageId')
          if (lastSelectedStorage && response.data.find(opt => opt.id.toString() === lastSelectedStorage)) {
            selectedStorageId.value = lastSelectedStorage
          } else if (response.data.length > 0) {
            selectedStorageId.value = response.data[0].id.toString()
          }
        }
        isLoaded.value = true
      }
    } catch (error) {
      console.error('加载存储配置失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 选择器选项（用于 t-select 组件）
  const selectOptions = computed(() => {
    return storageOptions.value.map(storage => ({
      label: `${storage.name}${storage.isDefault ? ' (默认)' : ''}`,
      value: storage.id.toString()
    }))
  })

  // 当前选中的存储名称
  const selectedStorageName = computed(() => {
    const storage = storageOptions.value.find(s => s.id.toString() === selectedStorageId.value)
    return storage?.name || ''
  })

  // 设置选中的存储ID
  const setSelectedStorageId = (id: string) => {
    selectedStorageId.value = id
    if (id) {
      localStorage.setItem('selectedStorageId', id)
    }
  }

  return {
    storageOptions,
    selectedStorageId,
    selectOptions,
    selectedStorageName,
    isLoading,
    isLoaded,
    loadStorageOptions,
    setSelectedStorageId
  }
}