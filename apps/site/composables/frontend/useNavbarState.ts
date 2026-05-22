import { ref, computed } from 'vue'
import { useScrollDirection } from './useScrollDirection'

/**
 * Navbar state management composable.
 *
 * Combines scroll-direction tracking with explicit user toggles to control
 * navbar visibility. The navbar auto-hides on scroll-down and auto-shows
 * on scroll-up (AnZhiYu behavior), but the user can also manually toggle it.
 *
 * Visibility rules (evaluated in order):
 *   1. If the mobile menu is open, the navbar MUST stay visible.
 *   2. If the user explicitly toggled, honor that until they scroll far enough.
 *   3. Auto-show when scrolling up past the threshold.
 *   4. Auto-hide when scrolling down past the threshold.
 *
 * The navbar is always visible when the page is near the top (not scrolled
 * past the threshold), regardless of direction.
 *
 * SSR-safe: all reactive state starts in the "visible" position so the
 * navbar renders on first paint without a hydration flash.
 */
export function useNavbarState() {
  const { direction, isScrolledPastThreshold } = useScrollDirection(56)

  const isMobileMenuOpen = ref(false)

  // Tracks whether the user has manually toggled the navbar.
  // null = no manual override; true = forced visible; false = forced hidden.
  const manualOverride = ref<boolean | null>(null)

  // How many px of scroll it takes to clear a manual override.
  const OVERRIDE_CLEAR_PX = 200
  const overrideScrollStart = ref(0)

  const isVisible = computed(() => {
    // Rule 1: mobile menu open always shows navbar
    if (isMobileMenuOpen.value) return true

    // Near the top: always visible
    if (!isScrolledPastThreshold.value) return true

    // Rule 2: manual override still active
    if (manualOverride.value !== null) {
      return manualOverride.value
    }

    // Rule 3/4: auto behavior based on scroll direction
    return direction.value !== 'down'
  })

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
  }

  function toggleNavbar() {
    if (manualOverride.value === null) {
      // First toggle: override to the opposite of current auto state
      manualOverride.value = !isVisible.value
    }
    else {
      // Already overridden: flip it
      manualOverride.value = !manualOverride.value
    }
    overrideScrollStart.value = window.scrollY

    // Set up a one-shot scroll listener to clear the override
    const clearOverride = () => {
      if (Math.abs(window.scrollY - overrideScrollStart.value) > OVERRIDE_CLEAR_PX) {
        manualOverride.value = null
        window.removeEventListener('scroll', clearOverride)
      }
    }
    window.addEventListener('scroll', clearOverride, { passive: true })
  }

  return {
    isVisible,
    isMobileMenuOpen,
    direction,
    isScrolledPastThreshold,
    toggleMobileMenu,
    closeMobileMenu,
    toggleNavbar,
  }
}