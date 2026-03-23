import { useAuthStore } from '~/stores/auth'

export function createApiFetch() {
  const authStore = useAuthStore()

  const getAuthHeaders = () => ({
    headers: {
      Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
      'Content-Type': 'application/json',
    },
  })

  const fetchApi = async <T>(
    url: string,
    options?: RequestInit
  ): Promise<T | null> => {
    try {
      const response = await $fetch<T>(url, {
        ...options,
        ...getAuthHeaders(),
      })
      return response
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  return {
    fetchApi,
    getAuthHeaders,
  }
}
