import { defineStore } from 'pinia'

interface PluginMeta {
  name: string
  label: string
  type: string
  version: string
  author?: string
  description?: string
  icon?: string
}

interface PluginInfo {
  meta: PluginMeta
  mountPoints: string[]
  enabled: boolean
  config: Record<string, unknown>
}

/**
 * Pinia store for client-side plugin state
 * Manages plugin list, enable/disable operations, and config updates
 */
export const usePluginStore = defineStore('plugin', () => {
  const plugins = ref<PluginInfo[]>([])
  const loading = ref(false)

  /** Fetch all registered plugins (admin view) */
  async function fetchPlugins() {
    loading.value = true
    try {
      const { data } = await useFetch<{ code: number; data: PluginInfo[] }>('/api/plugins')
      if (data.value?.data) {
        plugins.value = data.value.data
      }
    }
    finally {
      loading.value = false
    }
  }

  /** Enable a plugin with configuration */
  async function enablePlugin(name: string, config: Record<string, unknown> = {}) {
    await $fetch(`/api/plugins/${name}/enable`, {
      method: 'POST',
      body: { config },
    })
    await fetchPlugins()
  }

  /** Disable a plugin */
  async function disablePlugin(name: string) {
    await $fetch(`/api/plugins/${name}/disable`, {
      method: 'POST',
    })
    await fetchPlugins()
  }

  /** Update plugin configuration */
  async function updateConfig(name: string, config: Record<string, unknown>) {
    await $fetch(`/api/plugins/${name}/config`, {
      method: 'PUT',
      body: { config },
    })
    await fetchPlugins()
  }

  /** Computed: only enabled plugins */
  const enabledPlugins = computed(() => plugins.value.filter((p) => p.enabled))

  return {
    plugins: readonly(plugins),
    loading: readonly(loading),
    enabledPlugins,
    fetchPlugins,
    enablePlugin,
    disablePlugin,
    updateConfig,
  }
})
