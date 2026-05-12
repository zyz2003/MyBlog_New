<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
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

async function fetchPages() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { pageSize: 100 }
    if (filter.value !== 'all') params.status = filter.value
    const res = await api.get<{ items: PageItem[] }>('/api/admin/pages', params)
    pages.value = res.items
  } catch (e) {
    console.error('Failed to fetch pages:', e)
  } finally {
    loading.value = false
  }
}

async function deletePage(id: number) {
  if (!confirm('确定删除此页面？')) return
  try {
    await api.del(`/api/pages/${id}`)
    await fetchPages()
  } catch (e) {
    console.error('Failed to delete:', e)
  }
}

async function toggleNav(page: PageItem) {
  try {
    await api.put(`/api/pages/${page.id}`, { showInNav: !page.showInNav })
    await fetchPages()
  } catch (e) {
    console.error('Failed to update:', e)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

function copyLink(slug: string) {
  navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
}

const filteredPages = computed(() => {
  if (!searchQuery.value) return pages.value
  const q = searchQuery.value.toLowerCase()
  return pages.value.filter(p =>
    p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
  )
})

onMounted(() => {
  fetchPages()
})
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
          <img src="/icons/page.svg" class="w-7 h-7" alt="">
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">页面管理</h1>
          <p class="text-sm text-gray-500 mt-0.5">共 {{ pages.length }} 个页面</p>
        </div>
      </div>
      <button
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        @click="router.push('/admin/pages/new')"
      >
        <img src="/icons/add.svg" class="w-5 h-5" alt="">
        新建页面
      </button>
    </div>

    <!-- Filter & Search -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
        <button
          v-for="f in ['all', 'published', 'draft'] as const"
          :key="f"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
          :class="filter === f
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
          @click="filter = f; fetchPages()"
        >
          {{ f === 'all' ? '全部' : f === 'published' ? '已发布' : '草稿' }}
        </button>
      </div>
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索页面..."
          class="w-full max-w-xs px-4 py-2 pl-10 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
        >
        <img src="/icons/search.svg" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" alt="">
      </div>
    </div>

    <!-- Page Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-40 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <div v-else-if="filteredPages.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <img src="/icons/page.svg" class="w-10 h-10 opacity-30" alt="">
      </div>
      <p class="text-gray-500 font-medium">暂无页面</p>
      <button
        class="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm cursor-pointer"
        @click="router.push('/admin/pages/new')"
      >
        创建第一个页面
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="page in filteredPages"
        :key="page.id"
        class="group relative bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        @click="router.push(`/admin/pages/${page.id}`)"
      >
        <!-- Status badges -->
        <div class="absolute top-4 right-4 flex items-center gap-2">
          <span
            class="px-2.5 py-1 text-xs font-medium rounded-full"
            :class="page.status === 'published'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'"
          >
            {{ page.status === 'published' ? '已发布' : '草稿' }}
          </span>
          <span
            v-if="page.showInNav"
            class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
          >
            导航显示
          </span>
        </div>

        <!-- Icon -->
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mb-4">
          <img src="/icons/page.svg" class="w-6 h-6" alt="">
        </div>

        <!-- Content -->
        <h3 class="text-base font-semibold text-gray-900 mb-2 pr-16">{{ page.title }}</h3>
        <div class="flex items-center gap-3 text-sm text-gray-400">
          <span class="flex items-center gap-1">
            <img src="/icons/link.svg" class="w-3.5 h-3.5" alt="">
            {{ page.slug }}
          </span>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <img src="/icons/clock.svg" class="w-3.5 h-3.5" alt="">
          {{ formatDate(page.updatedAt) }}
        </div>

        <!-- Actions -->
        <div class="absolute bottom-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            title="复制链接"
            @click.stop="copyLink(page.slug)"
          >
            <img src="/icons/link.svg" class="w-4 h-4" alt="">
          </button>
          <button
            class="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            @click.stop="router.push(`/admin/pages/${page.id}`)"
          >
            <img src="/icons/edit.svg" class="w-4 h-4" alt="">
          </button>
          <button
            class="p-2 rounded-lg hover:bg-red-50 cursor-pointer"
            @click.stop="deletePage(page.id)"
          >
            <img src="/icons/trash.svg" class="w-4 h-4" alt="">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>