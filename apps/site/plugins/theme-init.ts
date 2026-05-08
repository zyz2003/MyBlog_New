/**
 * Theme initialization plugin
 * Runs before rendering on both server and client to ensure
 * activeTheme state is consistent (prevents SSR hydration mismatch)
 */
export default defineNuxtPlugin(async () => {
  const { activeTheme, themeConfig, loaded } = useTheme()

  if (loaded.value) return

  try {
    const data = await $fetch<{ code: number; data: { theme: { config: Record<string, unknown>; meta?: { name?: string } }; css: string } }>('/api/themes/active')
    if (data.code === 0 && data.data?.theme) {
      activeTheme.value = data.data.theme.meta?.name ?? 'default'
      themeConfig.value = data.data.theme.config as any
    }
  }
  catch {
    // Fallback to default theme
  }

  loaded.value = true
})
