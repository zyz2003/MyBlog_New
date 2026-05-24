import { defineStore } from 'pinia'

export interface AuthUser {
  id: number
  username: string
  email: string
  displayName: string | null
  avatar: string | null
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  function setAuth(newToken: string, newUser: AuthUser) {
    token.value = newToken
    user.value = newUser
  }

  function clearAuth() {
    token.value = null
    user.value = null
  }

  function setToken(newToken: string) {
    token.value = newToken
  }

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    setToken,
  }
})
