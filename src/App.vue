<template>
  <div id="app">
    <!-- Vue Router 出口 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSystemConfig } from '@/composables/useSystemConfig'

// 使用系统配置
const { loadPublicSystemConfig } = useSystemConfig()

// 应用启动时加载公开的系统配置
onMounted(async () => {
  try {
    await loadPublicSystemConfig()
    console.log('✅ 系统配置加载完成')
  } catch (error) {
    console.error('❌ 系统配置加载失败:', error)
  }
})
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>