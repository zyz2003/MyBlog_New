import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Tests for useScrollReveal composable.
 * Uses class-based IntersectionObserver mock so `new IntersectionObserver()` works.
 */

class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
  }
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
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
    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    el.classList.add('scroll-reveal')
    observe(el)

    // Get the observer instance that was created
    const observer = (IntersectionObserver as unknown as typeof MockIntersectionObserver)
    // The mock class stores instances; we need to trigger the callback
    // Since MockIntersectionObserver stores callback, we need to access the instance
    // Use a different approach: create a fresh mock that captures the callback

    // Re-do with a capturing mock
    vi.restoreAllMocks()
    vi.resetModules()

    let capturedCallback: IntersectionObserverCallback | null = null

    class CapturingObserver {
      cb: IntersectionObserverCallback
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(cb: IntersectionObserverCallback) {
        capturedCallback = cb
        this.cb = cb
      }
    }

    vi.stubGlobal('IntersectionObserver', CapturingObserver)

    const { useScrollReveal: useScrollReveal2 } = await import('~/composables/frontend/useScrollReveal')
    const { observe: observe2 } = useScrollReveal2()

    const el2 = document.createElement('div')
    el2.classList.add('scroll-reveal')
    observe2(el2)

    expect(capturedCallback).not.toBeNull()
    capturedCallback!(
      [{ isIntersecting: true, target: el2 } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(el2.classList.contains('scroll-reveal-visible')).toBe(true)
  })

  it('should unobserve element after intersection (auto-disconnect)', async () => {
    let mockUnobserve: ReturnType<typeof vi.fn> = vi.fn()

    class CapturingObserver {
      observe = vi.fn()
      unobserve = mockUnobserve
      disconnect = vi.fn()
      constructor(_cb: IntersectionObserverCallback) {}
    }

    vi.stubGlobal('IntersectionObserver', CapturingObserver)
    vi.resetModules()

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    el.classList.add('scroll-reveal')
    observe(el)

    // Simulate intersection through the observer
    const observerInstance = new CapturingObserver(() => {})
    // We need to directly trigger the behavior by calling the observer callback
    // Let's re-approach: the observe function creates an IntersectionObserver internally
    // and we need to access its callback

    // Actually, let's verify the behavior differently: call observe, then verify
    // that when IntersectionObserver fires with isIntersecting=true, unobserve is called
    mockUnobserve = vi.fn()

    let capturedCb: IntersectionObserverCallback | null = null
    class ObserverWithUnobserve {
      observe = vi.fn()
      unobserve = mockUnobserve
      disconnect = vi.fn()
      constructor(cb: IntersectionObserverCallback) {
        capturedCb = cb
      }
    }

    vi.stubGlobal('IntersectionObserver', ObserverWithUnobserve)
    vi.resetModules()

    const { useScrollReveal: useSR2 } = await import('~/composables/frontend/useScrollReveal')
    const { observe: observe2 } = useSR2()

    const el2 = document.createElement('div')
    el2.classList.add('scroll-reveal')
    observe2(el2)

    capturedCb!(
      [{ isIntersecting: true, target: el2 } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(mockUnobserve).toHaveBeenCalledWith(el2)
  })

  it('should not add class when element is not intersecting', async () => {
    let capturedCb: IntersectionObserverCallback | null = null

    class CapturingObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(cb: IntersectionObserverCallback) {
        capturedCb = cb
      }
    }

    vi.stubGlobal('IntersectionObserver', CapturingObserver)
    vi.resetModules()

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    el.classList.add('scroll-reveal')
    observe(el)

    capturedCb!(
      [{ isIntersecting: false, target: el } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(el.classList.contains('scroll-reveal-visible')).toBe(false)
  })

  it('should accept custom threshold and rootMargin options', async () => {
    let capturedOptions: IntersectionObserverInit | null = null

    class CapturingObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(_cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        capturedOptions = options ?? null
      }
    }

    vi.stubGlobal('IntersectionObserver', CapturingObserver)
    vi.resetModules()

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    observe(el, { threshold: 0.5, rootMargin: '0px 0px -100px 0px' })

    expect(capturedOptions).toEqual(
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px',
      }),
    )
  })

  it('should use default threshold 0.1 and rootMargin "0px 0px -50px 0px"', async () => {
    let capturedOptions: IntersectionObserverInit | null = null

    class CapturingObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(_cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        capturedOptions = options ?? null
      }
    }

    vi.stubGlobal('IntersectionObserver', CapturingObserver)
    vi.resetModules()

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe } = useScrollReveal()

    const el = document.createElement('div')
    observe(el)

    expect(capturedOptions).toEqual(
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }),
    )
  })

  it('should disconnect all observers on cleanup', async () => {
    const disconnectSpy = vi.fn()

    class ObserverWithDisconnect {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = disconnectSpy
      constructor(_cb: IntersectionObserverCallback) {}
    }

    vi.stubGlobal('IntersectionObserver', ObserverWithDisconnect)
    vi.resetModules()

    const { useScrollReveal } = await import('~/composables/frontend/useScrollReveal')
    const { observe, cleanup } = useScrollReveal()

    observe(document.createElement('div'))
    observe(document.createElement('div'))

    cleanup()

    // Each observe() creates its own observer, so disconnect should be called twice
    expect(disconnectSpy).toHaveBeenCalledTimes(2)
  })
})
