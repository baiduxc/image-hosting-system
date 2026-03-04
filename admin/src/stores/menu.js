import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
  const breadcrumbs = ref([])
  const selectedKeys = ref([])
  const openKeys = ref([])
  
  // 设置面包屑
  const setBreadcrumbs = (crumbs) => {
    breadcrumbs.value = crumbs
  }
  
  // 设置选中的菜单项
  const setSelectedKeys = (keys) => {
    selectedKeys.value = keys
  }
  
  // 设置展开的菜单项
  const setOpenKeys = (keys) => {
    openKeys.value = keys
  }
  
  // 根据路由路径生成面包屑
  const generateBreadcrumbs = (path) => {
    const breadcrumbMap = {
      '/dashboard': [{ key: 'dashboard', title: '仪表盘' }],
      
      // 用户管理
      '/users/list': [
        { key: 'users', title: '用户管理' },
        { key: 'user-list', title: '用户列表' }
      ],
      '/users/levels': [
        { key: 'users', title: '用户管理' },
        { key: 'user-levels', title: '用户等级' }
      ],
      
      // 知识付费模块
      '/education/courses': [
        { key: 'education', title: '知识付费' },
        { key: 'courses', title: '课程管理' }
      ],
      '/education/live-courses': [
        { key: 'education', title: '知识付费' },
        { key: 'live-courses', title: '直播课管理' }
      ],
      '/education/course-categories': [
        { key: 'education', title: '知识付费' },
        { key: 'course-categories', title: '课程分类' }
      ],
      
      // 讲师管理
      '/teachers': [
        { key: 'education', title: '知识付费' },
        { key: 'teachers', title: '讲师管理' }
      ],
      
      // 会员管理
      '/members/list': [
        { key: 'members', title: '会员管理' },
        { key: 'member-list', title: '会员列表' }
      ],
      '/members/levels': [
        { key: 'members', title: '会员管理' },
        { key: 'member-levels', title: '会员等级' }
      ],
      
      // 活动管理
      '/activities': [{ key: 'activities', title: '活动管理' }],
      '/activities/add': [
        { key: 'activities', title: '活动管理' },
        { key: 'add-activity', title: '新增活动' }
      ],
      '/activities/edit': [
        { key: 'activities', title: '活动管理' },
        { key: 'edit-activity', title: '编辑活动' }
      ],
      '/activities/categories': [
        { key: 'activities', title: '活动管理' },
        { key: 'activity-categories', title: '活动分类' }
      ],
      '/activities/signups': [
        { key: 'activities', title: '活动管理' },
        { key: 'activity-signups', title: '报名管理' }
      ],
      
      // 业务管理
      '/business/orders': [
        { key: 'business', title: '业务管理' },
        { key: 'orders', title: '订单管理' }
      ],
      '/business/orders/statistics': [
        { key: 'business', title: '业务管理' },
        { key: 'orders', title: '订单管理' },
        { key: 'order-statistics', title: '订单统计' }
      ],
      
      // 直播管理
      '/system/live-config': [
        { key: 'live', title: '直播管理' },
        { key: 'live-config', title: '直播配置' }
      ],
      '/system/live-streams': [
        { key: 'live', title: '直播管理' },
        { key: 'live-streams', title: '直播流管理' }
      ],
      '/system/live-callback-logs': [
        { key: 'live', title: '直播管理' },
        { key: 'live-callback-logs', title: '直播回调日志' }
      ],
      
      // 内容管理
      '/content/articles': [
        { key: 'content', title: '内容管理' },
        { key: 'articles', title: '文章管理' }
      ],
      '/content/add-article': [
        { key: 'content', title: '内容管理' },
        { key: 'add-article', title: '添加文章' }
      ],
      
      // 系统管理
      '/system/storage': [
        { key: 'system', title: '系统管理' },
        { key: 'storage', title: '存储设置' }
      ],
      '/system/files': [
        { key: 'system', title: '系统管理' },
        { key: 'files', title: '文件管理' }
      ],
      '/system/api-config': [
        { key: 'system', title: '系统管理' },
        { key: 'api-config', title: 'API配置' }
      ],
      '/system/site-config': [
        { key: 'system', title: '系统管理' },
        { key: 'site-config', title: '站点配置' }
      ],
      '/system/payment-config': [
        { key: 'system', title: '系统管理' },
        { key: 'payment-config', title: '支付配置' }
      ],
      '/system/payment-notify-logs': [
        { key: 'system', title: '系统管理' },
        { key: 'payment-notify-logs', title: '支付通知日志' }
      ],
      
      // 订单管理
      '/orders': [{ key: 'orders', title: '订单管理' }],
      '/orders/statistics': [
        { key: 'orders', title: '订单管理' },
        { key: 'order-statistics', title: '订单统计' }
      ],
      
      '/login': [{ key: 'login', title: '登录' }]
    }
    
    setBreadcrumbs(breadcrumbMap[path] || [])
  }
  
  return {
    breadcrumbs,
    selectedKeys,
    openKeys,
    setBreadcrumbs,
    setSelectedKeys,
    setOpenKeys,
    generateBreadcrumbs
  }
}) 