import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Scroll direction tracking composable.
 *
 * Tracks the user's scroll direction (up/down/none), whether they've scrolled
 * past a configurable threshold, and the scroll progress percentage.
 * Uses requestAnimationFrame with a ticking flag pattern to avoid jank,
 * and a 5px dead zone to prevent flickering near the threshold.
 *
 * SSR-safe: initializes direction as 'none' so the navbar starts visible,
 * avoiding hydration flash. The scroll listener is only attached in onMounted.
 *
 * @param threshold - The scroll distance (in px) past which the navbar
 *   should start reacting. Default 56 matches AnZhiYu's behavior.
 */
export function useScrollDirection(threshold = 56) {
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