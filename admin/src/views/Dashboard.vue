<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表盘</h1>
      <p>欢迎回来，管理员！今天是 {{ currentDate }}</p>
    </div>
    
    <!-- 统计卡片 -->
    <a-row :gutter="24" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="总用户数"
            :value="stats.totalUsers"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <icon-arrow-up />
            <span>12.5%</span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>
      
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="文章总数"
            :value="stats.totalArticles"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <icon-file />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <icon-arrow-up />
            <span>8.2%</span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>
      
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日访问"
            :value="stats.todayVisits"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <icon-eye />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <icon-arrow-down />
            <span>3.1%</span>
            <span class="trend-text">较昨日</span>
          </div>
        </a-card>
      </a-col>
      
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="总收入"
            :value="stats.totalRevenue"
            :precision="2"
            :value-style="{ color: '#eb2f96' }"
          >
            <template #prefix>
              <span>¥</span>
            </template>
          </a-statistic>
          <div class="stat-trend">
            <icon-arrow-up />
            <span>15.3%</span>
            <span class="trend-text">较上月</span>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 图表区域 -->
    <a-row :gutter="24" class="charts-row">
      <a-col :span="16">
        <a-card title="访问量趋势" class="chart-card">
          <div class="chart-placeholder">
            <div class="chart-content">
              <h3>访问量趋势图</h3>
              <p>这里可以集成 ECharts 或其他图表库</p>
              <div class="mock-chart">
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar" style="height: 45%"></div>
                <div class="chart-bar" style="height: 90%"></div>
                <div class="chart-bar" style="height: 70%"></div>
                <div class="chart-bar" style="height: 85%"></div>
                <div class="chart-bar" style="height: 65%"></div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :span="8">
        <a-card title="用户分布" class="chart-card">
          <div class="chart-placeholder">
            <div class="chart-content">
              <h3>用户分布饼图</h3>
              <div class="pie-chart">
                <div class="pie-item">
                  <div class="pie-color" style="background: #1890ff;"></div>
                  <span>新用户 45%</span>
                </div>
                <div class="pie-item">
                  <div class="pie-color" style="background: #52c41a;"></div>
                  <span>活跃用户 35%</span>
                </div>
                <div class="pie-item">
                  <div class="pie-color" style="background: #fa8c16;"></div>
                  <span>沉睡用户 20%</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 最新动态 -->
    <a-row :gutter="24" class="activity-row">
      <a-col :span="12">
        <a-card title="最新文章" class="activity-card">
          <a-list :data="recentArticles" :bordered="false">
            <template #item="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.title"
                  :description="item.description"
                >
                  <template #avatar>
                    <a-avatar shape="square">
                      <img :src="item.cover" />
                    </a-avatar>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <span class="action-time">{{ item.time }}</span>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      
      <a-col :span="12">
        <a-card title="系统通知" class="activity-card">
          <a-list :data="notifications" :bordered="false">
            <template #item="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.title"
                  :description="item.content"
                >
                  <template #avatar>
                    <a-badge :status="item.status" />
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <span class="action-time">{{ item.time }}</span>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import {
  IconUser,
  IconFile,
  IconEye,
  IconArrowUp,
  IconArrowDown
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'Dashboard',
  components: {
    IconUser,
    IconFile,
    IconEye,
    IconArrowUp,
    IconArrowDown
  },
  setup() {
    const menuStore = useMenuStore()
    
    const currentDate = ref('')
    const stats = ref({
      totalUsers: 12580,
      totalArticles: 1024,
      todayVisits: 3456,
      totalRevenue: 89765.43
    })
    
    const recentArticles = ref([
      {
        title: 'Vue3 组合式API最佳实践',
        description: '深入探讨Vue3组合式API的使用技巧和最佳实践',
        cover: 'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',
        time: '2小时前'
      },
      {
        title: 'Arco Design 组件库使用指南',
        description: '详细介绍Arco Design组件库的特性和使用方法',
        cover: 'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/e278888093bef8910e829486fb45dd69.png~tplv-uwbnlip3yd-webp.webp',
        time: '5小时前'
      },
      {
        title: '前端性能优化实战',
        description: '从多个维度分析前端性能优化的方法和技巧',
        cover: 'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/8361eeb82904210b4f55fab888fe8416.png~tplv-uwbnlip3yd-webp.webp',
        time: '1天前'
      }
    ])
    
    const notifications = ref([
      {
        title: '系统更新通知',
        content: '系统将于今晚23:00进行例行维护，预计耗时2小时',
        status: 'warning',
        time: '1小时前'
      },
      {
        title: '新用户注册',
        content: '今日新增用户128人，较昨日增长15%',
        status: 'success',
        time: '3小时前'
      },
      {
        title: '服务器监控',
        content: '服务器CPU使用率正常，内存使用率78%',
        status: 'normal',
        time: '6小时前'
      }
    ])
    
    onMounted(() => {
      // 设置面包屑
      menuStore.generateBreadcrumbs('/dashboard')
      
      // 设置当前日期
      const now = new Date()
      currentDate.value = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    })
    
    return {
      currentDate,
      stats,
      recentArticles,
      notifications
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.dashboard-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  font-size: 12px;
  color: #52c41a;
}

.stat-trend .arco-icon {
  margin-right: 4px;
}

.trend-text {
  margin-left: 4px;
  color: #86909c;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-content {
  text-align: center;
}

.chart-content h3 {
  margin-bottom: 16px;
  color: #1d2129;
}

.chart-content p {
  color: #86909c;
  margin-bottom: 24px;
}

.mock-chart {
  display: flex;
  align-items: end;
  justify-content: center;
  height: 120px;
  gap: 8px;
}

.chart-bar {
  width: 20px;
  background: linear-gradient(to top, #1890ff, #69c0ff);
  border-radius: 2px 2px 0 0;
}

.pie-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pie-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.activity-row {
  margin-bottom: 24px;
}

.activity-card {
  border-radius: 8px;
}

.action-time {
  color: #86909c;
  font-size: 12px;
}

.arco-list-item-meta-title {
  font-size: 14px;
  font-weight: 500;
}

.arco-list-item-meta-description {
  font-size: 12px;
  color: #86909c;
}
</style> 