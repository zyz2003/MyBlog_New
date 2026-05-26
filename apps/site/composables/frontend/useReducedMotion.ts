/**
 * Reduced-motion preference detection composable.
 *
 * Per D-10: Detect prefers-reduced-motion media query.
 * When the user has enabled "reduce motion" in their OS settings,
 * this composable returns a reactive boolean that components can use
 * to disable or shorten animations.
 *
 * SSR-safe: returns ref(false) on the server (no window object).
 * The CSS @media (prefers-reduced-motion: reduce) block in transitions.css
 * handles the visual overrides; this composable provides programmatic access
 * for components that need JS-level control.
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useReducedMotion() {
  const prefersReducedMotion = ref(false)

  let mediaQuery: MediaQueryList | null = null
  let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

  onMounted(() => {
    if (typeof window === 'undefined') return

    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    changeHandler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', changeHandler)
  })

  onUnmounted(() => {
    if (mediaQuery && changeHandler) {
      mediaQuery.removeEventListener('change', changeHandler)
    }
  })

  return { prefersReducedMotion }
}
