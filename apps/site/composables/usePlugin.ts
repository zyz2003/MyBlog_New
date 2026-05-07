import { usePluginStore } from '~/stores/plugin'
import { usePublicApi } from '~/composables/usePublicApi'

/**
 * Composable for reactive plugin access
 * Wraps the Pinia store with convenience methods and computed refs
 */
export function usePlugin() {
  const store = usePluginStore()
  const publicApi = usePublicApi()

  // Fetch plugins on first use (client-side only)
  if (import.meta.client && store.plugins.length === 0) {
    store.fetchPlugins()
  }

  /** Get enabled plugins for a specific mount point */
  function getPluginsForMountPoint(mountPoint: string) {
    return computed(() =>
      store.enabledPlugins.filter((p) => p.mountPoints.includes(mountPoint)),
    )
  }

  /** Check if a specific plugin is enabled */
  function isPluginEnabled(name: string) {
    return computed(() => store.enabledPlugins.some((p) => p.meta.name === name))
  }

  /** Get plugin config by name */
  function getPluginConfig(name: string) {
    return computed(() => store.plugins.find((p) => p.meta.name === name)?.config ?? {})
  }

  /** Check if a path is registered by an enabled plugin */
  async function isPluginPath(path: string): Promise<{ registered: boolean; pluginName: string | null }> {
    try {
      const response = await publicApi.get<{ registered: boolean; pluginName: string | null }>(
        `/api/pages/check-plugin?path=${encodeURIComponent(path)}`,
      )
      return response
    }
    catch {
      return { registered: false, pluginName: null }
    }
  }

  /** Get all plugin-registered page paths */
  async function getPluginPagePaths(): Promise<string[]> {
    try {
      const response = await publicApi.get<{ pages: string[] }>('/api/plugins/page-routes')
      return response.pages || []
    }
    catch {
      return []
    }
  }

  return {
    // Reactive state
    plugins: computed(() => store.plugins),
    enabledPlugins: computed(() => store.enabledPlugins),
    loading: computed(() => store.loading),

    // Query methods
    getPluginsForMountPoint,
    isPluginEnabled,
    getPluginConfig,

    // Page route methods
    isPluginPath,
    getPluginPagePaths,

    // Actions
    refresh: store.fetchPlugins,
    enable: store.enablePlugin,
    disable: store.disablePlugin,
    updateConfig: store.updateConfig,
  }
}
