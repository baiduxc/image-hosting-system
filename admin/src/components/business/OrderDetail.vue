<template>
  <div class="order-detail">
    <a-descriptions title="订单基本信息" :column="3" bordered>
      <a-descriptions-item label="订单号">
        {{ order.order_no }}
        <a-button type="text" size="small" @click="copyOrderNo">
          <template #icon>
            <icon-copy />
          </template>
        </a-button>
      </a-descriptions-item>
      <a-descriptions-item label="订单类型">
        <a-tag :color="getOrderTypeColor(order.order_type)">
          {{ order.order_type_text }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="创建时间">
        {{ order.create_time }}
      </a-descriptions-item>
      <a-descriptions-item label="会员信息">
        <div class="member-info">
          <div>{{ order.member?.username }}</div>
          <div class="member-contact">{{ order.member?.phone }}</div>
          <div class="member-contact">{{ order.member?.email }}</div>
        </div>
      </a-descriptions-item>
      <a-descriptions-item label="订单状态">
        <a-badge
          :status="getOrderStatusBadge(order.order_status)"
          :text="order.order_status_text"
        />
      </a-descriptions-item>
      <a-descriptions-item label="支付状态">
        <a-badge
          :status="getPaymentStatusBadge(order.payment_status)"
          :text="order.payment_status_text"
        />
      </a-descriptions-item>
    </a-descriptions>
    
    <a-descriptions title="金额信息" :column="3" bordered style="margin-top: 16px;">
      <a-descriptions-item label="订单总额">
        <span class="amount">¥{{ order.total_amount }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="优惠金额">
        <span class="discount-amount">-¥{{ order.discount_amount }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="实付金额">
        <span class="actual-amount">¥{{ order.actual_amount }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="支付方式">
        {{ order.payment_method_text || '未选择' }}
      </a-descriptions-item>
      <a-descriptions-item label="支付时间">
        {{ order.payment_time || '未支付' }}
      </a-descriptions-item>
      <a-descriptions-item label="支付单号">
        {{ order.payment_no || '无' }}
      </a-descriptions-item>
    </a-descriptions>
    
    <!-- 订单商品 -->
    <div style="margin-top: 16px;">
      <h4>订单商品</h4>
      <a-table
        :data="order.items"
        :pagination="false"
        size="small"
        :scroll="{ x: 800 }"
      >
        <template #columns>
          <a-table-column title="商品信息" :width="300">
            <template #cell="{ record }">
              <div class="item-info">
                <img 
                  v-if="record.item_cover" 
                  :src="record.item_cover" 
                  class="item-cover"
                />
                <div class="item-details">
                  <div class="item-title">{{ record.item_title }}</div>
                  <div v-if="record.teacher_name" class="item-teacher">
                    讲师: {{ record.teacher_name }}
                  </div>
                  <div class="item-type">
                    <a-tag size="small" :color="getOrderTypeColor(record.item_type)">
                      {{ getItemTypeText(record.item_type) }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="单价" data-index="item_price" :width="100">
            <template #cell="{ record }">
              ¥{{ record.item_price }}
            </template>
          </a-table-column>
          <a-table-column title="原价" data-index="item_original_price" :width="100">
            <template #cell="{ record }">
              <span v-if="record.item_original_price > record.item_price" class="original-price">
                ¥{{ record.item_original_price }}
              </span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="数量" data-index="quantity" :width="80" />
          <a-table-column title="小计" data-index="total_price" :width="100">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.total_price }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
    
    <!-- 支付记录 -->
    <div v-if="order.payment_orders?.length" style="margin-top: 16px;">
      <h4>支付记录</h4>
      <a-table
        :data="order.payment_orders"
        :pagination="false"
        size="small"
        :scroll="{ x: 1000 }"
      >
        <template #columns>
          <a-table-column title="支付单号" data-index="payment_no" :width="200">
            <template #cell="{ record }">
              <span>{{ record.payment_no }}</span>
              <a-button type="text" size="small" @click="copyText(record.payment_no)">
                <template #icon>
                  <icon-copy />
                </template>
              </a-button>
            </template>
          </a-table-column>
          <a-table-column title="支付方式" data-index="payment_type" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getPaymentTypeColor(record.payment_type)">
                {{ record.payment_type_text }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="支付方法" data-index="payment_method" :width="100" />
          <a-table-column title="支付金额" data-index="amount" :width="100">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.amount }}</span>
            </template>
          </a-table-column>
          <a-table-column title="支付状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="record.status === 1 ? 'success' : 'default'"
                :text="record.status === 1 ? '支付成功' : '待支付'"
              />
            </template>
          </a-table-column>
          <a-table-column title="支付时间" data-index="paid_time" :width="160" />
          <a-table-column title="创建时间" data-index="create_time" :width="160" />
          <a-table-column title="退款信息" :width="200">
            <template #cell="{ record }">
              <div v-if="record.refunds?.length">
                <div v-for="refund in record.refunds" :key="refund.id" class="refund-info">
                  <a-tag color="orange" size="small">
                    退款 ¥{{ refund.refund_amount }}
                  </a-tag>
                  <div class="refund-time">{{ refund.refund_time }}</div>
                  <div v-if="refund.refund_reason" class="refund-reason">
                    {{ refund.refund_reason }}
                  </div>
                </div>
              </div>
              <span v-else class="no-refund">无退款</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
    
    <!-- 订单备注 -->
    <a-descriptions 
      v-if="order.remark" 
      title="订单备注" 
      :column="1" 
      bordered 
      style="margin-top: 16px;"
    >
      <a-descriptions-item label="备注信息">
        {{ order.remark }}
      </a-descriptions-item>
    </a-descriptions>
    
    <!-- 操作记录 -->
    <div v-if="order.operation_logs?.length" style="margin-top: 16px;">
      <h4>操作记录</h4>
      <a-timeline>
        <a-timeline-item 
          v-for="log in order.operation_logs" 
          :key="log.id"
          :color="getOperationColor(log.operation_type)"
        >
          <div class="operation-item">
            <div class="operation-title">{{ log.operation_text }}</div>
            <div class="operation-details">
              <span class="operation-operator">操作人: {{ log.operator_name }}</span>
              <span class="operation-time">{{ log.create_time }}</span>
            </div>
            <div v-if="log.remark" class="operation-remark">
              备注: {{ log.remark }}
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </div>
</template>

<script>
import { Message } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'

export default {
  name: 'OrderDetail',
  components: {
    IconCopy
  },
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  setup() {
    // 获取订单类型颜色
    const getOrderTypeColor = (type) => {
      const colors = {
        1: 'blue',    // 课程
        2: 'green',   // 直播课
        3: 'orange'   // 活动报名
      }
      return colors[type] || 'default'
    }
    
    // 获取商品类型文本
    const getItemTypeText = (type) => {
      const texts = {
        1: '课程',
        2: '直播课',
        3: '活动报名'
      }
      return texts[type] || '未知'
    }
    
    // 获取支付状态徽章
    const getPaymentStatusBadge = (status) => {
      const badges = {
        0: 'normal',    // 待支付
        1: 'success',   // 已支付
        2: 'warning',   // 已退款
        3: 'danger'     // 已取消
      }
      return badges[status] || 'normal'
    }
    
    // 获取订单状态徽章
    const getOrderStatusBadge = (status) => {
      const badges = {
        1: 'normal',     // 待支付
        2: 'success',    // 已支付
        3: 'processing', // 已完成
        4: 'danger',     // 已取消
        5: 'warning'     // 已退款
      }
      return badges[status] || 'normal'
    }
    
    // 获取支付方式颜色
    const getPaymentTypeColor = (type) => {
      const colors = {
        'wechat': 'green',
        'alipay': 'blue',
        'balance': 'orange'
      }
      return colors[type] || 'default'
    }
    
    // 获取操作记录颜色
    const getOperationColor = (type) => {
      const colors = {
        'create': 'blue',
        'pay': 'green',
        'refund': 'orange',
        'cancel': 'red',
        'complete': 'purple'
      }
      return colors[type] || 'gray'
    }
    
    // 复制订单号
    const copyOrderNo = async () => {
      await copyText(order.value.order_no)
    }
    
    // 复制文本
    const copyText = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        Message.success('复制成功')
      } catch (error) {
        Message.error('复制失败')
      }
    }
    
    return {
      getOrderTypeColor,
      getItemTypeText,
      getPaymentStatusBadge,
      getOrderStatusBadge,
      getPaymentTypeColor,
      getOperationColor,
      copyOrderNo,
      copyText
    }
  }
}
</script>

<style scoped>
.order-detail {
  max-height: 600px;
  overflow-y: auto;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-contact {
  color: #86909c;
  font-size: 12px;
}

.amount {
  color: #1d2129;
  font-weight: 500;
}

.discount-amount {
  color: #f53f3f;
  font-weight: 500;
}

.actual-amount {
  color: #00b42a;
  font-weight: 600;
  font-size: 16px;
}

.item-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.item-cover {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-title {
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.4;
}

.item-teacher {
  color: #86909c;
  font-size: 12px;
  margin-bottom: 4px;
}

.item-type {
  margin-top: 4px;
}

.original-price {
  color: #86909c;
  text-decoration: line-through;
  font-size: 12px;
}

.refund-info {
  margin-bottom: 8px;
}

.refund-time {
  color: #86909c;
  font-size: 11px;
  margin-top: 2px;
}

.refund-reason {
  color: #86909c;
  font-size: 11px;
  margin-top: 2px;
  font-style: italic;
}

.no-refund {
  color: #86909c;
  font-size: 12px;
}

.operation-item {
  padding: 8px 0;
}

.operation-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.operation-details {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.operation-operator,
.operation-time {
  color: #86909c;
  font-size: 12px;
}

.operation-remark {
  color: #86909c;
  font-size: 12px;
  font-style: italic;
}

h4 {
  margin: 16px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}
</style> 