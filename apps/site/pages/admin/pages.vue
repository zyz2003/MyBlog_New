<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

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

async function fetchPages() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { pageSize: 100 }
    if (filter.value !== 'all') params.status = filter.value
    const res = await api.get<{ items: PageItem[] }>('/api/pages', params)
    pages.value = res.items
  }
  catch (e) {
    console.error('Failed to fetch pages:', e)
  }
  finally {
    loading.value = false
  }
}

async function deletePage(id: number) {
  if (!confirm('确定删除此页面？')) return
  try {
    await api.del(`/api/pages/${id}`)
    await fetchPages()
  }
  catch (e) {
    console.error('Failed to delete:', e)
  }
}

async function toggleNav(page: PageItem) {
  try {
    await api.put(`/api/pages/${page.id}`, { showInNav: !page.showInNav })
    await fetchPages()
  }
  catch (e) {
    console.error('Failed to update:', e)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

const statusLabels: Record<string, string> = {
  published: '已发布',
  draft: '草稿',
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
}

const templateLabels: Record<string, string> = {
  default: '默认',
  wide: '宽屏',
  full: '全宽',
}

onMounted(() => {
  fetchPages()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">自定义页面</h1>
      <NuxtLink to="/admin/pages/new" class="btn-primary px-4 py-2 flex items-center gap-2">
        <span class="i-heroicons-plus w-4 h-4" />
        新建页面
      </NuxtLink>
    </div>

    <!-- Filter tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex gap-4">
        <button
          v-for="f in ['all', 'published', 'draft'] as const"
          :key="f"
          class="px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="filter === f
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="filter = f; fetchPages()"
        >
          {{ f === 'all' ? '全部' : f === 'published' ? '已发布' : '草稿' }}
        </button>
      </nav>
    </div>

    <!-- Page list -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      <table v-else-if="pages.length > 0" class="w-full">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">标题</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-24">模板</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-24">状态</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-24">导航</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500 w-32">更新时间</th>
            <th class="text-right px-4 py-3 text-sm font-medium text-gray-500 w-32">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="page in pages"
            :key="page.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900">{{ page.title }}</div>
              <div class="text-xs text-gray-400 font-mono">/{{ page.slug }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ templateLabels[page.template] || page.template }}
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusColors[page.status]"
              >
                {{ statusLabels[page.status] }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button
                class="p-1 rounded transition-colors"
                :class="page.showInNav ? 'text-green-600' : 'text-gray-300'"
                @click="toggleNav(page)"
              >
                <span
                  :class="page.showInNav ? 'i-heroicons-check-circle' : 'i-heroicons-circle'"
                  class="w-5 h-5"
                />
              </button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">
              {{ formatDate(page.updatedAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/admin/pages/${page.id}`"
                  class="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                >
                  <span class="i-heroicons-pencil-square w-4 h-4" />
                </NuxtLink>
                <button
                  class="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  @click="deletePage(page.id)"
                >
                  <span class="i-heroicons-trash w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center py-12 text-gray-400">
        <span class="i-heroicons-document-duplicate w-12 h-12 mx-auto block mb-2" />
        <p>暂无页面</p>
        <NuxtLink to="/admin/pages/new" class="text-primary hover:underline mt-2 inline-block">
          创建第一个页面
        </NuxtLink>
      </div>
    </div>
  </div>
</template>