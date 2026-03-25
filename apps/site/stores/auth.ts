import { defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { UserObject } from '~/server/services/auth.service'

export interface AuthState {
  token: string | null
  user: UserObject | null
  isLoggedIn: boolean
}

const persistedState = piniaPluginPersistedstate

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    isLoggedIn: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    authToken: (state) => state.token,
    isAuthenticated: (state) => state.isLoggedIn,
  },

  actions: {
    setAuth(token: string, user: UserObject) {
      this.token = token
      this.user = user
      this.isLoggedIn = true
    },

    clearAuth() {
      this.token = null
      this.user = null
      this.isLoggedIn = false
    },

    async logout() {
      if (this.token) {
        try {
          await $fetch('/api/v1/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
        } catch {
          // 忽略登出错误，始终清除本地状态
        } finally {
          this.clearAuth()
        }
      } else {
        this.clearAuth()
      }
    },
  },

  persist: {
    storage: persistedState.localStorage,
    paths: ['token', 'user'],
  },
})
