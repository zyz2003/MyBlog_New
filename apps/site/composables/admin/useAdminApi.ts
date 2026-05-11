import { useAuthStore } from '~/stores/auth'
import { useAuth } from '~/composables/useAuth'

export function useAdminApi() {
  const store = useAuthStore()

  async function adminFetch<T>(url: string, options: Record<string, unknown> = {}): Promise<T> {
    const token = store.token

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await $fetch<{ code: number; data: T; message?: string }>(url, {
        ...options,
        headers,
      })

      if (response.code === 0) {
        return response.data
      }

      throw new Error(response.message || 'Request failed')
    }
    catch (error: unknown) {
      // Handle 401 — trigger logout
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode
        if (statusCode === 401) {
          const { logout } = useAuth()
          await logout()
        }
      }

      // Re-throw with message
      if (error && typeof error === 'object' && 'data' in error) {
        const errData = (error as { data?: { message?: string } }).data
        throw new Error(errData?.message || 'Request failed')
      }

      throw error
    }
  }

  function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return adminFetch<T>(url, { method: 'GET', params })
  }

  function post<T>(url: string, body?: unknown): Promise<T> {
    return adminFetch<T>(url, { method: 'POST', body })
  }

  function put<T>(url: string, body?: unknown): Promise<T> {
    return adminFetch<T>(url, { method: 'PUT', body })
  }

  function del<T>(url: string): Promise<T> {
    return adminFetch<T>(url, { method: 'DELETE' })
  }

  return { get, post, put, del }
}
