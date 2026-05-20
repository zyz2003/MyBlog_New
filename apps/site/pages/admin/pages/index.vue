<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const api = useAdminApi()
const router = useRouter()

interface PageItem {
  id: number
  title: string
  slug: string
  template: string
  status: string
  showInNav: boolean
  updatedAt: string
}

const pages = ref<PageItem[]>([])
const loading = ref(true)
const filter = ref<'all' | 'published' | 'draft'>('all')
const searchQuery = ref('')

const statusOptions = [
  { key: 'all', label: '全部页面' },
  { key: 'published', label: '已发布' },
  { key: 'draft', label: '草稿' },
] as const

async function fetchPages() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { pageSize: 100 }
    if (filter.value !== 'all')
      params.status = filter.value
    const res = await api.get<{ items: PageItem[] }>('/api/admin/pages', params)
    pages.value = res.items
  }
  catch (error) {
    console.error('Failed to fetch pages:', error)
  }
  finally {
    loading.value = false
  }
}

async function deletePage(id: number) {
  if (!confirm('确定删除这个页面吗？')) return

  try {
    await api.del(`/api/pages/${id}`)
    await fetchPages()
  }
  catch (error) {
    console.error('Failed to delete:', error)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function copyLink(slug: string) {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
  }
  catch (error) {
    console.error('Failed to copy page link:', error)
  }
}

const filteredPages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query)
    return pages.value

  return pages.value.filter(page =>
    page.title.toLowerCase().includes(query)
    || page.slug.toLowerCase().includes(query)
    || page.template.toLowerCase().includes(query),
  )
})

const publishedCount = computed(() => pages.value.filter(page => page.status === 'published').length)
const draftCount = computed(() => pages.value.filter(page => page.status === 'draft').length)
const navCount = computed(() => pages.value.filter(page => page.showInNav).length)

onMounted(fetchPages)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-3">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content Center</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight text-text">页面管理</h2>
          </div>
          <p class="max-w-3xl text-sm leading-7 text-muted">
            集中维护关于页、友链页、独立展示页等静态内容。这里更偏向结构化管理，重点查看页面状态、路径、导航显示和最近更新时间。
          </p>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          @click="router.push('/admin/pages/new')"
        >
          <span class="i-heroicons-plus h-5 w-5" />
          新建页面
        </button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">页面总数</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ pages.length }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">已发布</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ publishedCount }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">导航显示中</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ navCount }}</p>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in statusOptions"
            :key="item.key"
            class="rounded-2xl px-4 py-2 text-sm font-semibold transition"
            :class="filter === item.key ? 'bg-primary text-white' : 'bg-background/80 text-muted hover:text-text'"
            @click="filter = item.key; fetchPages()"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="relative w-full max-w-md">
          <span class="i-heroicons-magnifying-glass absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题、路径或模板"
            class="w-full rounded-2xl border border-border bg-background/80 py-3 pl-12 pr-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
        </div>
      </div>
    </section>

    <section v-if="loading" class="rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-sm">
      <div class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-18 rounded-2xl bg-surface-2 animate-pulse" />
      </div>
    </section>

    <section
      v-else-if="filteredPages.length === 0"
      class="rounded-[28px] border border-dashed border-border/80 bg-surface/70 px-6 py-16 text-center shadow-sm"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-primary">
        <span class="i-heroicons-document-duplicate h-8 w-8" />
      </div>
      <h3 class="mt-4 text-lg font-black text-text">没有符合条件的页面</h3>
      <p class="mt-2 text-sm text-muted">可以直接创建新页面，或者调整筛选条件继续查找。</p>
      <button
        class="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
        @click="router.push('/admin/pages/new')"
      >
        <span class="i-heroicons-plus h-4 w-4" />
        新建页面
      </button>
    </section>

    <section v-else class="rounded-[28px] border border-border/70 bg-surface/82 shadow-sm">
      <div class="hidden grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_120px_140px_160px_220px] gap-4 border-b border-border/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted lg:grid">
        <span>页面</span>
        <span>路径</span>
        <span>模板</span>
        <span>状态</span>
        <span>导航</span>
        <span>操作</span>
      </div>

      <div class="divide-y divide-border/60">
        <article
          v-for="page in filteredPages"
          :key="page.id"
          class="px-5 py-4 transition hover:bg-background/35"
        >
          <div class="grid gap-4 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_120px_140px_160px_220px] lg:items-center">
            <div class="min-w-0">
              <button class="text-left" @click="router.push(`/admin/pages/${page.id}`)">
                <h3 class="truncate text-base font-bold text-text transition hover:text-primary">{{ page.title }}</h3>
              </button>
              <p class="mt-1 text-xs text-muted">最近更新：{{ formatDate(page.updatedAt) }}</p>
            </div>

            <div class="min-w-0">
              <p class="truncate rounded-xl bg-background/70 px-3 py-2 font-mono text-xs text-text">
                /{{ page.slug }}
              </p>
            </div>

            <div>
              <span class="inline-flex rounded-xl bg-background/70 px-3 py-2 text-xs font-medium text-muted">
                {{ page.template || '默认模板' }}
              </span>
            </div>

            <div>
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                :class="page.status === 'published'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'"
              >
                {{ page.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </div>

            <div>
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                :class="page.showInNav ? 'bg-primary/10 text-primary' : 'bg-background/80 text-muted'"
              >
                {{ page.showInNav ? '显示在导航' : '不显示' }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                class="inline-flex items-center gap-1 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-medium text-text transition hover:text-primary"
                @click="copyLink(page.slug)"
              >
                <span class="i-heroicons-link h-4 w-4" />
                复制链接
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-medium text-text transition hover:text-primary"
                @click="router.push(`/admin/pages/${page.id}`)"
              >
                <span class="i-heroicons-pencil-square h-4 w-4" />
                编辑
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300"
                @click="deletePage(page.id)"
              >
                <span class="i-heroicons-trash h-4 w-4" />
                删除
              </button>
            </div>
          </div>
        </article>
      </div>

      <div class="flex items-center justify-between border-t border-border/60 px-5 py-4 text-sm text-muted">
        <span>当前共 {{ filteredPages.length }} 个结果</span>
        <span>草稿 {{ draftCount }} 个</span>
      </div>
    </section>
  </div>
</template>
