<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})

const api = useAdminApi()

interface TagItem {
  id: number
  name: string
  slug: string
  color: string | null
  createdAt: Date
}

const tags = ref<TagItem[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingTag = ref<TagItem | null>(null)

async function fetchTags() {
  loading.value = true
  try {
    tags.value = await api.get<TagItem[]>('/api/tags')
  } catch (e) {
    console.error('Failed to fetch tags:', e)
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingTag.value = null
  showForm.value = true
}

function openEditForm(id: number) {
  editingTag.value = tags.value.find(t => t.id === id) || null
  showForm.value = true
}

async function handleSubmit(data: { name: string; slug: string; color: string }) {
  try {
    if (editingTag.value) {
      await api.put(`/api/tags/${editingTag.value.id}`, data)
    } else {
      await api.post('/api/tags', data)
    }
    showForm.value = false
    await fetchTags()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '操作失败')
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除？')) return
  try {
    await api.del(`/api/tags/${id}`)
    await fetchTags()
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '删除失败')
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/icons/tag.svg" class="w-7 h-7" alt="">
        <div>
          <h1 class="text-2xl font-bold text-text">标签管理</h1>
          <p class="text-sm text-muted">{{ tags.length }} 个标签</p>
        </div>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        @click="openCreateForm"
      >
        <img src="/icons/add.svg" class="w-4 h-4" alt="">
        新建
      </button>
    </div>

    <!-- Tags Grid -->
    <div class="bg-surface rounded-2xl border border-border">
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
        <div v-for="i in 8" :key="i" class="h-24 bg-surface-2 rounded-xl animate-pulse" />
      </div>

      <!-- Empty -->
      <div v-else-if="tags.length === 0" class="flex flex-col items-center justify-center py-16">
        <img src="/icons/tag.svg" class="w-12 h-12 text-muted/20 mb-3" alt="">
        <p class="text-muted mb-4">暂无标签</p>
        <button
          class="px-4 py-2 rounded-xl bg-primary text-white text-sm cursor-pointer"
          @click="openCreateForm"
        >
          创建标签
        </button>
      </div>

      <!-- Tags -->
      <div v-else class="p-6">
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-lg transition-all p-4 cursor-pointer group"
            @click="openEditForm(tag.id)"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: (tag.color || '#C4956A') + '20' }"
              >
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: tag.color || '#C4956A' }"
                />
              </div>
              <span class="text-sm font-medium text-text group-hover:text-primary truncate">{{ tag.name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono truncate">{{ tag.slug }}</span>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                <button
                  class="p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer"
                  @click="handleDelete(tag.id)"
                >
                  <img src="/icons/trash.svg" class="w-3.5 h-3.5 text-muted" alt="">
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AdminTagsTagForm
      v-if="showForm"
      :tag="editingTag"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>