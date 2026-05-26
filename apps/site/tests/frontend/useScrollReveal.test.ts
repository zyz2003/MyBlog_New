import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

// RED phase: Tests for useScrollReveal composable
// These should FAIL until the composable is implemented

describe('useScrollReveal', () => {
  beforeEach(() => {
    vi.resetModules()
    // Mock IntersectionObserver
    const mockObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    vi.stubGlobal('IntersectionObserver', mockObserver)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should export observe and cleanup functions', async () => {
    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe, cleanup } = useScrollReveal()

    expect(typeof observe).toBe('function')
    expect(typeof cleanup).toBe('function')
  })

  it('should add scroll-reveal-visible class when element intersects', async () => {
    let observerCallback: IntersectionObserverCallback | null = null
    const mockObserve = vi.fn()
    const mockUnobserve = vi.fn()
    const mockDisconnect = vi.fn()

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
      observerCallback = cb
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      }
    }))

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    el.classList.add('scroll-reveal')
    observe(el)

    // Simulate intersection
    expect(observerCallback).not.toBeNull()
    observerCallback!(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(el.classList.contains('scroll-reveal-visible')).toBe(true)
  })

  it('should unobserve element after intersection (auto-disconnect)', async () => {
    let observerCallback: IntersectionObserverCallback | null = null
    const mockUnobserve = vi.fn()

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
      observerCallback = cb
      return {
        observe: vi.fn(),
        unobserve: mockUnobserve,
        disconnect: vi.fn(),
      }
    }))

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    el.classList.add('scroll-reveal')
    observe(el)

    observerCallback!(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(mockUnobserve).toHaveBeenCalledWith(el)
  })

  it('should not add class when element is not intersecting', async () => {
    let observerCallback: IntersectionObserverCallback | null = null

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
      observerCallback = cb
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
    }))

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    el.classList.add('scroll-reveal')
    observe(el)

    observerCallback!(
      [{ isIntersecting: false, target: el } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(el.classList.contains('scroll-reveal-visible')).toBe(false)
  })

  it('should accept custom threshold and rootMargin options', async () => {
    const mockImpl = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    vi.stubGlobal('IntersectionObserver', mockImpl)

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    observe(el, { threshold: 0.5, rootMargin: '0px 0px -100px 0px' })

    expect(mockImpl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px',
      }),
    )
  })

  it('should use default threshold 0.1 and rootMargin "0px 0px -50px 0px"', async () => {
    const mockImpl = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    vi.stubGlobal('IntersectionObserver', mockImpl)

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    observe(el)

    expect(mockImpl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }),
    )
  })

  it('should disconnect all observers on cleanup', async () => {
    const mockDisconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    })))

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe, cleanup } = useScrollReveal()

    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    observe(el1)
    observe(el2)

    cleanup()

    // Should disconnect all observers (2 elements = potentially 2 observers)
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
