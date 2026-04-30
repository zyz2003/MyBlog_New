import { useThemeStore } from '~/stores/theme'

/**
 * Composable for reactive theme access with CSS Variables injection
 * Provides theme data and real-time CSS switching without page refresh
 */
export function useTheme() {
  const store = useThemeStore()

  // Track injected style element for cleanup
  const styleElement = ref<HTMLStyleElement | null>(null)

  /** Apply CSS Variables to document head */
  function applyCSS(css: string) {
    if (import.meta.server) return // Client-only

    // Remove existing injected style
    if (styleElement.value) {
      styleElement.value.remove()
    }

    // Create and inject new style element
    const style = document.createElement('style')
    style.id = 'theme-css-variables'
    style.textContent = css
    document.head.appendChild(style)
    styleElement.value = style
  }

  /** Fetch and apply active theme */
  async function loadActiveTheme() {
    await store.fetchActiveTheme()
    if (store.activeTheme.css) {
      applyCSS(store.activeTheme.css)
    }
  }

  // Auto-load on first client-side use
  if (import.meta.client && !store.activeTheme.theme) {
    loadActiveTheme()
  }

  /** Switch theme (admin action) */
  async function switchTheme(name: string) {
    await store.activateTheme(name)
    // CSS is automatically updated via fetchActiveTheme in activateTheme
    if (store.activeTheme.css) {
      applyCSS(store.activeTheme.css)
    }
  }

  return {
    // Reactive state
    activeTheme: computed(() => store.activeTheme.theme),
    activeThemeName: computed(() => store.activeThemeName),
    activeCSS: computed(() => store.activeTheme.css),
    themes: computed(() => store.themes),
    loading: computed(() => store.loading),

    // Actions
    switchTheme,
    loadActiveTheme,
    applyCSS,

    // Admin actions
    fetchThemes: store.fetchThemes,
    activateTheme: store.activateTheme,
  }
}
