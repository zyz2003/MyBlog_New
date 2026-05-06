<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'

definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

const articles = ref<ArticleWithRelations[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(0)
const total = ref(0)
const keyword = ref('')
const statusFilter = ref('')
const pageSize = 10

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchArticles() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize,
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }

    const result = await api.get<{
      items: ArticleWithRelations[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>('/api/articles', params)

    articles.value = result.items
    total.value = result.total
    totalPages.value = result.totalPages
  }
  catch (e) {
    console.error('Failed to fetch articles:', e)
  }
  finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    page.value = 1
    fetchArticles()
  }, 300)
}

function onStatusChange() {
  page.value = 1
  fetchArticles()
}

function onPageChange(newPage: number) {
  page.value = newPage
  fetchArticles()
}

function onEdit(id: number) {
  navigateTo(`/admin/articles/${id}`)
}

async function onDelete(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    await api.del(`/api/articles/${id}`)
    // Refresh the list
    await fetchArticles()
  }
  catch (e) {
    console.error('Failed to delete article:', e)
    alert('删除文章失败')
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900">文章管理</h1>
        <span v-if="total > 0" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
          {{ total }}
        </span>
      </div>
      <NuxtLink to="/admin/articles/new" class="btn-primary flex items-center gap-2">
        <span class="i-heroicons-plus w-5 h-5" />
        新建文章
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4 mb-6">
      <!-- Search -->
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <span class="i-heroicons-magnifying-glass w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索文章..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            @input="onSearchInput"
          >
        </div>
      </div>

      <!-- Status filter -->
      <select
        v-model="statusFilter"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        @change="onStatusChange"
      >
        <option value="">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
        <option value="scheduled">定时发布</option>
      </select>
    </div>

    <!-- Article table -->
    <div class="card">
      <AdminArticlesArticleTable
        :articles="articles"
        :loading="loading"
        :current-page="page"
        :total-pages="totalPages"
        @edit="onEdit"
        @delete="onDelete"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>
