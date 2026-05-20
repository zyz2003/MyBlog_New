<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

interface DraftItem {
  id: number
  title: string
  status: string
  updatedAt: string | null
  type: 'article' | 'page'
}

const api = useAdminApi()

const drafts = ref<DraftItem[]>([])
const loading = ref(true)
const filter = ref<'all' | 'article' | 'page'>('all')

const filteredDrafts = computed(() => {
  if (filter.value === 'all') return drafts.value
  return drafts.value.filter(item => item.type === filter.value)
})

const articleCount = computed(() => drafts.value.filter(item => item.type === 'article').length)
const pageCount = computed(() => drafts.value.filter(item => item.type === 'page').length)

async function fetchDrafts() {
  loading.value = true
  try {
    drafts.value = await api.get<DraftItem[]>('/api/admin/drafts')
  }
  finally {
    loading.value = false
  }
}

function handleEdit(item: DraftItem) {
  if (item.type === 'page') {
    navigateTo(`/admin/pages/${item.id}`)
    return
  }

  navigateTo(`/admin/articles/${item.id}`)
}

async function handleDelete(item: DraftItem) {
  if (!confirm(`确定删除这个${item.type === 'page' ? '页面' : '文章'}草稿吗？`)) return

  try {
    if (item.type === 'page') {
      await api.del(`/api/pages/${item.id}`)
    }
    else {
      await api.del(`/api/articles/${item.id}`)
    }
    await fetchDrafts()
  }
  catch (error) {
    alert(error instanceof Error ? error.message : '删除草稿失败')
  }
}

onMounted(fetchDrafts)
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Content Center</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">草稿箱</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        汇总尚未发布的文章和页面草稿，方便快速恢复编辑、检查更新时间并清理废弃内容。
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">草稿总数</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ drafts.length }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">文章草稿</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ articleCount }}</p>
      </article>
      <article class="rounded-[24px] border border-border/70 bg-surface/78 p-5 shadow-sm">
        <p class="text-sm text-muted">页面草稿</p>
        <p class="mt-3 text-3xl font-black tracking-tight text-text">{{ pageCount }}</p>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in [
            { key: 'all', label: '全部草稿' },
            { key: 'article', label: '文章草稿' },
            { key: 'page', label: '页面草稿' },
          ]"
          :key="item.key"
          class="rounded-2xl px-4 py-2 text-sm font-semibold transition"
          :class="filter === item.key ? 'bg-primary text-white' : 'bg-background/80 text-muted hover:text-text'"
          @click="filter = item.key as 'all' | 'article' | 'page'"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-5 shadow-sm">
      <AdminDraftsDraftList
        :items="filteredDrafts"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </section>
  </div>
</template>
