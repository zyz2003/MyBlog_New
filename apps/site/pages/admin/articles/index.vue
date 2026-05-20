<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

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

const isImporting = ref(false)
const importResult = ref<{
  successCount: number
  errorCount: number
  results: { filename: string, title: string, status: string, message?: string }[]
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
  catch (error) {
    console.error('Failed to fetch articles:', error)
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
    await fetchArticles()
  }
  catch (error) {
    console.error('Failed to delete article:', error)
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
        results: { filename: string, title: string, status: string, message?: string }[]
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
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(71,165,255,0.09),rgba(255,255,255,0.7))] p-6 shadow-sm dark:bg-[linear-gradient(135deg,rgba(71,165,255,0.12),rgba(11,18,29,0.72))]">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content Center</p>
          <div class="mt-3 flex items-center gap-3">
            <h3 class="text-3xl font-black tracking-tight text-text">文章管理</h3>
            <span v-if="total > 0" class="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{{ total }}</span>
          </div>
          <p class="mt-3 text-sm leading-7 text-muted">
            这里是内容工作流的主入口，负责文章创建、导入、筛选、编辑和发布状态管理。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-surface/85 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary/20 hover:text-primary disabled:opacity-60"
            :disabled="isImporting"
            @click="triggerImport"
          >
            <span v-if="isImporting" class="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <span v-else class="i-heroicons-arrow-up-tray h-5 w-5" />
            导入 Markdown
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".md,.markdown"
            multiple
            class="hidden"
            @change="handleImportFiles"
          >
          <NuxtLink to="/admin/articles/new" class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-primary/90">
            <span class="i-heroicons-plus h-5 w-5" />
            新建文章
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1fr_auto]">
      <div class="rounded-[24px] border border-border/70 bg-surface/78 p-4 shadow-sm">
        <div class="relative max-w-md">
          <span class="i-heroicons-magnifying-glass absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索文章标题、关键词或内容…"
            class="w-full rounded-2xl border border-border bg-background/75 py-3 pl-12 pr-4 text-sm text-text outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="onSearchInput"
          >
        </div>
      </div>

      <div class="rounded-[24px] border border-border/70 bg-surface/78 p-4 shadow-sm">
        <select
          v-model="statusFilter"
          class="min-w-[13rem] rounded-2xl border border-border bg-background/75 px-4 py-3 text-sm text-text outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          @change="onStatusChange"
        >
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="scheduled">定时发布</option>
        </select>
      </div>
    </section>

    <section v-if="showImportResult && importResult" class="rounded-[24px] border border-primary/25 bg-primary/5 p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="i-heroicons-check-badge h-5 w-5 text-primary" />
            <h4 class="text-lg font-black text-text">导入结果</h4>
          </div>
          <p class="mt-2 text-sm text-muted">
            成功 {{ importResult.successCount }} 项
            <span v-if="importResult.errorCount > 0">，失败 {{ importResult.errorCount }} 项</span>
          </p>
        </div>
        <button class="rounded-xl border border-border bg-surface/80 px-3 py-2 text-sm text-text transition hover:text-primary" @click="showImportResult = false">
          关闭
        </button>
      </div>
      <div v-if="importResult.results?.length > 0" class="mt-4 space-y-2">
        <div
          v-for="item in importResult.results"
          :key="item.filename"
          class="flex items-center gap-3 rounded-2xl bg-surface/75 px-4 py-3 text-sm"
        >
          <span v-if="item.status === 'success'" class="i-heroicons-check-circle h-4 w-4 text-green-500" />
          <span v-else class="i-heroicons-x-circle h-4 w-4 text-red-500" />
          <span class="font-medium text-text">{{ item.title || item.filename }}</span>
          <span v-if="item.message" class="text-muted">{{ item.message }}</span>
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/78 p-4 shadow-sm">
      <AdminArticlesArticleTable
        :articles="articles"
        :loading="loading"
        :current-page="page"
        :total-pages="totalPages"
        @edit="onEdit"
        @delete="onDelete"
        @page-change="onPageChange"
      />
    </section>
  </div>
</template>
