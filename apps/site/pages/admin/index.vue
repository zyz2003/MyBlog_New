<script setup lang="ts"
import type { ArticleWithRelations } from '~/server/services/article.service'

definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

const loading = ref(true)
const stats = ref({
  articles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  pages: 0,
  media: 0,
  categories: 0,
  tags: 0,
  totalViews: 0,
})
const activities = ref<Array<{
  id: number
  action: string
  targetType: string
  targetId: number
  targetTitle: string | null
  createdAt: string
}>>([])
const recentArticles = ref<ArticleWithRelations[]>([])

async function fetchDashboard() {
  loading.value = true
  try {
    const [statsData, activityData, articlesData] = await Promise.all([
      api.get<typeof stats.value>('/api/admin/stats'),
      api.get<typeof activities.value>('/api/admin/activity'),
      api.get<{ total: number; items: ArticleWithRelations[] }>('/api/articles', { pageSize: 5 }),
    ])
    stats.value = statsData
    activities.value = activityData
    recentArticles.value = articlesData.items
  }
  catch (e) {
    console.error('Failed to fetch dashboard:', e)
  }
  finally {
    loading.value = false
  }
}

const statItems = computed(() => [
  { label: '文章总数', value: stats.value.articles, icon: 'i-heroicons-document-text', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: '已发布', value: stats.value.publishedArticles, icon: 'i-heroicons-check-circle', color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: '草稿', value: stats.value.draftArticles, icon: 'i-heroicons-pencil-square', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { label: '浏览量', value: stats.value.totalViews, icon: 'i-heroicons-eye', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: '自定义页面', value: stats.value.pages, icon: 'i-heroicons-document-duplicate', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { label: '媒体文件', value: stats.value.media, icon: 'i-heroicons-photo', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { label: '分类', value: stats.value.categories, icon: 'i-heroicons-folder', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { label: '标签', value: stats.value.tags, icon: 'i-heroicons-tag', color: 'text-teal-600', bgColor: 'bg-teal-50' },
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

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div>
    <!-- Header with quick actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>
      <AdminDashboardQuickActions />
    </div>

    <!-- Stat cards -->
    <AdminDashboardStatCards :stats="statItems" :loading="loading" class="mb-6" />

    <!-- Two column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity timeline -->
      <div class="lg:col-span-1">
        <AdminDashboardActivityTimeline :activities="activities" :loading="loading" />
      </div>

      <!-- Recent articles -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">最近文章</h3>

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
                <th class="text-left py-2 text-sm font-medium text-gray-500 w-24">状态</th>
                <th class="text-left py-2 text-sm font-medium text-gray-500 w-32">日期</th>
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
    </div>
  </div>
</template>
