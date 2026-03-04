<template>
  <div class="order-statistics">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日订单"
            :value="todayStats.orders"
            :value-style="{ color: '#1890ff' }"
          />
          <div class="stat-extra">
            <span class="stat-trend" :class="todayStats.ordersTrend > 0 ? 'up' : 'down'">
              {{ todayStats.ordersTrend > 0 ? '+' : '' }}{{ todayStats.ordersTrend }}%
            </span>
            <span class="stat-label">较昨日</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日收入"
            :value="todayStats.revenue"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#52c41a' }"
          />
          <div class="stat-extra">
            <span class="stat-trend" :class="todayStats.revenueTrend > 0 ? 'up' : 'down'">
              {{ todayStats.revenueTrend > 0 ? '+' : '' }}{{ todayStats.revenueTrend }}%
            </span>
            <span class="stat-label">较昨日</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="待处理订单"
            :value="pendingStats.orders"
            :value-style="{ color: '#faad14' }"
          />
          <div class="stat-extra">
            <span class="stat-label">需要处理</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="退款订单"
            :value="refundStats.orders"
            :value-style="{ color: '#f5222d' }"
          />
          <div class="stat-extra">
            <span class="stat-amount">¥{{ refundStats.amount }}</span>
            <span class="stat-label">退款金额</span>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ordersApi } from '@/api/orders'

export default {
  name: 'OrderStatistics',
  setup() {
    const todayStats = reactive({
      orders: 0,
      revenue: 0,
      ordersTrend: 0,
      revenueTrend: 0
    })
    
    const pendingStats = reactive({
      orders: 0
    })
    
    const refundStats = reactive({
      orders: 0,
      amount: 0
    })
    
    // 加载统计数据
    const loadStatistics = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const result = await ordersApi.getOrderStatistics({
          start_date: today,
          end_date: today
        })
        
        if (result.code === 200) {
          const data = result.data
          
          // 今日统计
          todayStats.orders = data.overview?.total_orders || 0
          todayStats.revenue = data.overview?.net_amount || 0
          
          // 待处理订单（待支付状态）
          const pendingStatus = data.status_stats?.find(s => s.order_status === 1)
          pendingStats.orders = pendingStatus?.count || 0
          
          // 退款订单
          const refundStatus = data.status_stats?.find(s => s.order_status === 5)
          refundStats.orders = refundStatus?.count || 0
          refundStats.amount = data.overview?.refund_amount || 0
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }
    
    onMounted(() => {
      loadStatistics()
    })
    
    return {
      todayStats,
      pendingStats,
      refundStats
    }
  }
}
</script>

<style scoped>
.order-statistics {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-extra {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #f5222d;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.stat-amount {
  font-size: 12px;
  font-weight: 500;
  color: #f5222d;
}
</style> 