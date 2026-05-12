<script setup lang="ts">
interface MediaItem {
  id: number
  filename: string
  originalName: string | null
  mimeType: string
  size: number
  url: string
  createdAt: Date
}

definePageMeta({
  layout: 'admin-default',
})

const api = useAdminApi()

const items = ref<MediaItem[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(0)
const total = ref(0)
const pageSize = 18

// Filters
const searchKeyword = ref('')
const typeFilter = ref('')

async function fetchMedia() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: page.value, pageSize }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (typeFilter.value) params.type = typeFilter.value

    const result = await api.get<{
      items: MediaItem[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>('/api/media', params)

    items.value = result.items
    total.value = result.total
    totalPages.value = result.totalPages
  }
  catch (e) {
    console.error('Failed to fetch media:', e)
  }
  finally {
    loading.value = false
  }
}

function handleUploaded() {
  page.value = 1
  fetchMedia()
}

function handleDelete(id: number) {
  api.del(`/api/media/${id}`).then(() => {
    fetchMedia()
  }).catch((e: unknown) => {
    const message = e instanceof Error ? e.message : '删除失败'
    alert(message)
  })
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchMedia()
}

function handleSearch(keyword: string, type: string) {
  searchKeyword.value = keyword
  typeFilter.value = type
  page.value = 1
  fetchMedia()
}

onMounted(() => {
  fetchMedia()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center">
          <span class="i-heroicons-photo w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-text">媒体库</h1>
          <p class="text-sm text-muted">管理您的图片和文档</p>
        </div>
      </div>
    </div>

    <!-- Uploader -->
    <AdminMediaUploader @uploaded="handleUploaded" />

    <!-- Gallery -->
    <div class="card">
      <AdminMediaGallery
        :items="items"
        :loading="loading"
        :page="page"
        :total-pages="totalPages"
        :total="total"
        @delete="handleDelete"
        @page-change="handlePageChange"
        @search="handleSearch"
      />
    </div>
  </div>
</template>
