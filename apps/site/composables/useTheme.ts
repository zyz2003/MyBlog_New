import type { ThemeConfig, ThemeManifest } from '~/server/core/theme/types'
import { CSSVariablesMap } from '~/server/core/theme/types'

/**
 * useTheme — composable for theme lifecycle management
 * Per architecture doc section 4.1.3
 *
 * Handles: active theme state, CSS Variables injection, layout switching
 */
export function useTheme() {
  const activeTheme = useState<string>('activeTheme', () => 'default')
  const themeConfig = useState<ThemeConfig | null>('themeConfig', () => null)
  const loaded = useState<boolean>('themeLoaded', () => false)

  /** Apply CSS Variables to document root */
  function applyThemeStyles(config: ThemeConfig) {
    if (import.meta.server) return
    const vars = CSSVariablesMap(config)
    const root = document.documentElement
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }
  }

  /** Initialize theme on app startup — fetches active theme from API */
  async function initTheme() {
    if (loaded.value) return
    try {
      const data = await $fetch<{ code: number; data: { theme: ThemeManifest | null; css: string } }>('/api/themes/active')
      if (data.code === 0 && data.data?.theme) {
        activeTheme.value = data.data.theme.meta.name
        themeConfig.value = data.data.theme.config
        applyThemeStyles(data.data.theme.config)
      }
    }
    catch {
      console.warn('[useTheme] Failed to load active theme, using default')
    }
    loaded.value = true
  }

  /** Switch to a different theme (admin action) */
  async function switchTheme(themeName: string) {
    try {
      await $fetch(`/api/themes/${themeName}/activate`, { method: 'POST' })
      const data = await $fetch<{ code: number; data: { theme: ThemeManifest | null; css: string } }>('/api/themes/active')
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
    initTheme,
    switchTheme,
    applyThemeStyles,
  }
}
