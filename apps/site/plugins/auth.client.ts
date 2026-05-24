import { useAuthStore } from '~/stores/admin/auth'

/**
 * Client-side auth initialization plugin
 * Restores auth state from localStorage before any middleware runs
 */
export default defineNuxtPlugin(() => {
  const store = useAuthStore()

  // Skip if already authenticated (e.g. SSR rendered with auth)
  if (store.isAuthenticated) return

  const savedToken = localStorage.getItem('auth_token')
  if (!savedToken) return

  // Restore user info
  const savedUser = localStorage.getItem('auth_user')
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser)
      store.setAuth(savedToken, user)
    }
    catch {
      store.setToken(savedToken)
    }
  }
  else {
    store.setToken(savedToken)
  }
})
