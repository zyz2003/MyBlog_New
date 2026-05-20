<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const route = useRoute()
const api = useAdminApi()

const pageId = Number(route.params.id)
const loading = ref(true)
const error = ref('')
const page = ref<Record<string, any> | null>(null)

async function fetchPage() {
  loading.value = true
  error.value = ''
  try {
    page.value = await api.get(`/api/pages/${pageId}`)
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '页面加载失败'
  }
  finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('确定删除这个页面吗？该操作无法撤销。')) {
    return
  }

  try {
    await api.del(`/api/pages/${pageId}`)
    await navigateTo('/admin/pages')
  }
  catch (e: unknown) {
    alert(e instanceof Error ? e.message : '删除页面失败')
  }
}

function handleCopyLink() {
  if (!page.value?.slug || !import.meta.client) {
    return
  }
  navigator.clipboard.writeText(`${window.location.origin}/${page.value.slug}`)
}

onMounted(() => {
  fetchPage()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex items-center justify-center py-24">
      <span class="i-heroicons-arrow-path h-10 w-10 animate-spin text-primary" />
    </div>

    <div v-else-if="error" class="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <span class="i-heroicons-exclamation-triangle mx-auto mb-4 block h-12 w-12 text-rose-400" />
      <p class="text-sm font-medium text-rose-600">{{ error }}</p>
      <NuxtLink to="/admin/pages" class="mt-5 inline-flex rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">
        返回页面列表
      </NuxtLink>
    </div>

    <template v-else-if="page">
      <section class="rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">Page Actions</p>
            <h3 class="mt-2 text-2xl font-black tracking-tight text-text">页面管理操作</h3>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary" @click="handleCopyLink">
              复制页面链接
            </button>
            <button class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" @click="handleDelete">
              删除页面
            </button>
          </div>
        </div>
      </section>

      <AdminPagesPageEditor
        mode="edit"
        :page-id="pageId"
        :initial-data="page"
        @saved="navigateTo('/admin/pages')"
      />
    </template>
  </div>
</template>
