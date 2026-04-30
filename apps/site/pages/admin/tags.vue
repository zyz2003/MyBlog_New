<script setup lang="ts">
definePageMeta({
  layout: 'admin',
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
  }
  catch (e) {
    console.error('Failed to fetch tags:', e)
  }
  finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingTag.value = null
  showForm.value = true
}

function openEditForm(id: number) {
  const tag = tags.value.find(t => t.id === id)
  if (tag) {
    editingTag.value = tag
    showForm.value = true
  }
}

async function handleSubmit(data: { name: string; slug: string; color: string }) {
  try {
    if (editingTag.value) {
      await api.put(`/api/tags/${editingTag.value.id}`, data)
    }
    else {
      await api.post('/api/tags', data)
    }
    showForm.value = false
    editingTag.value = null
    await fetchTags()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Operation failed'
    alert(message)
  }
}

async function handleDelete(id: number) {
  if (!confirm('Are you sure you want to delete this tag?')) return

  try {
    await api.del(`/api/tags/${id}`)
    await fetchTags()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    alert(message)
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900">Tags</h1>
        <span v-if="tags.length > 0" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
          {{ tags.length }}
        </span>
      </div>
      <button
        class="btn-primary flex items-center gap-2"
        @click="openCreateForm"
      >
        <span class="i-heroicons-plus w-5 h-5" />
        New Tag
      </button>
    </div>

    <!-- Tags table -->
    <div class="card">
      <AdminTagsTagTable
        :tags="tags"
        :loading="loading"
        @edit="openEditForm"
        @delete="handleDelete"
      />
    </div>

    <!-- Tag form modal -->
    <AdminTagsTagForm
      v-if="showForm"
      :tag="editingTag"
      @submit="handleSubmit"
      @close="showForm = false"
    />
  </div>
</template>
