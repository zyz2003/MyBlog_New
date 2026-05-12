<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})

const api = useAdminApi()

interface PluginItem {
  meta: {
    name: string
    label: string
    type: string
    version: string
    author?: string
    description?: string
    icon?: string
  }
  mountPoints: string[]
  enabled: boolean
  config: Record<string, unknown>
}

const plugins = ref<PluginItem[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedType = ref('')

const pluginTypes = [
  { value: '', label: '全部' },
  { value: 'comment', label: '评论' },
  { value: 'analytics', label: '统计' },
  { value: 'search', label: '搜索' },
  { value: 'social', label: '社交' },
  { value: 'ad', label: '广告' },
  { value: 'feature', label: '功能' },
  { value: 'custom', label: '自定义' },
]

const filteredPlugins = computed(() => {
  return plugins.value.filter((plugin) => {
    const matchesType = selectedType.value === '' || plugin.meta.type === selectedType.value
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = query === '' ||
      plugin.meta.name.toLowerCase().includes(query) ||
      plugin.meta.label.toLowerCase().includes(query) ||
      (plugin.meta.description?.toLowerCase().includes(query) ?? false)
    return matchesType && matchesSearch
  })
})

const typeCounts = computed(() => {
  const counts: Record<string, number> = { all: plugins.value.length }
  for (const plugin of plugins.value) {
    counts[plugin.meta.type] = (counts[plugin.meta.type] || 0) + 1
  }
  return counts
})

async function fetchPlugins() {
  loading.value = true
  try {
    plugins.value = await api.get<PluginItem[]>('/api/plugins')
  }
  catch (e) {
    console.error('Failed to fetch plugins:', e)
  }
  finally {
    loading.value = false
  }
}

async function handleToggle(data: { name: string; enable: boolean }) {
  try {
    if (data.enable) {
      await api.post(`/api/plugins/${data.name}/enable`, { config: {} })
    }
    else {
      await api.post(`/api/plugins/${data.name}/disable`)
    }
    await fetchPlugins()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '切换插件状态失败'
    alert(message)
  }
}

async function handleConfigSave(data: { name: string; config: Record<string, unknown> }) {
  try {
    await api.put(`/api/plugins/${data.name}/config`, { config: data.config })
    await fetchPlugins()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : '保存配置失败'
    alert(message)
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedType.value = ''
}

onMounted(() => {
  fetchPlugins()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <span class="i-heroicons-puzzle-piece w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-text">插件管理</h1>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="mb-6 space-y-3">
      <!-- Search -->
      <div class="relative">
        <span class="i-heroicons-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索插件名称或描述..."
          class="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-text placeholder-muted cursor-text"
        >
      </div>

      <!-- Type filter tabs -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="type in pluginTypes"
          :key="type.value"
          class="px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer"
          :class="selectedType === type.value
            ? 'bg-primary text-white'
            : 'bg-surface-2 text-muted hover:bg-surface hover:text-text'"
          @click="selectedType = type.value"
        >
          {{ type.label }}
          <span v-if="type.value === ''" class="ml-1 opacity-70">({{ typeCounts.all }})</span>
          <span v-else-if="typeCounts[type.value]" class="ml-1 opacity-70">({{ typeCounts[type.value] }})</span>
        </button>
        <button
          v-if="searchQuery || selectedType"
          class="px-3 py-1.5 text-sm text-muted hover:text-text transition-colors cursor-pointer"
          @click="clearFilters"
        >
          清除筛选
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-surface-2 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredPlugins.length === 0" class="text-center py-12 card">
      <span class="i-heroicons-puzzle-piece w-16 h-16 mx-auto text-muted/30 block mb-4" />
      <p class="text-muted">{{ plugins.length === 0 ? '暂无插件' : '没有匹配的插件' }}</p>
    </div>

    <!-- Plugin cards -->
    <div v-else class="space-y-4">
      <AdminPluginsPluginCard
        v-for="plugin in filteredPlugins"
        :key="plugin.meta.name"
        :plugin="plugin"
        @toggle="handleToggle"
        @config-save="handleConfigSave"
      />
    </div>
  </div>
</template>
