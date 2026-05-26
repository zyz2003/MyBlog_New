import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Tests for useReducedMotion composable.
 * The composable reads matchMedia synchronously (not in onMounted),
 * so tests can verify values directly without Vue lifecycle hooks.
 */

describe('useReducedMotion', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a reactive prefersReducedMotion ref with value false', async () => {
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

  it('should return false when matchMedia is not available (SSR simulation)', async () => {
    // On SSR, matchMedia would not exist on window.
    // We simulate by making matchMedia throw/return undefined.
    vi.stubGlobal('matchMedia', undefined)

    const { useReducedMotion } = await import('~/composables/frontend/useReducedMotion')
    const { prefersReducedMotion } = useReducedMotion()

    // When matchMedia is unavailable, composable falls back to false
    expect(prefersReducedMotion.value).toBe(false)
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