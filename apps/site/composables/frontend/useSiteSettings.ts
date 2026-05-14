/**
 * useSiteSettings — unified frontend settings access
 * Per ARCH-02 / D-05: replaces all manual fetch('/api/settings') calls
 * Uses useState for SSR → client hydration consistency
 */
export function useSiteSettings() {
  const settings = useState<Record<string, unknown>>('site-settings', () => ({}))
  const loading = useState<boolean>('site-settings-loading', () => false)
  const initialized = useState<boolean>('site-settings-init', () => false)

  async function refresh(): Promise<void> {
    if (import.meta.server && initialized.value) return

    loading.value = true
    try {
      const response = await $fetch<{
        code: number
        data: Record<string, Array<{ key: string; value: unknown }>>
      }>('/api/settings')

      if (response.code === 0 && response.data) {
        const flat: Record<string, unknown> = {}
        for (const rows of Object.values(response.data)) {
          for (const row of rows) {
            flat[row.key] = row.value
          }
        }
        settings.value = flat
      }
    } catch (error) {
      console.error('[useSiteSettings] Failed to fetch settings:', error)
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  if (import.meta.client && !initialized.value) {
    refresh()
  }

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    refresh,
  }
}
