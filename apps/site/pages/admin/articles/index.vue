<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'
import { useAuthStore } from '~/stores/auth'

const api = useAdminApi()
const authStore = useAuthStore()

const articles = ref<ArticleWithRelations[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(0)
const total = ref(0)
const keyword = ref('')
const statusFilter = ref('')
const pageSize = 10

// Import state
const isImporting = ref(false)
const importResult = ref<{
  successCount: number
  errorCount: number
  results: { filename: string; title: string; status: string; message?: string }[]
} | null>(null)
const showImportResult = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

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

function triggerImport() {
  fileInputRef.value?.click()
}

async function handleImportFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  isImporting.value = true
  showImportResult.value = false

  try {
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    const response = await $fetch<{
      code: number
      data: {
        successCount: number
        errorCount: number
        results: { filename: string; title: string; status: string; message?: string }[]
      }
    }>('/api/articles/import', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    importResult.value = response.data
    showImportResult.value = true
    await fetchArticles()
  }
  catch (e) {
    const err = e as { data?: { message?: string } }
    alert(err?.data?.message || '导入失败')
  }
  finally {
    isImporting.value = false
    input.value = ''
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
        <h1 class="text-2xl font-bold text-text">文章管理</h1>
        <span v-if="total > 0" class="px-2 py-0.5 bg-surface-2 text-muted text-sm rounded-full">
          {{ total }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="btn-secondary flex items-center gap-2"
          :disabled="isImporting"
          @click="triggerImport"
        >
          <span v-if="isImporting" class="w-5 h-5 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
          <span v-else class="i-heroicons-arrow-up-tray w-5 h-5" />
          导入文章
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".md,.markdown"
          multiple
          class="hidden"
          @change="handleImportFiles"
        >
        <NuxtLink to="/admin/articles/new" class="btn-primary flex items-center gap-2">
          <span class="i-heroicons-plus w-5 h-5" />
          新建文章
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4 mb-6">
      <!-- Search -->
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <span class="i-heroicons-magnifying-glass w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索文章..."
            class="w-full pl-10 pr-4 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text placeholder-muted cursor-text"
            @input="onSearchInput"
          >
        </div>
      </div>

      <!-- Status filter -->
      <select
        v-model="statusFilter"
        class="px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-text cursor-pointer"
        @change="onStatusChange"
      >
        <option value="">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
        <option value="scheduled">定时发布</option>
      </select>
    </div>

    <!-- Import Result Modal -->
    <div v-if="showImportResult && importResult" class="mb-6">
      <div class="card border-2 border-primary/30">
        <div class="flex items-center gap-3 mb-4">
          <span class="i-heroicons-check-circle w-6 h-6 text-green-500" />
          <h3 class="text-lg font-semibold text-text">导入完成</h3>
        </div>
        <div class="flex items-center gap-4 mb-4 text-sm">
          <span class="text-green-600">成功: {{ importResult.successCount }}</span>
          <span v-if="importResult.errorCount > 0" class="text-red-500">失败: {{ importResult.errorCount }}</span>
        </div>
        <div v-if="importResult.results?.length > 0" class="space-y-2">
          <div
            v-for="item in importResult.results"
            :key="item.filename"
            class="flex items-center gap-3 text-sm"
          >
            <span v-if="item.status === 'success'" class="i-heroicons-check-circle w-4 h-4 text-green-500" />
            <span v-else class="i-heroicons-x-circle w-4 h-4 text-red-500" />
            <span class="text-text">{{ item.title || item.filename }}</span>
            <span v-if="item.message" class="text-muted">({{ item.message }})</span>
          </div>
        </div>
        <button
          class="btn-secondary mt-4"
          @click="showImportResult = false"
        >
          关闭
        </button>
      </div>
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
