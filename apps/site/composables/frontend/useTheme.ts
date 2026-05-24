import type { ThemeConfig, ThemeManifest } from '~/server/core/theme/types'
import { CSSVariablesMap } from '~/server/core/theme/types'

const themePreferenceStorageKey = 'anzhiyu-theme-mode'

export function useTheme() {
  const activeTheme = useState<string>('activeTheme', () => 'default')
  const themeConfig = useState<ThemeConfig | null>('themeConfig', () => null)
  const loaded = useState<boolean>('themeLoaded', () => false)
  const isDark = useState<boolean>('theme-is-dark', () => false)

  function toggleDark() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
      document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
      window.localStorage.setItem(themePreferenceStorageKey, isDark.value ? 'dark' : 'light')
    }
  }

  function applyThemeStyles(config: ThemeConfig) {
    if (import.meta.server) return
    const vars = CSSVariablesMap(config)
    const root = document.documentElement
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }
  }

  async function initTheme() {
    if (loaded.value) return
    try {
      const data = await $fetch<{ code: number, data: { theme: ThemeManifest | null, css: string } }>('/api/themes/active')
      if (data.code === 0 && data.data?.theme) {
        activeTheme.value = data.data.theme.meta.name
        themeConfig.value = data.data.theme.config
        applyThemeStyles(data.data.theme.config)
      }
    }
    catch {
      console.warn('[useTheme] Failed to load active theme, using default')
    }
    if (import.meta.client) {
      const storedPreference = window.localStorage.getItem(themePreferenceStorageKey)
      if (storedPreference === 'dark' || storedPreference === 'light') {
        isDark.value = storedPreference === 'dark'
        document.documentElement.classList.toggle('dark', isDark.value)
        document.documentElement.dataset.theme = storedPreference
      }
      else {
        isDark.value = document.documentElement.classList.contains('dark')
      }
    }
    loaded.value = true
  }

  async function switchTheme(themeName: string) {
    try {
      await $fetch(`/api/themes/${themeName}/activate`, { method: 'POST' })
      const data = await $fetch<{ code: number, data: { theme: ThemeManifest | null, css: string } }>('/api/themes/active')
      if (data.code === 0 && data.data?.theme) {
        activeTheme.value = themeName
        themeConfig.value = data.data.theme.config
        applyThemeStyles(data.data.theme.config)
      }
    }
    catch (error) {
      console.error('[useTheme] Failed to switch theme:', error)
    }
  }

  return {
    activeTheme,
    themeConfig,
    loaded,
    isDark,
    initTheme,
    switchTheme,
    toggleDark,
    applyThemeStyles,
  }
}
