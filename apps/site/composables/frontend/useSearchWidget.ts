import { ref, readonly, onMounted, onUnmounted } from 'vue'

/**
 * Global search-widget overlay state shared across components.
 *
 * Keyboard shortcuts:
 *   Ctrl+K / Cmd+K: open search
 *   /: open search (when not in input/textarea/contenteditable)
 *   Escape: close search
 */
const isOpen = ref(false)
const query = ref('')

export function useSearchWidget() {
  function openSearch(initialQuery = '') {
    query.value = initialQuery
    isOpen.value = true
  }

  function closeSearch() {
    isOpen.value = false
    query.value = ''
  }

  function toggleSearch() {
    if (isOpen.value) {
      closeSearch()
    } else {
      openSearch()
    }
  }

  /**
   * Keyboard shortcut handler for search widget.
   * - Ctrl+K or Cmd+K: opens search
   * - '/' key: opens search (only when active element is not an input/textarea/contenteditable)
   * - Escape: closes search when it is open
   */
  function handleKeydown(event: KeyboardEvent) {
    // Ctrl+K / Cmd+K: open search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      openSearch()
      return
    }

    // Escape: close search when open
    if (event.key === 'Escape' && isOpen.value) {
      event.preventDefault()
      closeSearch()
      return
    }

    // '/' key: open search when not in an editable element
    if (event.key === '/' && !isOpen.value) {
      const active = document.activeElement
      const tag = active?.tagName ?? ''
      const isEditable = active?.isContentEditable ?? false
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)

      if (!isInputField && !isEditable) {
        event.preventDefault()
        openSearch()
        return
      }
    }
  }

  // Register keyboard listener when used in a component with onMounted/onUnmounted
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    isOpen: readonly(isOpen),
    query: readonly(query),
    openSearch,
    closeSearch,
    toggleSearch,
  }
}