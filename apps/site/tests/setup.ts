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
  const actual = (await importOriginal()) as typeof import('pinia')
  const { reactive } = await import('vue')

  return {
    ...actual,
    defineStore: vi.fn((id, options) => {
      // Return a mock store function that returns the options with actions and getters bound
      return () => {
        const state = typeof options.state === 'function' ? options.state() : options.state
        const actions = options.actions || {}
        const getters = options.getters || {}

        // Create reactive state
        const reactiveState = reactive({ ...state })

        // Bind actions to the store state
        const boundStore: Record<string, unknown> = reactiveState

        // Bind actions
        for (const [key, action] of Object.entries(actions)) {
          boundStore[key] = action.bind(boundStore)
        }

        // Add getters as computed properties
        for (const [key, getter] of Object.entries(getters)) {
          Object.defineProperty(boundStore, key, {
            get: () => getter(boundStore),
            enumerable: true,
            configurable: true,
          })
        }

        return boundStore
      }
    }),
    storeToRefs: vi.fn(),
  }
})
