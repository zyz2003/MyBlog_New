<script setup lang="ts">
definePageMeta({
  layout: 'admin',
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
    const message = e instanceof Error ? e.message : 'Failed to toggle plugin'
    alert(message)
  }
}

async function handleConfigSave(data: { name: string; config: Record<string, unknown> }) {
  try {
    await api.put(`/api/plugins/${data.name}/config`, { config: data.config })
    await fetchPlugins()
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to save config'
    alert(message)
  }
}

onMounted(() => {
  fetchPlugins()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Plugins</h1>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="plugins.length === 0" class="text-center py-12 card">
      <span class="i-heroicons-puzzle-piece w-16 h-16 mx-auto text-gray-300 block mb-4" />
      <p class="text-gray-500">No plugins registered</p>
    </div>

    <!-- Plugin cards -->
    <div v-else class="space-y-4">
      <AdminPluginsPluginCard
        v-for="plugin in plugins"
        :key="plugin.meta.name"
        :plugin="plugin"
        @toggle="handleToggle"
        @config-save="handleConfigSave"
      />
    </div>
  </div>
</template>
