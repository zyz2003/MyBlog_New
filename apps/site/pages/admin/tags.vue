<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

interface TagItem {
  id: number
  name: string
  slug: string
  color: string | null
}

const api = useAdminApi()

const tags = ref<TagItem[]>([])
const loading = ref(true)
const searchQuery = ref('')
const showForm = ref(false)
const editingTag = ref<TagItem | null>(null)

const filteredTags = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return tags.value

  return tags.value.filter(tag =>
    tag.name.toLowerCase().includes(query)
    || tag.slug.toLowerCase().includes(query),
  )
})

async function fetchTags() {
  loading.value = true
  try {
    tags.value = await api.get<TagItem[]>('/api/tags')
  }
  finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingTag.value = null
  showForm.value = true
}

function openEditForm(tag: TagItem) {
  editingTag.value = tag
  showForm.value = true
}

async function handleSubmit(data: { name: string, slug?: string, color: string }) {
  try {
    if (editingTag.value) {
      await api.put(`/api/tags/${editingTag.value.id}`, data)
    }
    else {
      await api.post('/api/tags', data)
    }
    showForm.value = false
    await fetchTags()
  }
  catch (error) {
    alert(error instanceof Error ? error.message : '标签保存失败')
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除这个标签吗？')) return

  try {
    await api.del(`/api/tags/${id}`)
    await fetchTags()
  }
  catch (error) {
    alert(error instanceof Error ? error.message : '标签删除失败')
  }
}

onMounted(fetchTags)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(34,184,207,0.1),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content Center</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-text">标签管理</h1>
          <p class="mt-3 text-sm leading-7 text-muted">
            这里负责维护内容标签、颜色和聚合入口。标签恢复后，专题索引和相关文章的组织会更稳定。
          </p>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90"
          @click="openCreateForm"
        >
          <span class="i-heroicons-plus h-5 w-5" />
          新建标签
        </button>
      </div>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="grid gap-4 md:grid-cols-2 lg:min-w-[26rem]">
          <article class="rounded-[20px] border border-border/70 bg-background/75 p-4">
            <p class="text-sm text-muted">标签总数</p>
            <p class="mt-2 text-2xl font-black text-text">{{ tags.length }}</p>
          </article>
          <article class="rounded-[20px] border border-border/70 bg-background/75 p-4">
            <p class="text-sm text-muted">当前筛选结果</p>
            <p class="mt-2 text-2xl font-black text-text">{{ filteredTags.length }}</p>
          </article>
        </div>

        <div class="relative w-full max-w-md">
          <span class="i-heroicons-magnifying-glass absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标签名称或 slug"
            class="w-full rounded-2xl border border-border bg-background/80 py-3 pl-12 pr-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
        </div>
      </div>
    </section>

    <section
      v-if="loading"
      class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm"
    >
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="i in 8" :key="i" class="h-28 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </section>

    <section
      v-else-if="filteredTags.length === 0"
      class="rounded-[28px] border border-dashed border-border/80 bg-surface/70 px-6 py-16 text-center shadow-sm"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-primary">
        <span class="i-heroicons-tag h-8 w-8" />
      </div>
      <h3 class="mt-4 text-lg font-black text-text">没有符合条件的标签</h3>
      <p class="mt-2 text-sm text-muted">可以直接新建标签，或者调整搜索条件继续查找。</p>
    </section>

    <section
      v-else
      class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm"
    >
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="tag in filteredTags"
          :key="tag.id"
          class="group rounded-[24px] border border-border/70 bg-background/72 p-5 transition hover:border-primary/25 hover:shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <button class="min-w-0 flex-1 text-left" @click="openEditForm(tag)">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  :style="{ backgroundColor: `${tag.color || '#4B8DF8'}22` }"
                >
                  <div
                    class="h-4 w-4 rounded-full"
                    :style="{ backgroundColor: tag.color || '#4B8DF8' }"
                  />
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-text transition group-hover:text-primary">{{ tag.name }}</h3>
                  <p class="mt-1 truncate font-mono text-xs text-muted">{{ tag.slug }}</p>
                </div>
              </div>
            </button>

            <button
              class="rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-red-600 transition hover:bg-red-100"
              @click="handleDelete(tag.id)"
            >
              <span class="i-heroicons-trash h-4 w-4" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <AdminTagsTagForm
      v-if="showForm"
      :tag="editingTag"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>
