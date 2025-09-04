import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

// 系统配置状态
const systemConfig = ref({
  siteName: '图床管理系统',
  siteIcon: '',
  siteLogo: '',
  siteDescription: '专业的图片存储和管理平台'
})

// 是否已加载配置
const configLoaded = ref(false)

export const useSystemConfig = () => {
  // 加载公开的系统配置（无需认证）
  const loadPublicSystemConfig = async () => {
    if (configLoaded.value) return
    
    try {
      const response = await apiService.getSystemConfig()
      if (response.success && response.data) {
        // 映射后端字段到前端字段
        const config = {
          siteName: response.data.site_title || '图床管理系统',
          siteIcon: response.data.site_logo || '',
          siteLogo: response.data.site_logo || '',
          siteDescription: response.data.site_description || '专业的图片存储和管理平台'
        }
        Object.assign(systemConfig.value, config)
        
        // 更新页面标题和图标
        updatePageTitle()
        updateFavicon()
      }
      configLoaded.value = true
    } catch (error) {
      console.error('加载公开系统配置失败:', error)
      configLoaded.value = true // 即使失败也标记为已加载，使用默认值
    }
  }

  // 加载完整系统配置（需要认证）
  const loadSystemConfig = async () => {
    if (configLoaded.value) return
    
    try {
      const response = await apiService.getConfigItem('system')
      if (response.success && response.data) {
        const config = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
        Object.assign(systemConfig.value, config)
        
        // 更新页面标题和图标
        updatePageTitle()
        updateFavicon()
      }
      configLoaded.value = true
    } catch (error) {
      console.error('加载系统配置失败:', error)
      configLoaded.value = true // 即使失败也标记为已加载，使用默认值
    }
  }

  // 更新页面标题
  const updatePageTitle = (pageTitle?: string) => {
    const siteName = systemConfig.value.siteName
    document.title = pageTitle ? `${pageTitle} - ${siteName}` : siteName
  }

  // 更新favicon
  const updateFavicon = () => {
    if (systemConfig.value.siteIcon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'shortcut icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = systemConfig.value.siteIcon
    }
  }

  // 计算属性
  const siteName = computed(() => systemConfig.value.siteName)
  const siteIcon = computed(() => systemConfig.value.siteIcon)
  const siteLogo = computed(() => systemConfig.value.siteLogo)
  const siteDescription = computed(() => systemConfig.value.siteDescription)

  return {
    systemConfig,
    loadSystemConfig,
    loadPublicSystemConfig,
    updatePageTitle,
    updateFavicon,
    siteName,
    siteIcon,
    siteLogo,
    siteDescription
  }
}
