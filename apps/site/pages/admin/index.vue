<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'

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
      api.get<{ total: number; items: ArticleWithRelations[] }>('/api/articles', { pageSize: 6 }),
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
  published: 'text-primary',
  draft: 'text-secondary',
  scheduled: 'text-accent',
}

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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text">
          仪表盘
        </h1>
        <p class="text-muted mt-1">欢迎回来！实时查看博客运营状态</p>
      </div>
      <NuxtLink
        to="/admin/articles/new"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        <img src="/icons/write.svg" class="w-4 h-4" alt="">
        写文章
      </NuxtLink>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="(item, idx) in [
          { label: '文章总数', value: stats.articles, sub: `${stats.publishedArticles} 已发布`, icon: '/icons/article.svg', color: 'text-primary' },
          { label: '总浏览量', value: stats.totalViews, sub: '累计访问', icon: '/icons/views.svg', color: 'text-accent' },
          { label: '自定义页面', value: stats.pages, sub: '独立页面', icon: '/icons/page.svg', color: 'text-secondary' },
          { label: '媒体文件', value: stats.media, sub: '已上传', icon: '/icons/media.svg', color: 'text-primary' },
        ]"
        :key="idx"
        :to="idx === 0 ? '/admin/articles' : idx === 2 ? '/admin/pages' : idx === 3 ? '/admin/media' : ''"
        class="group bg-surface rounded-2xl border border-border p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <img :src="item.icon" class="w-5 h-5" :alt="item.label">
              <span class="text-sm text-muted">{{ item.label }}</span>
            </div>
            <p class="text-3xl font-bold text-text">
              {{ loading ? '—' : item.value.toLocaleString() }}
            </p>
            <p class="text-xs text-muted mt-1">{{ item.sub }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-12 gap-4">
      <!-- Recent Articles -->
      <div class="col-span-12 lg:col-span-8">
        <div class="bg-surface rounded-2xl border border-border h-full">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <div class="flex items-center gap-2">
              <img src="/icons/chart.svg" class="w-5 h-5" alt="">
              <h3 class="font-semibold text-text">最新文章</h3>
            </div>
            <NuxtLink
              to="/admin/articles"
              class="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
            >
              查看全部
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>

          <div class="p-4">
            <div v-if="loading" class="space-y-2">
              <div v-for="i in 4" :key="i" class="h-14 bg-surface-2 rounded-xl animate-pulse" />
            </div>

            <div v-else-if="recentArticles.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
              <img src="/icons/article.svg" class="w-10 h-10 text-muted/30 mb-3" alt="">
              <p class="text-muted text-sm mb-3">暂无文章</p>
              <NuxtLink
                to="/admin/articles/new"
                class="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                撰写第一篇
              </NuxtLink>
            </div>

            <div v-else class="space-y-1">
              <NuxtLink
                v-for="article in recentArticles"
                :key="article.id"
                :to="`/admin/articles/${article.id}`"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-all duration-200 group cursor-pointer"
              >
                <img src="/icons/article.svg" class="w-5 h-5 text-muted group-hover:text-primary transition-colors flex-shrink-0" alt="">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-text group-hover:text-primary truncate transition-colors">
                    {{ article.title }}
                  </p>
                  <p class="text-xs text-muted">{{ formatDate(article.createdAt) }}</p>
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium shrink-0 border"
                  :class="statusColors[article.status] || 'text-muted border-border'"
                >
                  {{ statusLabels[article.status] || article.status }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="col-span-12 lg:col-span-4 space-y-4">
        <!-- Activity -->
        <div class="bg-surface rounded-2xl border border-border">
          <div class="flex items-center gap-2 px-5 py-4 border-b border-border">
            <img src="/icons/clock.svg" class="w-5 h-5 text-accent" alt="">
            <h3 class="font-semibold text-text">最新动态</h3>
          </div>
          <div class="p-4">
            <div v-if="loading" class="space-y-3">
              <div v-for="i in 4" :key="i" class="flex items-start gap-3 animate-pulse">
                <div class="w-5 h-5 rounded-full bg-surface-2 flex-shrink-0 mt-0.5" />
                <div class="flex-1 space-y-1.5">
                  <div class="h-3.5 bg-surface-2 rounded w-3/4" />
                  <div class="h-3 bg-surface rounded w-1/4" />
                </div>
              </div>
            </div>

            <div v-else-if="activities.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
              <img src="/icons/clock.svg" class="w-10 h-10 text-muted/30 mb-3" alt="">
              <p class="text-muted text-sm">暂无动态</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="activity in activities.slice(0, 6)"
                :key="activity.id"
                class="flex items-start gap-3"
              >
                <img
                  v-if="activity.action === 'create'"
                  src="/icons/article.svg"
                  class="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                  alt=""
                >
                <img
                  v-else-if="activity.action === 'update'"
                  src="/icons/settings.svg"
                  class="w-4 h-4 text-secondary flex-shrink-0 mt-0.5"
                  alt=""
                >
                <img
                  v-else-if="activity.action === 'delete'"
                  src="/icons/trash.svg"
                  class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                  alt=""
                >
                <img
                  v-else-if="activity.action === 'publish'"
                  src="/icons/check.svg"
                  class="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                  alt=""
                >
                <img
                  v-else
                  src="/icons/clock.svg"
                  class="w-4 h-4 text-muted flex-shrink-0 mt-0.5"
                  alt=""
                >
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-text leading-snug">
                    <span class="font-medium">{{ actionLabels[activity.action] || activity.action }}</span>
                    <span class="text-muted">{{ targetLabels[activity.targetType] || activity.targetType }}</span>
                    <span class="font-medium block truncate">{{ activity.targetTitle || '(无标题)' }}</span>
                  </p>
                  <p class="text-xs text-muted mt-0.5">{{ formatTimeAgo(activity.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini Stats -->
        <div class="bg-surface rounded-2xl border border-border p-4">
          <div class="flex items-center gap-3 mb-3">
            <img src="/icons/chart.svg" class="w-6 h-6 text-primary" alt="">
            <h3 class="font-semibold text-text text-sm">内容概览</h3>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-3">
              <img src="/icons/folder.svg" class="w-5 h-5 text-secondary" alt="">
              <div>
                <p class="text-lg font-bold text-text leading-none">{{ stats.categories }}</p>
                <p class="text-xs text-muted">分类</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <img src="/icons/tag.svg" class="w-5 h-5 text-secondary" alt="">
              <div>
                <p class="text-lg font-bold text-text leading-none">{{ stats.tags }}</p>
                <p class="text-xs text-muted">标签</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <NuxtLink
        v-for="(link, idx) in [
          { label: '文章管理', sub: '查看与编辑', to: '/admin/articles', icon: '/icons/article.svg', color: 'text-primary' },
          { label: '分类管理', sub: '管理分类', to: '/admin/categories', icon: '/icons/folder.svg', color: 'text-secondary' },
          { label: '媒体库', sub: '上传与管理', to: '/admin/media', icon: '/icons/media.svg', color: 'text-accent' },
          { label: '系统设置', sub: '配置选项', to: '/admin/settings', icon: '/icons/settings.svg', color: 'text-primary' },
        ]"
        :key="idx"
        :to="link.to"
        class="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 group cursor-pointer"
      >
        <img :src="link.icon" :class="link.color" class="w-7 h-7 flex-shrink-0" alt="">
        <div>
          <p class="text-sm font-semibold text-text">{{ link.label }}</p>
          <p class="text-xs text-muted">{{ link.sub }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
