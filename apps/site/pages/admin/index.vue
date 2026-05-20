<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

interface AdminStats {
  articles: number
  publishedArticles: number
  draftArticles: number
  pages: number
  media: number
  categories: number
  tags: number
  totalViews: number
}

interface DraftItem {
  id: number
  title: string
  status: string
  updatedAt: string | Date | null
  type: 'article' | 'page'
}

interface ActivityItem {
  id: number
  action: string
  targetType: string
  targetId: number
  targetTitle: string | null
  createdAt: string | Date
}

const api = useAdminApi()

const stats = ref<AdminStats | null>(null)
const drafts = ref<DraftItem[]>([])
const activities = ref<ActivityItem[]>([])
const loading = ref(true)

const statCards = computed(() => {
  if (!stats.value) return []

  return [
    { label: '文章总数', value: stats.value.articles, icon: 'i-heroicons-newspaper', accent: 'from-sky-500/15 to-cyan-400/10' },
    { label: '已发布文章', value: stats.value.publishedArticles, icon: 'i-heroicons-check-badge', accent: 'from-emerald-500/15 to-lime-400/10' },
    { label: '草稿', value: stats.value.draftArticles, icon: 'i-heroicons-pencil-square', accent: 'from-amber-500/15 to-orange-400/10' },
    { label: '累计浏览', value: stats.value.totalViews, icon: 'i-heroicons-chart-bar', accent: 'from-violet-500/15 to-fuchsia-400/10' },
  ]
})

const resourceCards = computed(() => {
  if (!stats.value) return []

  return [
    { label: '独立页面', value: stats.value.pages, description: '关于页、分类页和自定义页面', to: '/admin/page-config' },
    { label: '媒体资源', value: stats.value.media, description: '图片、封面和上传素材', to: '/admin/media' },
    { label: '分类', value: stats.value.categories, description: '文章归档和内容组织', to: '/admin/categories' },
    { label: '标签', value: stats.value.tags, description: '专题聚合和检索入口', to: '/admin/tags' },
  ]
})

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '暂无时间'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function draftLink(item: DraftItem) {
  return item.type === 'page' ? '/admin/page-config' : `/admin/articles/${item.id}`
}

function activityLabel(item: ActivityItem) {
  const map: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    publish: '发布',
  }

  return `${map[item.action] || item.action} ${item.targetType}`
}

async function loadDashboard() {
  loading.value = true
  try {
    const [statsResult, draftsResult, activityResult] = await Promise.all([
      api.get<AdminStats>('/api/admin/stats'),
      api.get<DraftItem[]>('/api/admin/drafts'),
      api.get<ActivityItem[]>('/api/admin/activity', { limit: 8 }),
    ])

    stats.value = statsResult
    drafts.value = draftsResult
    activities.value = activityResult
  }
  finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.12),rgba(34,184,207,0.08),rgba(255,255,255,0.7))] p-6 shadow-sm">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Overview</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-text">后台控制台重新上线</h1>
          <p class="mt-3 text-sm leading-7 text-muted">
            这里恢复为真正的后台首页，负责承接内容管理、前台配置和主题能力入口。
            先把高频工作流重新接通，再逐页补齐更细的 AnZhiYu 配置能力。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/admin/articles/new"
            class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90"
          >
            <span class="i-heroicons-plus h-5 w-5" />
            新建文章
          </NuxtLink>
          <NuxtLink
            to="/admin/general"
            class="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/30 hover:text-primary"
          >
            <span class="i-heroicons-cog-6-tooth h-5 w-5" />
            站点设置
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="rounded-[24px] border border-border/70 bg-surface/85 p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-muted">{{ card.label }}</p>
            <p class="mt-3 text-3xl font-black tracking-tight text-text">
              {{ loading || !stats ? '...' : card.value.toLocaleString() }}
            </p>
          </div>
          <div :class="`bg-gradient-to-br ${card.accent}`" class="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60">
            <span :class="card.icon" class="h-6 w-6 text-primary" />
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-black text-text">核心资源</h2>
            <p class="mt-2 text-sm text-muted">后台当前可管理的主要内容与配置维度。</p>
          </div>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="card in resourceCards"
            :key="card.label"
            :to="card.to"
            class="rounded-[24px] border border-border/70 bg-background/75 p-5 transition hover:border-primary/25 hover:shadow-sm"
          >
            <p class="text-sm font-medium text-muted">{{ card.label }}</p>
            <p class="mt-3 text-3xl font-black tracking-tight text-text">
              {{ loading || !stats ? '...' : card.value }}
            </p>
            <p class="mt-2 text-sm leading-6 text-muted">{{ card.description }}</p>
          </NuxtLink>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-black text-text">待处理草稿</h2>
            <p class="mt-2 text-sm text-muted">最近需要继续整理或发布的内容。</p>
          </div>
          <NuxtLink to="/admin/articles" class="text-sm font-semibold text-primary transition hover:opacity-80">
            查看全部
          </NuxtLink>
        </div>

        <div class="mt-5 space-y-3">
          <NuxtLink
            v-for="item in drafts.slice(0, 6)"
            :key="`${item.type}-${item.id}`"
            :to="draftLink(item)"
            class="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/72 px-4 py-4 transition hover:border-primary/20"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-text">{{ item.title || '未命名内容' }}</p>
              <p class="mt-1 text-xs text-muted">
                {{ item.type === 'page' ? '独立页面' : '文章草稿' }} · {{ formatDate(item.updatedAt) }}
              </p>
            </div>
            <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {{ item.type === 'page' ? '页面' : '文章' }}
            </span>
          </NuxtLink>

          <div
            v-if="!loading && drafts.length === 0"
            class="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-8 text-center text-sm text-muted"
          >
            当前没有待处理草稿。
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-black text-text">最近活动</h2>
          <p class="mt-2 text-sm text-muted">帮助快速判断最近内容变动和后台操作轨迹。</p>
        </div>
      </div>

      <div class="mt-5 space-y-3">
        <div
          v-for="item in activities"
          :key="item.id"
          class="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/72 px-4 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-sm font-semibold text-text">{{ activityLabel(item) }}</p>
            <p class="mt-1 text-xs text-muted">{{ item.targetTitle || `ID ${item.targetId}` }}</p>
          </div>
          <p class="text-xs text-muted">{{ formatDate(item.createdAt) }}</p>
        </div>

        <div
          v-if="!loading && activities.length === 0"
          class="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-8 text-center text-sm text-muted"
        >
          还没有可展示的活动记录。
        </div>
      </div>
    </section>
  </div>
</template>
