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
  layout: 'admin',
})

const api = useAdminApi()

const items = ref<MediaItem[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(0)
const pageSize = 20

async function fetchMedia() {
  loading.value = true
  try {
    const result = await api.get<{
      items: MediaItem[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>('/api/media', { page: page.value, pageSize })

    items.value = result.items
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

async function handleDelete(id: number) {
  if (!confirm('Are you sure you want to delete this media file?')) return

  try {
    await api.del(`/api/media/${id}`)
    await fetchMedia()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    alert(message)
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchMedia()
}

onMounted(() => {
  fetchMedia()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Media Library</h1>
    </div>

    <!-- Uploader -->
    <div class="mb-6">
      <AdminMediaMediaUploader @uploaded="handleUploaded" />
    </div>

    <!-- Gallery -->
    <div class="card p-4">
      <AdminMediaMediaGallery
        :items="items"
        :loading="loading"
        :page="page"
        :total-pages="totalPages"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
