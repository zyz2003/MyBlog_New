<script setup lang="ts">
interface Activity {
  id: number
  action: string
  targetType: string
  targetId: number
  targetTitle: string | null
  createdAt: string
}

defineProps<{
  activities: Activity[]
  loading?: boolean
}>()

const actionLabels: Record<string, string> = {
  create: '创建了',
  update: '更新了',
  delete: '删除了',
  publish: '发布了',
}

const targetLabels: Record<string, string> = {
  article: '文章',
  page: '页面',
  media: '媒体',
  category: '分类',
  tag: '标签',
}

const actionIcons: Record<string, string> = {
  create: 'i-heroicons-plus-circle text-green-500',
  update: 'i-heroicons-pencil-square text-amber-500',
  delete: 'i-heroicons-trash text-red-500',
  publish: 'i-heroicons-check-circle text-green-600',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-amber-100 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-amber-900 dark:text-white mb-4">最近活动</h3>
    <div class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start gap-3"
      >
        <span
          :class="actionIcons[activity.action] || 'i-heroicons-circle text-gray-400'"
          class="w-5 h-5 mt-0.5 flex-shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-amber-800 dark:text-gray-200">
            <span class="font-medium">{{ actionLabels[activity.action] || activity.action }}</span>
            <span class="text-amber-600 dark:text-gray-400">{{ targetLabels[activity.targetType] || activity.targetType }}</span>
            <span class="font-medium truncate">{{ activity.targetTitle || '(无标题)' }}</span>
          </p>
          <p class="text-xs text-amber-500 dark:text-gray-500 mt-0.5">{{ formatDate(activity.createdAt) }}</p>
        </div>
      </div>
      <div v-if="activities.length === 0 && !loading" class="text-center py-6 text-amber-400 dark:text-gray-500 text-sm">
        暂无活动记录
      </div>
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-start gap-3 animate-pulse">
          <div class="w-5 h-5 rounded-full bg-amber-100 dark:bg-gray-700 mt-0.5" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-amber-100 dark:bg-gray-700 rounded w-3/4" />
            <div class="h-3 bg-amber-50 dark:bg-gray-600 rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>