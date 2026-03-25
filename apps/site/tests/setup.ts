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

// Mock Pinia - export actual Pinia for store tests, only mock defineStore and storeToRefs
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    defineStore: vi.fn((id, options) => {
      // Return a mock store function that returns the options
      return () => ({
        state: typeof options.state === 'function' ? options.state() : options.state,
        getters: options.getters,
        actions: options.actions,
      })
    }),
    storeToRefs: vi.fn(),
  }
})
