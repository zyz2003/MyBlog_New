import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'

// Mock persistedState
vi.mock('pinia-plugin-persistedstate', () => ({
  default: () => (store) => {
    // Mock persistence plugin
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage between tests
    localStorage.clear()
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

  it('persists state to localStorage', () => {
    const authStore = useAuthStore()
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
    }

    authStore.setAuth('test-token', mockUser)

    // Verify state is in localStorage (mocked in real app)
    const stored = localStorage.getItem('auth')
    expect(stored).toBeTruthy()
  })

  it('getter isAuthenticated returns correct value', () => {
    const authStore = useAuthStore()
    expect(authStore.isAuthenticated).toBe(false)

    authStore.setAuth('test-token', {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
    })

    expect(authStore.isAuthenticated).toBe(true)
  })
})
