import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const authStore = useAuthStore()
    expect(authStore.token).toBeNull()
    expect(authStore.user).toBeNull()
    expect(authStore.isLoggedIn).toBe(false)
  })

  it('sets auth state with setAuth action', () => {
    const authStore = useAuthStore()
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
    }
    const mockToken = 'test-jwt-token'

    authStore.setAuth(mockToken, mockUser)

    expect(authStore.token).toBe(mockToken)
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.isLoggedIn).toBe(true)
  })

  it('clears auth state with logout action', () => {
    const authStore = useAuthStore()
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
    }

    // Set auth state
    authStore.setAuth('test-token', mockUser)
    expect(authStore.isLoggedIn).toBe(true)

    // Clear auth state
    authStore.clearAuth()

    expect(authStore.token).toBeNull()
    expect(authStore.user).toBeNull()
    expect(authStore.isLoggedIn).toBe(false)
  })
})
