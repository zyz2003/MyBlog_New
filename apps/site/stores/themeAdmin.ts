import { defineStore } from 'pinia'

export interface Theme {
  id: string
  name: string
  author: string
  version: string
  thumbnail?: string
  description?: string
  isActive: boolean
  hasConfig: boolean
}

export interface ThemeConfig {
  name: string
  description?: string
  colors: {
    primary: string
    background: string
    foreground: string
    accent?: string
  }
  typography: {
    fontFamily: string
    baseSize: string
  }
  layout: {
    sidebarPosition: 'left' | 'right'
    sidebarWidth: number
  }
}

export interface ThemeAdminState {
  themes: Theme[]
  loading: boolean
  previewTheme: Theme | null
  configTheme: Theme | null
  previewOpen: boolean
  configOpen: boolean
  currentConfig: ThemeConfig | null
}

export const useThemeAdminStore = defineStore('themeAdmin', {
  state: (): ThemeAdminState => ({
    themes: [],
    loading: false,
    previewTheme: null,
    configTheme: null,
    previewOpen: false,
    configOpen: false,
    currentConfig: null,
  }),

  getters: {
    activeTheme: (state) => state.themes.find(t => t.isActive),
    activeThemeCount: (state) => state.themes.filter(t => t.isActive).length,
  },

  actions: {
    async fetchThemes() {
      this.loading = true
      try {
        const data = await $fetch<Theme[]>('/api/v1/themes')
        this.themes = data
      } catch (error) {
        console.error('Failed to fetch themes:', error)
      } finally {
        this.loading = false
      }
    },

    async activateTheme(themeId: string) {
      try {
        await $fetch(`/api/v1/themes/${themeId}/activate`, { method: 'PUT' })
        await this.fetchThemes()
        return { success: true }
      } catch (error) {
        console.error('Failed to activate theme:', error)
        return { success: false, error }
      }
    },

    async fetchThemeConfig(themeId: string) {
      try {
        const config = await $fetch<ThemeConfig>(`/${themeId}/config`)
        this.currentConfig = config
        return { success: true, config }
      } catch (error) {
        console.error('Failed to fetch theme config:', error)
        return { success: false, error }
      }
    },

    async saveThemeConfig(themeId: string, config: ThemeConfig) {
      try {
        await $fetch(`/api/v1/themes/${themeId}/config`, {
          method: 'PUT',
          body: { config },
        })
        return { success: true }
      } catch (error) {
        console.error('Failed to save theme config:', error)
        return { success: false, error }
      }
    },

    openPreview(theme: Theme) {
      this.previewTheme = theme
      this.previewOpen = true
    },

    closePreview() {
      this.previewOpen = false
      this.previewTheme = null
    },

    openConfig(theme: Theme) {
      this.configTheme = theme
      this.configOpen = true
      this.fetchThemeConfig(theme.id)
    },

    closeConfig() {
      this.configOpen = false
      this.configTheme = null
      this.currentConfig = null
    },
  },
})
