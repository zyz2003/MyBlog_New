<script setup lang="ts">
import MediaGallery from '~/components/admin/media/MediaGallery.vue'
import MediaUploader from '~/components/admin/media/MediaUploader.vue'

definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

interface MediaItem {
  id: number
  filename: string
  originalName: string | null
  mimeType: string
  size: number
  url: string
  createdAt: string | Date
}

interface MediaListResult {
  items: MediaItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const api = useAdminApi()

const media = ref<MediaItem[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const keyword = ref('')
const type = ref('all')

const imageCount = computed(() => media.value.filter(item => item.mimeType.startsWith('image/')).length)
const documentCount = computed(() => media.value.filter(item => !item.mimeType.startsWith('image/')).length)

async function fetchMedia() {
  loading.value = true
  try {
    const result = await api.get<MediaListResult>('/api/media', {
      page: page.value,
      pageSize: 24,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(type.value !== 'all' ? { type: type.value } : {}),
    })

    media.value = result.items
    total.value = result.total
    totalPages.value = result.totalPages
  }
  finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await api.del(`/api/media/${id}`)
    await fetchMedia()
  }
  catch (error) {
    alert(error instanceof Error ? error.message : '媒体删除失败')
  }
}

function handleSearch(nextKeyword: string, nextType: string) {
  keyword.value = nextKeyword
  type.value = nextType
  page.value = 1
  fetchMedia()
}

function handlePageChange(nextPage: number) {
  page.value = nextPage
  fetchMedia()
}

onMounted(fetchMedia)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(34,184,207,0.1),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content Center</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-text">媒体资源库</h1>
          <p class="mt-3 text-sm leading-7 text-muted">
            这里负责管理图片、封面和上传素材。媒体页恢复后，文章封面、首页轮播和页面素材才能形成稳定工作流。
          </p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">当前页文件数</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ media.length }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">当前页图片</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ imageCount }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">当前页文档 / 其它</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ documentCount }}</p>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <h2 class="text-xl font-black text-text">上传文件</h2>
      <p class="mt-2 text-sm text-muted">支持图片、文档、音视频和压缩文件，上传成功后会自动刷新资源列表。</p>
      <div class="mt-5">
        <MediaUploader @uploaded="fetchMedia" />
      </div>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 shadow-sm">
      <MediaGallery
        :items="media"
        :loading="loading"
        :page="page"
        :total-pages="totalPages"
        :total="total"
        @delete="handleDelete"
        @page-change="handlePageChange"
        @search="handleSearch"
      />
    </section>
  </div>
</template>
