import { ref, computed } from 'vue'
import { useScrollDirection } from './useScrollDirection'

/**
 * Navbar state management composable.
 *
 * Tracks scroll direction to control the nav-visible class on #page-header,
 * matching AnZhiYu's behavior:
 *   - nav-fixed: added when scrolled past threshold (currentTop > 26)
 *   - nav-visible: added when scrolling UP, removed when scrolling DOWN
 *   - When scrolled down: menus slide up (translateY(-60px)) but navbar stays visible
 *   - When scrolled up: menus slide back down (translateY(0))
 *   - Near the top (currentTop <= 5): remove both nav-fixed and nav-visible
 *
 * AnZhiYu NEVER hides the entire navbar — it only slides the menus up/down.
 */

// Module-level state: shared across all useNavbarState() callers
const isNavbarHidden = ref(false)

export function useNavbarState() {
  const { direction, isScrolledPastThreshold } = useScrollDirection(26)

  const isMobileMenuOpen = ref(false)

  // nav-visible: true when scrolling up past threshold
  // AnZhiYu logic: add nav-visible when going up, remove when going down
  // The navbar (site-name, nav-right) stays visible; only menus slide
  const isVisible = computed(() => {
    // Near the top: no nav-visible needed (transparent state)
    if (!isScrolledPastThreshold.value) return false

    // Scrolled past threshold: visible when scrolling up
    return direction.value === 'up'
  })

  // Sync isNavbarHidden — but note: in AnZhiYu, this controls
  // menu sliding, NOT full navbar hiding. We keep the name for
  // backward compat but it means "menus should hide (slide up)"
  watch(isVisible, (visible) => {
    isNavbarHidden.value = !visible
  })

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
  }

  return {
    isVisible,
    isNavbarHidden,
    isMobileMenuOpen,
    isScrolledPastThreshold,
    toggleMobileMenu,
    closeMobileMenu,
  }
}