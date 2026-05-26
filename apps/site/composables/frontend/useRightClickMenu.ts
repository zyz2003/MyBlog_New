import type { RightClickMenuConfig } from './site-settings.types'

/**
 * Composable for the AnZhiYu-style right-click context menu.
 *
 * Provides reactive menu state (visible, position, image detection),
 * clipboard and browser action handlers, and global event listeners
 * (click-outside, scroll, Escape) with proper lifecycle cleanup.
 */
export function useRightClickMenu() {
  const { settings } = useSiteSettings()

  // ---------- Reactive state ----------
  const visible = ref(false)
  const position = ref<{ x: number, y: number }>({ x: 0, y: 0 })
  const isImageTarget = ref(false)
  const imageSrc = ref('')

  // ---------- Config from site settings ----------
  const config = computed<RightClickMenuConfig>(() => {
    const raw = (settings.value.rightClickMenu as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      home: raw.home !== undefined ? Boolean(raw.home) : true,
      archives: raw.archives !== undefined ? Boolean(raw.archives) : true,
      tags: raw.tags !== undefined ? Boolean(raw.tags) : true,
      categories: raw.categories !== undefined ? Boolean(raw.categories) : true,
      copyText: raw.copyText !== undefined ? Boolean(raw.copyText) : true,
      copyLink: raw.copyLink !== undefined ? Boolean(raw.copyLink) : true,
      copyImageUrl: raw.copyImageUrl !== undefined ? Boolean(raw.copyImageUrl) : true,
      viewImage: raw.viewImage !== undefined ? Boolean(raw.viewImage) : true,
      newTabImage: raw.newTabImage !== undefined ? Boolean(raw.newTabImage) : true,
      downloadImage: raw.downloadImage !== undefined ? Boolean(raw.downloadImage) : true,
      darkMode: raw.darkMode !== undefined ? Boolean(raw.darkMode) : true,
      backForward: raw.backForward !== undefined ? Boolean(raw.backForward) : true,
      print: raw.print !== undefined ? Boolean(raw.print) : true,
      readingMode: raw.readingMode !== undefined ? Boolean(raw.readingMode) : true,
    }
  })

  // ---------- Snackbar helper ----------
  function emitSnackbar(message: string) {
    window.dispatchEvent(new CustomEvent('site:snackbar', { detail: { message } }))
  }

  // ---------- Menu open/close ----------
  function openMenu(event: MouseEvent) {
    if (!config.value.enable || window.innerWidth < 768) {
      return
    }
    event.preventDefault()

    // Detect if the right-click target is an IMG element
    const target = event.target as HTMLElement
    const imgElement = target.tagName === 'IMG'
      ? target as HTMLImageElement
      : target.querySelector('img') || target.closest('img')

    if (imgElement) {
      isImageTarget.value = true
      imageSrc.value = (imgElement as HTMLImageElement).currentSrc || (imgElement as HTMLImageElement).src
    } else {
      isImageTarget.value = false
      imageSrc.value = ''
    }

    position.value = { x: event.clientX, y: event.clientY }
    visible.value = true
  }

  function closeMenu() {
    visible.value = false
    isImageTarget.value = false
    imageSrc.value = ''
  }

  // ---------- Clipboard operations ----------
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      emitSnackbar('已复制到剪贴板')
    } catch {
      // Clipboard API may fail in non-HTTPS or older browsers
      emitSnackbar('复制失败，请手动复制')
    }
  }

  function handleCopyText() {
    const selection = window.getSelection()?.toString() || ''
    if (selection) {
      copyToClipboard(selection)
    } else {
      emitSnackbar('未选中任何文本')
    }
    closeMenu()
  }

  function handleCopyLink() {
    copyToClipboard(window.location.href)
    closeMenu()
  }

  function handleCopyImageUrl() {
    if (imageSrc.value) {
      copyToClipboard(imageSrc.value)
    }
    closeMenu()
  }

  // ---------- Image operations ----------
  function handleViewImage() {
    if (imageSrc.value) {
      window.open(imageSrc.value, '_blank')
    }
    closeMenu()
  }

  function handleDownloadImage() {
    if (imageSrc.value) {
      const link = document.createElement('a')
      link.href = imageSrc.value
      link.download = imageSrc.value.split('/').pop() || 'image'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    closeMenu()
  }

  // ---------- Browser navigation ----------
  function handleBack() {
    window.history.back()
    closeMenu()
  }

  function handleForward() {
    window.history.forward()
    closeMenu()
  }

  function handlePrint() {
    window.print()
    closeMenu()
  }

  // ---------- Global listeners ----------
  function onDocumentClick() {
    closeMenu()
  }

  function onDocumentScroll() {
    if (visible.value) {
      closeMenu()
    }
  }

  function onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && visible.value) {
      closeMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('contextmenu', openMenu)
    document.addEventListener('click', onDocumentClick)
    window.addEventListener('scroll', onDocumentScroll, { passive: true })
    document.addEventListener('keydown', onDocumentKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('contextmenu', openMenu)
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('scroll', onDocumentScroll)
    document.removeEventListener('keydown', onDocumentKeydown)
  })

  return {
    visible,
    position,
    isImageTarget,
    imageSrc,
    config,
    openMenu,
    closeMenu,
    copyToClipboard,
    handleCopyText,
    handleCopyLink,
    handleCopyImageUrl,
    handleViewImage,
    handleDownloadImage,
    handleBack,
    handleForward,
    handlePrint,
  }
}