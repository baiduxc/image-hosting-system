import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import App from './App.vue'
import router from './router'
import { initApiChecker, startApiMonitoring } from './utils/apiChecker'
import { setGlobalRouter } from './api/index'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ArcoVue);

// 设置全局路由，供API拦截器使用
setGlobalRouter(router)

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserState()

// 初始化API检查器
initApiChecker().then(() => {
  // 启动API监控
  startApiMonitoring()
}).catch(error => {
  // 即使初始化失败也要启动应用
  startApiMonitoring()
})

app.mount('#app')
