import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    cors: true,
    // 开发环境代理配置（可选）
    proxy: {
      // 如果需要代理到本地后端，取消注释以下配置
      // '/api': {
      //   target: 'http://localhost:3001',
      //   changeOrigin: true,
      //   secure: false,
      //   ws: true
      // }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 优化构建
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          tdesign: ['tdesign-vue-next', 'tdesign-icons-vue-next']
        }
      }
    }
  },
  // 预览服务器配置
  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: true
  }
})
