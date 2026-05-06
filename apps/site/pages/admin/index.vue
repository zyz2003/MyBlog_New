<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'

definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

const loading = ref(true)
const totalCount = ref(0)
const publishedCount = ref(0)
const draftCount = ref(0)
const totalViews = ref(0)
const recentArticles = ref<ArticleWithRelations[]>([])

async function fetchStats() {
  loading.value = true
  try {
    // Fetch totals for each status
    const [allRes, publishedRes, draftRes] = await Promise.all([
      api.get<{ total: number; items: ArticleWithRelations[] }>('/api/articles', { pageSize: 5 }),
      api.get<{ total: number }>('/api/articles', { pageSize: 1, status: 'published' }),
      api.get<{ total: number }>('/api/articles', { pageSize: 1, status: 'draft' }),
    ])

    totalCount.value = allRes.total
    publishedCount.value = publishedRes.total
    draftCount.value = draftRes.total
    recentArticles.value = allRes.items

    // Calculate total views from recent articles (approximation)
    totalViews.value = allRes.items.reduce((sum, a) => sum + (a.viewCount || 0), 0)
  }
  catch (e) {
    console.error('Failed to fetch stats:', e)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})

const statCards = computed(() => [
  { label: '文章总数', value: totalCount.value, icon: 'i-heroicons-document-text', color: 'text-blue-600 bg-blue-50' },
  { label: '已发布', value: publishedCount.value, icon: 'i-heroicons-check-circle', color: 'text-green-600 bg-green-50' },
  { label: '草稿', value: draftCount.value, icon: 'i-heroicons-pencil-square', color: 'text-yellow-600 bg-yellow-50' },
  { label: '总浏览量', value: totalViews.value, icon: 'i-heroicons-eye', color: 'text-purple-600 bg-purple-50' },
])

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const statusLabels: Record<string, string> = {
  published: '已发布',
  draft: '草稿',
  scheduled: '定时发布',
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="card animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div class="h-8 bg-gray-200 rounded w-1/3" />
      </div>
    </div>

    <!-- Stats cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="card in statCards" :key="card.label" class="card flex items-center gap-4">
        <div :class="card.color" class="w-12 h-12 rounded-lg flex items-center justify-center">
          <span :class="card.icon" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-sm text-gray-500">{{ card.label }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
        </div>
      </div>
    </div>

    <!-- Recent articles -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">最近文章</h2>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded animate-pulse" />
      </div>

      <div v-else-if="recentArticles.length === 0" class="text-center py-8 text-gray-400">
        <span class="i-heroicons-document-text w-12 h-12 mx-auto block mb-2" />
        <p>暂无文章</p>
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-2 text-sm font-medium text-gray-500">标题</th>
            <th class="text-left py-2 text-sm font-medium text-gray-500">状态</th>
            <th class="text-left py-2 text-sm font-medium text-gray-500">日期</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="article in recentArticles"
            :key="article.id"
            class="border-b border-gray-50 hover:bg-gray-50"
          >
            <td class="py-3">
              <NuxtLink
                :to="`/admin/articles/${article.id}`"
                class="text-sm font-medium text-gray-900 hover:text-primary"
              >
                {{ article.title }}
              </NuxtLink>
            </td>
            <td class="py-3">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusColors[article.status] || 'bg-gray-100 text-gray-700'"
              >
                {{ statusLabels[article.status] || article.status }}
              </span>
            </td>
            <td class="py-3 text-sm text-gray-500">
              {{ formatDate(article.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
