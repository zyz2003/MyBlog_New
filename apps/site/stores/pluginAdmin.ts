import { defineStore } from 'pinia'

export interface Plugin {
  id: string
  name: string
  description: string
  author: string
  version: string
  icon?: string
  isEnabled: boolean
  hasConfig: boolean
  category: string
}

export interface PluginConfig {
  [key: string]: any
}

export interface PluginAdminState {
  plugins: Plugin[]
  loading: boolean
  configPlugin: Plugin | null
  configOpen: boolean
  config: PluginConfig | null
}

export const usePluginAdminStore = defineStore('pluginAdmin', {
  state: (): PluginAdminState => ({
    plugins: [],
    loading: false,
    configPlugin: null,
    configOpen: false,
    config: null,
  }),

  getters: {
    enabledPlugins: (state) => state.plugins.filter(p => p.isEnabled),
    disabledPlugins: (state) => state.plugins.filter(p => !p.isEnabled),
  },

  actions: {
    async fetchPlugins() {
      this.loading = true
      try {
        const data = await $fetch<Plugin[]>('/api/v1/plugins')
        this.plugins = data
      } catch (error) {
        console.error('Failed to fetch plugins:', error)
      } finally {
        this.loading = false
      }
    },

    async togglePlugin(pluginId: string, enabled: boolean) {
      try {
        await $fetch(`/api/v1/plugins/${pluginId}/toggle`, {
          method: 'PUT',
          body: { enabled },
        })
        await this.fetchPlugins()
        return { success: true }
      } catch (error) {
        console.error('Failed to toggle plugin:', error)
        return { success: false, error }
      }
    },

    async fetchPluginConfig(pluginId: string) {
      try {
        const config = await $fetch<PluginConfig>(`/api/v1/plugins/${pluginId}/config`)
        this.config = config
        return { success: true, config }
      } catch (error) {
        console.error('Failed to fetch plugin config:', error)
        return { success: false, error }
      }
    },

    async savePluginConfig(pluginId: string, config: PluginConfig) {
      try {
        await $fetch(`/api/v1/plugins/${pluginId}/config`, {
          method: 'PUT',
          body: { config },
        })
        return { success: true }
      } catch (error) {
        console.error('Failed to save plugin config:', error)
        return { success: false, error }
      }
    },

    openConfig(plugin: Plugin) {
      this.configPlugin = plugin
      this.configOpen = true
      this.fetchPluginConfig(plugin.id)
    },

    closeConfig() {
      this.configOpen = false
      this.configPlugin = null
      this.config = null
    },
  },
})
