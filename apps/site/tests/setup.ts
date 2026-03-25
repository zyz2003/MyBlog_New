// Vitest test setup file
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Make vi available globally
globalThis.vi = vi

// Global test configuration
config.global.stubs = {
  RouterLink: true,
  Suspense: true,
}

// Mock Nuxt composables
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $pinia: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    currentRoute: { value: { path: '/' } },
  }),
  useRoute: () => ({
    path: '/',
    params: {},
    query: {},
  }),
}))

// Mock Pinia
vi.mock('pinia', () => ({
  defineStore: vi.fn(),
  storeToRefs: vi.fn(),
}))
