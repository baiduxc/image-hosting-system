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
const lastLoadedUserId = ref<number | null>(null)

// 获取当前用户ID
const getCurrentUserId = (): number | null => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.id || null
    }
  } catch (error) {
    console.error('获取用户ID失败:', error)
  }
  return null
}

// 获取用户特定的localStorage键
const getUserStorageKey = (): string => {
  const userId = getCurrentUserId()
  return userId ? `selectedStorageId_${userId}` : 'selectedStorageId'
}

export function useStorage() {
  // 加载存储选项
  const loadStorageOptions = async () => {
    const currentUserId = getCurrentUserId()
    
    // 如果用户切换了，重置状态
    if (currentUserId !== lastLoadedUserId.value) {
      isLoaded.value = false
      selectedStorageId.value = ''
      lastLoadedUserId.value = currentUserId
    }
    
    if (isLoaded.value) return
    
    isLoading.value = true
    try {
      const response = await apiService.getAvailableStorages()
      if (response.success && response.data) {
        storageOptions.value = response.data
        
        // 优先从localStorage获取用户上次选择的存储
        const storageKey = getUserStorageKey()
        const lastSelectedStorage = localStorage.getItem(storageKey)
        
        if (lastSelectedStorage && response.data.find(opt => opt.id.toString() === lastSelectedStorage)) {
          selectedStorageId.value = lastSelectedStorage
        } else {
          // 如果没有用户选择，则使用系统默认存储
          const defaultStorage = response.data.find(storage => storage.isDefault)
          if (defaultStorage) {
            selectedStorageId.value = defaultStorage.id.toString()
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
      const storageKey = getUserStorageKey()
      localStorage.setItem(storageKey, id)
    }
  }

  // 重置加载状态（用于切换用户时重新加载）
  const resetStorageState = () => {
    isLoaded.value = false
    selectedStorageId.value = ''
    lastLoadedUserId.value = null
  }

  return {
    storageOptions,
    selectedStorageId,
    selectOptions,
    selectedStorageName,
    isLoading,
    isLoaded,
    loadStorageOptions,
    setSelectedStorageId,
    resetStorageState
  }
}