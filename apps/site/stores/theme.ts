import { defineStore } from 'pinia'

interface ThemeMeta {
  name: string
  version: string
  author?: string
  description?: string
}

interface ThemeInfo {
  meta: ThemeMeta
  config: Record<string, unknown>
  isActive: boolean
}

interface ActiveThemeData {
  theme: { meta: ThemeMeta; config: Record<string, unknown> } | null
  css: string
}

/**
 * Pinia store for client-side theme state
 * Manages theme list, active theme, and CSS Variables
 */
export const useThemeStore = defineStore('theme', () => {
  const themes = ref<ThemeInfo[]>([])
  const activeTheme = ref<ActiveThemeData>({ theme: null, css: '' })
  const loading = ref(false)

  /** Fetch all themes (admin view) */
  async function fetchThemes() {
    loading.value = true
    try {
      const { data } = await useFetch<{ code: number; data: ThemeInfo[] }>('/api/themes')
      if (data.value?.data) {
        themes.value = data.value.data
      }
    }
    finally {
      loading.value = false
    }
  }

  /** Fetch active theme with CSS */
  async function fetchActiveTheme() {
    const { data } = await useFetch<{ code: number; data: ActiveThemeData }>('/api/themes/active')
    if (data.value?.data) {
      activeTheme.value = data.value.data
    }
  }

  /** Activate a theme */
  async function activateTheme(name: string) {
    await $fetch(`/api/themes/${name}/activate`, { method: 'POST' })
    await Promise.all([fetchThemes(), fetchActiveTheme()])
  }

  /** Computed: active theme name */
  const activeThemeName = computed(() => activeTheme.value.theme?.meta.name ?? '')

  return {
    themes: readonly(themes),
    activeTheme: readonly(activeTheme),
    loading: readonly(loading),
    activeThemeName,
    fetchThemes,
    fetchActiveTheme,
    activateTheme,
  }
})
