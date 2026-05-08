<script setup lang="ts">
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
  { label: '文章总数', value: stats.value.articles, icon: 'i-heroicons-document-text', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { label: '已发布', value: stats.value.publishedArticles, icon: 'i-heroicons-check-circle', color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: '草稿', value: stats.value.draftArticles, icon: 'i-heroicons-pencil-square', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { label: '浏览量', value: stats.value.totalViews, icon: 'i-heroicons-eye', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: '自定义页面', value: stats.value.pages, icon: 'i-heroicons-document-duplicate', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { label: '媒体文件', value: stats.value.media, icon: 'i-heroicons-photo', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { label: '分类', value: stats.value.categories, icon: 'i-heroicons-folder', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { label: '标签', value: stats.value.tags, icon: 'i-heroicons-tag', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
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
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with quick actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-amber-900 dark:text-white">仪表盘</h1>
        <p class="text-sm text-amber-600 dark:text-gray-400 mt-1">欢迎回来！以下是博客的概览。</p>
      </div>
      <AdminDashboardQuickActions />
    </div>

    <!-- Stat cards -->
    <AdminDashboardStatCards :stats="statItems" :loading="loading" />

    <!-- Two column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity timeline -->
      <div class="lg:col-span-1">
        <AdminDashboardActivityTimeline :activities="activities" :loading="loading" />
      </div>

      <!-- Recent articles -->
      <div class="lg:col-span-2">
        <div class="bg-white/80 dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-gray-700 p-6 backdrop-blur-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-amber-900 dark:text-white">最近文章</h3>
            <NuxtLink
              to="/admin/articles"
              class="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
            >
              查看全部
            </NuxtLink>
          </div>

          <div v-if="loading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-14 bg-amber-100/50 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="recentArticles.length === 0" class="text-center py-12">
            <span class="i-heroicons-document-text w-12 h-12 mx-auto block mb-4 text-amber-300 dark:text-gray-600" />
            <p class="text-amber-600 dark:text-gray-400">暂无文章</p>
            <NuxtLink
              to="/admin/articles/new"
              class="inline-block mt-4 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
            >
              撰写第一篇文章
            </NuxtLink>
          </div>

          <div v-else class="space-y-3">
            <NuxtLink
              v-for="article in recentArticles"
              :key="article.id"
              :to="`/admin/articles/${article.id}`"
              class="flex items-center justify-between p-4 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700/50 transition-colors group border border-transparent hover:border-amber-100 dark:hover:border-gray-600"
            >
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span class="i-heroicons-document-text w-5 h-5 text-white" />
                </div>
                <div class="min-w-0">
                  <h4 class="text-sm font-medium text-amber-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate transition-colors">
                    {{ article.title }}
                  </h4>
                  <p class="text-xs text-amber-500 dark:text-gray-400 mt-0.5">{{ formatDate(article.createdAt) }}</p>
                </div>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                :class="statusColors[article.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ statusLabels[article.status] || article.status }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>