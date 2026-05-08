<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const api = useAdminApi()

interface DraftItem {
  id: number
  title: string
  type: 'article' | 'page'
  status: string
  updatedAt: string | null
}

const loading = ref(true)
const drafts = ref<DraftItem[]>([])
const activeTab = ref<'all' | 'article' | 'page'>('all')

async function fetchDrafts() {
  loading.value = true
  try {
    drafts.value = await api.get<DraftItem[]>('/api/admin/drafts')
  }
  catch (e) {
    console.error('Failed to fetch drafts:', e)
  }
  finally {
    loading.value = false
  }
}

const filteredDrafts = computed(() => {
  if (activeTab.value === 'all') return drafts.value
  return drafts.value.filter(d => d.type === activeTab.value)
})

function handleEdit(item: DraftItem) {
  navigateTo(`/admin/${item.type}s/${item.id}`)
}

async function handleDelete(item: DraftItem) {
  if (!confirm(`确定删除此${item.type === 'article' ? '文章' : '页面'}？`)) return
  try {
    await api.del(`/api/${item.type}s/${item.id}`)
    await fetchDrafts()
  }
  catch (e) {
    console.error('Failed to delete:', e)
  }
}

onMounted(() => {
  fetchDrafts()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">草稿箱</h1>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex gap-4">
        <button
          class="px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'all'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'all'"
        >
          全部
        </button>
        <button
          class="px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'article'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'article'"
        >
          文章草稿
        </button>
        <button
          class="px-3 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'page'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'page'"
        >
          页面草稿
        </button>
      </nav>
    </div>

    <!-- Draft list -->
    <div class="card">
      <AdminDraftsDraftList
        :items="filteredDrafts"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
