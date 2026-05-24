import { useAuthStore } from '~/stores/admin/auth'

/**
 * Unified admin settings fetch/save.
 * Reads are scoped to the requested category when the API supports it.
 */
export function useAdminSettings(category: string) {
  const authStore = useAuthStore()
  const settings = ref<Record<string, unknown>>({})
  const loading = ref(false)
  const initialized = ref(false)

  function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }
    return headers
  }

  async function refresh(): Promise<void> {
    loading.value = true

    try {
      const response = await $fetch<{
        code: number
        data: Record<string, Array<{ key: string, value: unknown }>>
      }>(`/api/settings?category=${encodeURIComponent(category)}`, {
        headers: getHeaders(),
      })

      if (response.code === 0 && response.data) {
        const flat: Record<string, unknown> = {}
        for (const rows of Object.values(response.data)) {
          for (const row of rows) {
            flat[row.key] = row.value
          }
        }
        settings.value = flat
      }
    }
    catch (error: unknown) {
      const err = error as { statusCode?: number }
      if (err?.statusCode === 401) {
        console.error('[useAdminSettings] Unauthorized - token may be expired')
      }
      console.error(`[useAdminSettings] Failed to fetch settings for category "${category}":`, error)
    }
    finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function save(values: Record<string, unknown>): Promise<void> {
    const items = Object.entries(values).map(([key, value]) => ({
      key,
      value,
      category,
    }))

    await $fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: items,
    })

    for (const [key, value] of Object.entries(values)) {
      settings.value[key] = value
    }
  }

  if (!initialized.value) {
    refresh()
  }

  return {
    settings,
    loading: readonly(loading),
    save,
    refresh,
  }
}
