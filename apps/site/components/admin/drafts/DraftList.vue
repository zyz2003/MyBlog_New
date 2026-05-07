<script setup lang="ts"

interface DraftItem {
  id: number
  title: string
  type: 'article' | 'page'
  status: string
  updatedAt: string | null
}

defineProps<{
  items: DraftItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [item: DraftItem]
  delete: [item: DraftItem]
}>()

const typeLabels: Record<string, string> = {
  article: '文章',
  page: '页面',
}

const typeColors: Record<string, string> = {
  article: 'bg-blue-100 text-blue-700',
  page: 'bg-green-100 text-green-700',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">标题</th>
          <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-24">类型</th>
          <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-32">状态</th>
          <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-40">最后修改</th>
          <th class="text-right px-4 py-3 text-sm font-medium text-gray-500 w-24">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="`${item.type}-${item.id}`"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <td class="px-4 py-3">
            <button
              class="text-sm font-medium text-gray-900 hover:text-primary text-left"
              @click="emit('edit', item)"
            >
              {{ item.title || '(无标题)' }}
            </button>
          </td>
          <td class="px-4 py-3">
            <span
              class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
              :class="typeColors[item.type]"
            >
              {{ typeLabels[item.type] || item.type }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span class="text-sm text-gray-500">草稿</span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-500">
            {{ formatDate(item.updatedAt) }}
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-2">
              <button
                class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="编辑"
                @click="emit('edit', item)"
              >
                <span class="i-heroicons-pencil-square w-4 h-4" />
              </button>
              <button
                class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="删除"
                @click="emit('delete', item)"
              >
                <span class="i-heroicons-trash w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="items.length === 0 && !loading">
          <td colspan="5" class="text-center py-8 text-gray-400 text-sm">
            暂无草稿
          </td>
        </tr>
        <tr v-if="loading">
          <td colspan="5" class="py-8">
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="flex gap-4 animate-pulse">
                <div class="flex-1 h-4 bg-gray-200 rounded" />
                <div class="w-16 h-4 bg-gray-200 rounded" />
                <div class="w-20 h-4 bg-gray-200 rounded" />
                <div class="w-24 h-4 bg-gray-200 rounded" />
                <div class="w-16 h-4 bg-gray-200 rounded" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
