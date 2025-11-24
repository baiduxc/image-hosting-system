<template>
  <div id="app">
    <!-- 全局加载遮罩 -->
    <t-loading 
      v-if="isInitializing" 
      fullscreen
      attach="body"
      text="正在加载..."
      size="large"
    />
    
    <!-- Vue Router 出口 -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemConfig } from '@/composables/useSystemConfig'
import { apiService } from '@/services/api'

const router = useRouter()

// 使用系统配置
const { loadPublicSystemConfig } = useSystemConfig()

// 初始化状态
const isInitializing = ref(true)

// 应用启动时加载公开的系统配置
onMounted(async () => {
  try {
    // 加载系统配置
    await loadPublicSystemConfig()
    
    // 简单检查是否有token和用户数据，具体验证交给路由守卫
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    // 如果有token但数据格式错误，清除
    if (token && userData) {
      try {
        JSON.parse(userData)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
  } finally {
    // 初始化完成，移除loading
    isInitializing.value = false
  }
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-image: 
    linear-gradient(rgba(212, 212, 212, 0.15) 1px, transparent 0),
    linear-gradient(90deg, rgba(212, 212, 212, 0.15) 1px, transparent 0);
  background-size: 32px 32px;
  background-color: #fafafa;
}
</style>