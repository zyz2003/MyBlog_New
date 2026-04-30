import { usePluginStore } from '~/stores/plugin'

/**
 * Composable for reactive plugin access
 * Wraps the Pinia store with convenience methods and computed refs
 */
export function usePlugin() {
  const store = usePluginStore()

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

  return {
    // Reactive state
    plugins: computed(() => store.plugins),
    enabledPlugins: computed(() => store.enabledPlugins),
    loading: computed(() => store.loading),

    // Query methods
    getPluginsForMountPoint,
    isPluginEnabled,
    getPluginConfig,

    // Actions
    refresh: store.fetchPlugins,
    enable: store.enablePlugin,
    disable: store.disablePlugin,
    updateConfig: store.updateConfig,
  }
}
