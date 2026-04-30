import { useAuthStore, type AuthUser } from '~/stores/auth'

let initialized = false

export function useAuth() {
  const store = useAuthStore()

  /** Login with username/password, stores token in localStorage and Pinia */
  async function login(username: string, password: string) {
    const response = await $fetch<{ code: number; data: { token: string; user: AuthUser } }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: { username, password },
      },
    )

    if (response.code === 0) {
      store.setAuth(response.data.token, response.data.user)
      if (import.meta.client) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
      }
    }
    else {
      throw new Error('Login failed')
    }
  }

  /** Logout: clear token from store and localStorage, redirect to login */
  async function logout() {
    // Best-effort server logout — don't fail if error
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    catch {
      // Ignore logout API errors
    }

    store.clearAuth()
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    await navigateTo('/admin/login')
  }

  /** Refresh token if needed, returns new token or null */
  async function refreshToken(): Promise<string | null> {
    const currentToken = store.token
    if (!currentToken) return null

    try {
      const response = await $fetch<{ code: number; data: { token: string | null } }>(
        '/api/auth/refresh',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      )

      if (response.code === 0 && response.data.token) {
        store.setToken(response.data.token)
        if (import.meta.client) {
          localStorage.setItem('auth_token', response.data.token)
        }
        return response.data.token
      }

      // Token is still valid (no refresh needed)
      return currentToken
    }
    catch {
      // Token invalid or expired — clear auth (don't navigate, let middleware handle)
      store.clearAuth()
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      return null
    }
  }

  /** Initialize auth from localStorage on first client-side call */
  async function initAuth() {
    if (initialized || !import.meta.client) return
    initialized = true

    const savedToken = localStorage.getItem('auth_token')
    if (!savedToken) return

    // Restore user info from localStorage
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as AuthUser
        store.setAuth(savedToken, user)
      }
      catch {
        store.setToken(savedToken)
      }
    }
    else {
      store.setToken(savedToken)
    }

    // Validate token via refresh endpoint
    await refreshToken()
  }

  // Auto-initialize on first use (client-side)
  if (import.meta.client) {
    initAuth()
  }

  return {
    login,
    logout,
    refreshToken,
    isAuthenticated: computed(() => store.isAuthenticated),
    user: computed(() => store.user),
    token: computed(() => store.token),
  }
}
