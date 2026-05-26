import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Scroll direction tracking composable.
 *
 * Tracks the user's scroll direction (up/down/none), whether they've scrolled
 * past a configurable threshold, and the scroll progress percentage.
 * Uses requestAnimationFrame with a ticking flag pattern to avoid jank,
 * and a dead zone to prevent flickering near the threshold.
 *
 * Matches AnZhiYu's scroll logic:
 *   - direction = 'down' only when delta > 0 AND past threshold
 *   - direction = 'up' for any upward scroll (including near top)
 *   - Small scrolls (delta < 20px when past 60px) are ignored
 *
 * SSR-safe: initializes direction as 'none' so the navbar starts visible.
 *
 * @param threshold - The scroll distance (in px) past which the navbar
 *   should start reacting. Default 26 matches AnZhiYu's behavior.
 */
export function useScrollDirection(threshold = 26) {
  const scrollY = ref(0)
  const lastScrollY = ref(0)
  const direction = ref<'up' | 'down' | 'none'>('none')
  const ticking = ref(false)

  const isScrolledPastThreshold = computed(() => scrollY.value > threshold)

  const scrollPercent = computed(() => {
    if (typeof document === 'undefined') return 0
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    return docHeight > 0 ? Math.min(100, Math.round((scrollY.value / docHeight) * 100)) : 0
  })

  function updateScroll() {
    scrollY.value = window.scrollY
    const delta = scrollY.value - lastScrollY.value

    // AnZhiYu: ignore small scrolls when past 60px (delta < 20px)
    if (scrollY.value > 60 && Math.abs(delta) < 20 && delta !== 0) {
      ticking.value = false
      return
    }

    // Dead zone: ignore scroll deltas smaller than 5px to prevent flickering
    if (Math.abs(delta) >= 5) {
      if (delta > 0 && scrollY.value > threshold) {
        direction.value = 'down'
      }
      else {
        direction.value = 'up'
      }
    }

    lastScrollY.value = scrollY.value
    ticking.value = false
  }

  function onScroll() {
    if (!ticking.value) {
      requestAnimationFrame(updateScroll)
      ticking.value = true
    }
  }

  onMounted(() => {
    // Initialize scroll position on mount
    scrollY.value = window.scrollY
    lastScrollY.value = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { direction, isScrolledPastThreshold, scrollPercent, scrollY }
}