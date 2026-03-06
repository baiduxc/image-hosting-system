<template>
  <t-dialog
    v-model:visible="visible"
    header="系统公告"
    width="600px"
    :close-on-overlay-click="false"
    :close-btn="false"
    :confirm-btn="{ content: '知道了', theme: 'primary' }"
    :cancel-btn="null"
    @confirm="handleConfirm"
  >
    <div class="announcement-content">
      <t-typography>
        <div v-html="renderedContent"></div>
      </t-typography>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="checkbox-wrapper">
          <t-checkbox v-model="doNotShowAgain">不再提示</t-checkbox>
        </div>
        <t-button theme="primary" @click="handleConfirm">知道了</t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  content: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close', doNotShowAgain: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const doNotShowAgain = ref(false)

// 简单的 Markdown 渲染
const renderedContent = computed(() => {
  if (!props.content) return ''
  
  let html = props.content
    // 转义 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gim, '<h3 style="margin: 16px 0 8px; font-size: 16px; font-weight: 600; color: var(--td-text-color-primary);">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="margin: 20px 0 12px; font-size: 18px; font-weight: 600; color: var(--td-text-color-primary);">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="margin: 24px 0 16px; font-size: 20px; font-weight: 600; color: var(--td-text-color-primary);">$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em style="font-style: italic;">$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
    // 删除线
    .replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through;">$1</del>')
    // 代码
    .replace(/`(.*?)`/g, '<code style="background: var(--td-bg-color-secondarycontainer); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">$1</code>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre style="background: var(--td-bg-color-secondarycontainer); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 12px 0;"><code style="font-family: monospace; font-size: 13px; line-height: 1.5;">$1</code></pre>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--td-brand-color); padding-left: 12px; margin: 12px 0; color: var(--td-text-color-secondary);">$1</blockquote>')
    // 无序列表
    .replace(/^- (.*$)/gim, '<li style="margin: 4px 0; margin-left: 20px; list-style-type: disc;">$1</li>')
    // 有序列表
    .replace(/^\d+\. (.*$)/gim, '<li style="margin: 4px 0; margin-left: 20px; list-style-type: decimal;">$1</li>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--td-brand-color); text-decoration: none;">$1</a>')
    // 水平线
    .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid var(--td-border-level-1-color); margin: 16px 0;">')
    // 段落换行
    .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.6;">')
    .replace(/\n/g, '<br>')
  
  // 包裹在段落中
  if (!html.startsWith('<')) {
    html = '<p style="margin: 8px 0; line-height: 1.6;">' + html + '</p>'
  }
  
  return html
})

const handleConfirm = () => {
  emit('close', doNotShowAgain.value)
  visible.value = false
}

// 当对话框打开时重置"不再提示"状态
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    doNotShowAgain.value = false
  }
})
</script>

<style scoped>
.announcement-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 4px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}
</style>
