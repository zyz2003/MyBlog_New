import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// RED phase: Tests for useReducedMotion composable
// These should FAIL until the composable is implemented

describe('useReducedMotion', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a reactive prefersReducedMotion ref', async () => {
    // Mock matchMedia to return no-preference
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { useReducedMotion } = await import('~/composables/frontend/useReducedMotion')
    const { prefersReducedMotion } = useReducedMotion()

    expect(prefersReducedMotion.value).toBe(false)
  })

  it('should return true when user prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { useReducedMotion } = await import('~/composables/frontend/useReducedMotion')
    const { prefersReducedMotion } = useReducedMotion()

    expect(prefersReducedMotion.value).toBe(true)
  })

  it('should listen for changes to the media query', async () => {
    const addEventListenerSpy = vi.fn()
    const removeEventListenerSpy = vi.fn()

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    }))

    const { useReducedMotion } = await import('~/composables/frontend/useReducedMotion')
    useReducedMotion()

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should return false on SSR (no window)', async () => {
    const originalWindow = globalThis.window
    // @ts-expect-error - intentionally removing window for SSR test
    delete globalThis.window

    const { useReducedMotion } = await import('~/composables/frontend/useReducedMotion')
    const { prefersReducedMotion } = useReducedMotion()

    expect(prefersReducedMotion.value).toBe(false)

    // Restore
    globalThis.window = originalWindow
  })

  it('should query the correct media query string', async () => {
    const matchMediaSpy = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('matchMedia', matchMediaSpy)

    const { useReducedMotion } = await import('~/composables/frontend/useReducedMotion')
    useReducedMotion()

    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})
