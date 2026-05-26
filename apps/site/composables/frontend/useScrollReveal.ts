/**
 * Scroll-reveal composable using IntersectionObserver.
 *
 * Per D-02: IntersectionObserver + CSS approach for scroll-triggered animations.
 * When an element enters the viewport, "scroll-reveal-visible" class is added,
 * triggering the CSS transition defined in transitions.css.
 * The observer auto-disconnects for each element after reveal (per T-06-01).
 *
 * Per D-09: GPU acceleration via will-change on the CSS classes.
 * The composable removes will-change after transition ends by listening
 * for the transitionend event and removing the scroll-reveal class.
 *
 * Follows the composable pattern from useScrollDirection.ts:
 * auto-import via Nuxt convention, onUnmounted for cleanup.
 */
import { onUnmounted } from 'vue'

export interface ScrollRevealOptions {
  /** Intersection ratio threshold. Default: 0.1 */
  threshold?: number
  /** Root margin for early/late triggering. Default: "0px 0px -50px 0px" */
  rootMargin?: string
}

export function useScrollReveal() {
  /** Track all active observers for cleanup */
  const observers = new Set<IntersectionObserver>()

  /**
   * Observe an element for scroll-reveal animation.
   * When the element intersects the viewport, adds "scroll-reveal-visible"
   * class and disconnects the observer for that element.
   */
  function observe(element: HTMLElement, options?: ScrollRevealOptions) {
    const threshold = options?.threshold ?? 0.1
    const rootMargin = options?.rootMargin ?? '0px 0px -50px 0px'

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            target.classList.add('scroll-reveal-visible')
            observer.unobserve(target)

            // Per D-09 / T-06-02: Remove will-change after transition ends
            // to avoid GPU memory overhead on idle elements
            const removeWillChange = () => {
              target.classList.remove('scroll-reveal')
              target.removeEventListener('transitionend', removeWillChange)
            }
            target.addEventListener('transitionend', removeWillChange, { once: true })
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)
    observers.add(observer)
  }

  /**
   * Disconnect all active observers.
   * Called automatically on component unmount.
   */
  function cleanup() {
    for (const observer of observers) {
      observer.disconnect()
    }
    observers.clear()
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    cleanup()
  })

  return { observe, cleanup }
}
