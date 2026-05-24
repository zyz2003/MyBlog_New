<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const props = withDefaults(defineProps<{
  content: string
  enablePhotoFigcaption?: boolean
  enableH2Divider?: boolean
  articleMathjax?: boolean
  articleKatex?: boolean
  articleHighlightShrink?: string
}>(), {
  enablePhotoFigcaption: false,
  enableH2Divider: false,
})

const emit = defineEmits<{
  (e: 'content-updated'): void
}>()

const { themeConfig, isDark } = useTheme()
const { codeBlock, copySettings, math, mathjax, katex, settings, displayEnhancements } = useSiteSettings()
const { resolveAssetUrl } = useCdnAsset()

const articleRef = ref<HTMLElement | null>(null)
const contentConfig = computed(() => themeConfig.value?.components?.articleContent ?? {})
const enableTableInterlaced = computed(() => {
  const raw = (settings.value.tableInterlaced as Record<string, unknown> | undefined) ?? {}
  return raw.enable !== undefined ? Boolean(raw.enable) : Boolean(settings.value.table_interlaced_discoloration)
})

const shouldRenderMathjax = computed(() => props.articleMathjax ?? mathjax.value.enable)
const shouldRenderKatex = computed(() => props.articleKatex ?? katex.value.enable)
const effectiveHighlightShrink = computed(() => props.articleHighlightShrink ?? codeBlock.value.highlightShrink)
const isHighlightShrink = computed(() => {
  const value = effectiveHighlightShrink.value
  if (value === true || value === 'true') {
    return true
  }
  if (value === false || value === 'false' || value === '' || value === null || value === undefined) {
    return false
  }
  // 'none' or other values: treat as false (no shrink toggle)
  return false
})

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_[\]()#+!>]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'section'
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function encodeCodePayload(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64')
  }

  return bytesToBase64(new TextEncoder().encode(value))
}

function decodeCodePayload(value: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(value, 'base64').toString('utf8')
    }

    return new TextDecoder().decode(base64ToBytes(value))
  }
  catch {
    return ''
  }
}

function createMarkdownRenderer() {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  })

  md.options.highlight = (str: string, lang: string): string => {
    const hasLanguage = Boolean(lang && hljs.getLanguage(lang))
    const highlighted = hasLanguage
      ? hljs.highlight(str, { language: lang }).value
      : md.utils.escapeHtml(str)
    const languageLabel = lang || 'TEXT'
    const shrinkMode = effectiveHighlightShrink.value
    const enableCollapse = isHighlightShrink.value && shrinkMode !== 'none'
    const showToggle = shrinkMode !== 'none'
    const showCopy = codeBlock.value.highlightCopy
    const showLanguage = codeBlock.value.highlightLang
    const wrapClass = codeBlock.value.codeWordWrap ? 'is-wrap' : 'is-nowrap'

    return [
      `<div class="code-block-shell ${wrapClass}" data-code-shell="true" data-expanded="${enableCollapse ? 'false' : 'true'}" style="--code-max-height:${codeBlock.value.highlightHeightLimit}px">`,
      '<div class="code-block-toolbar">',
      showLanguage ? `<span class="code-block-language">${md.utils.escapeHtml(languageLabel.toUpperCase())}</span>` : '<span class="code-block-language is-empty"></span>',
      '<div class="code-block-actions">',
      showCopy
        ? `<button type="button" class="code-block-action" data-action="copy" data-code="${encodeCodePayload(str)}">复制</button>`
        : '',
      showToggle && enableCollapse
        ? '<button type="button" class="code-block-action" data-action="toggle">展开</button>'
        : '',
      '</div>',
      '</div>',
      `<pre class="hljs" data-collapsible="${enableCollapse ? 'true' : 'false'}"><code class="language-${md.utils.escapeHtml(lang || 'plaintext')}">${highlighted}</code></pre>`,
      '</div>',
    ].join('')
  }

  const defaultHeadingOpen = md.renderer.rules.heading_open
    || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const inlineToken = tokens[idx + 1]
    if (inlineToken?.type === 'inline') {
      const slugCounts = ((env as { headingSlugCounts?: Map<string, number> }).headingSlugCounts ??= new Map<string, number>())
      const baseId = slugifyHeading(inlineToken.content)
      const duplicateCount = slugCounts.get(baseId) ?? 0
      slugCounts.set(baseId, duplicateCount + 1)
      const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`
      tokens[idx].attrSet('id', id)
    }

    return defaultHeadingOpen(tokens, idx, options, env, self)
  }

  return md
}

const renderedHtml = computed(() => {
  const renderer = createMarkdownRenderer()
  return renderer.render(props.content || '', {
    headingSlugCounts: new Map<string, number>(),
  })
})

const articleStyle = computed(() => ({
  maxWidth: '100%',
  lineHeight: contentConfig.value.lineHeight || '1.75',
  width: '100%',
}))

async function loadScript(src: string) {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
  if (existing) {
    if (existing.dataset.loaded === 'true') {
      return
    }

    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true })
    document.head.appendChild(script)
  })
}

function ensureStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

async function renderMath() {
  if (!articleRef.value || !import.meta.client) {
    return
  }

  if (math.value.provider === 'mathjax' && shouldRenderMathjax.value) {
    const win = window as typeof window & {
      MathJax?: {
        startup?: { promise?: Promise<void> }
        typesetPromise?: (elements?: HTMLElement[]) => Promise<void>
      }
    }

    if (!win.MathJax) {
      ;(window as typeof window & { MathJax?: unknown }).MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
        },
        svg: {
          fontCache: 'global',
        },
      }
      await loadScript(resolveAssetUrl('mathjax', 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'))
    }

    if (win.MathJax?.startup?.promise) {
      await win.MathJax.startup.promise
    }

    if (win.MathJax?.typesetPromise) {
      await win.MathJax.typesetPromise([articleRef.value])
    }

    emit('content-updated')
    return
  }

  if (math.value.provider === 'katex' && shouldRenderKatex.value) {
    const win = window as typeof window & {
      renderMathInElement?: (element: HTMLElement, options?: Record<string, unknown>) => void
    }

    ensureStylesheet(resolveAssetUrl('katex_css', 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css'))
    await loadScript(resolveAssetUrl('katex', 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js'))
    await loadScript(resolveAssetUrl('katex_copytex', 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js'))

    if (win.renderMathInElement) {
      win.renderMathInElement(articleRef.value, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      })
    }

    emit('content-updated')
  }
}

async function renderMermaid() {
  if (!articleRef.value || !import.meta.client || !displayEnhancements.value.mermaid.enable) {
    return
  }

  const blocks = articleRef.value.querySelectorAll('pre code.language-mermaid')
  if (!blocks.length) {
    return
  }

  const win = window as typeof window & {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void
      run: (options: { nodes: Element[] }) => Promise<void>
    }
  }

  await loadScript(resolveAssetUrl('mermaid', 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'))

  blocks.forEach((block, index) => {
    const pre = block.closest('pre')
    if (!pre || pre.previousElementSibling?.classList.contains('mermaid')) {
      return
    }

    const container = document.createElement('div')
    container.className = 'mermaid'
    container.id = `mermaid-${index}-${Date.now()}`
    container.textContent = block.textContent || ''
    pre.replaceWith(container)
  })

  win.mermaid?.initialize({
    startOnLoad: false,
    theme: isDark.value
      ? displayEnhancements.value.mermaid.theme.dark
      : displayEnhancements.value.mermaid.theme.light,
    securityLevel: 'loose',
  })

  const nodes = Array.from(articleRef.value.querySelectorAll('.mermaid'))
  if (nodes.length) {
    await win.mermaid?.run({ nodes })
  }
}

function applyLazyImages() {
  if (!articleRef.value) {
    return
  }

  const images = articleRef.value.querySelectorAll<HTMLImageElement>('img')
  images.forEach((image) => {
    image.loading = displayEnhancements.value.lazyload.enable ? 'lazy' : 'eager'
    image.decoding = 'async'

    if (displayEnhancements.value.lazyload.enable) {
      image.classList.add('article-image-lazy')
      if (displayEnhancements.value.lazyload.blur) {
        image.classList.add('article-image-blur')
      }
      if (displayEnhancements.value.lazyload.placeholder && !image.dataset.placeholderApplied) {
        image.dataset.placeholderApplied = 'true'
        image.style.backgroundImage = `url("${displayEnhancements.value.lazyload.placeholder}")`
        image.style.backgroundSize = 'cover'
        image.style.backgroundPosition = 'center'
      }
      image.addEventListener('load', () => {
        image.classList.remove('article-image-blur')
      }, { once: true })
    }
    else {
      image.classList.remove('article-image-lazy', 'article-image-blur')
    }
  })
}

async function applyImageViewer() {
  if (!articleRef.value || !import.meta.client) {
    return
  }

  const images = Array.from(articleRef.value.querySelectorAll<HTMLImageElement>('img'))
    .filter(image => !image.closest('a[data-fancybox]'))

  if (displayEnhancements.value.fancybox) {
    ensureStylesheet(resolveAssetUrl('fancybox_css', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css'))
    await loadScript(resolveAssetUrl('fancybox', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js'))

    images.forEach((image) => {
      if (!image.src) {
        return
      }
      const anchor = document.createElement('a')
      anchor.href = image.src
      anchor.dataset.fancybox = 'article-gallery'
      anchor.dataset.caption = image.alt || ''
      image.parentElement?.insertBefore(anchor, image)
      anchor.appendChild(image)
    })

    const win = window as typeof window & { Fancybox?: { bind: (selector: string, options?: Record<string, unknown>) => void } }
    win.Fancybox?.bind('[data-fancybox="article-gallery"]', {})
    return
  }

  if (displayEnhancements.value.mediumZoom) {
    await loadScript(resolveAssetUrl('medium_zoom', 'https://cdn.jsdelivr.net/npm/medium-zoom@1.1.0/dist/medium-zoom.min.js'))
    const win = window as typeof window & { mediumZoom?: (selector: Element[] | string, options?: Record<string, unknown>) => { detach?: () => void } }
    win.mediumZoom?.(images.filter(image => !image.closest('a')), {
      margin: 24,
      background: 'rgba(15, 23, 42, 0.82)',
    })
  }
}

async function applyPanguSpacing() {
  if (!articleRef.value || !import.meta.client || !displayEnhancements.value.pangu.enable) {
    return
  }

  await loadScript(resolveAssetUrl('pangu', 'https://cdn.jsdelivr.net/npm/pangu@4.0.7/dist/browser/pangu.min.js'))
  const win = window as typeof window & {
    pangu?: { spacingElementByTagName?: (element: HTMLElement) => void, spacingElement?: (element: HTMLElement) => void }
  }

  if (win.pangu?.spacingElement) {
    win.pangu.spacingElement(articleRef.value)
  }
}

function applyNoteClasses() {
  if (!articleRef.value) {
    return
  }

  const blockquotes = articleRef.value.querySelectorAll('blockquote')
  blockquotes.forEach((blockquote) => {
    blockquote.classList.add('article-note', `article-note-${displayEnhancements.value.note.style}`)
    if (displayEnhancements.value.note.icons) {
      blockquote.classList.add('article-note-with-icon')
    }
    blockquote.style.setProperty('--note-radius', `${displayEnhancements.value.note.borderRadius}px`)
    blockquote.style.setProperty('--note-bg-offset', `${displayEnhancements.value.note.lightBgOffset}%`)
  })
}

function applyPhotoFigcaptions() {
  if (!articleRef.value || !props.enablePhotoFigcaption) {
    return
  }

  const images = articleRef.value.querySelectorAll<HTMLImageElement>('img')
  images.forEach((image) => {
    if (!image.alt?.trim()) {
      return
    }

    const parent = image.parentElement
    if (!parent || parent.tagName.toLowerCase() === 'figure') {
      return
    }

    const figure = document.createElement('figure')
    figure.className = 'article-photo-figure'
    parent.insertBefore(figure, image)
    figure.appendChild(image)

    const figcaption = document.createElement('figcaption')
    figcaption.className = 'article-photo-figcaption'
    figcaption.textContent = image.alt.trim()
    figure.appendChild(figcaption)
  })
}

async function applyContentEnhancements() {
  await nextTick()
  applyPhotoFigcaptions()
  applyLazyImages()
  applyNoteClasses()
  await renderMath()
  await renderMermaid()
  await applyPanguSpacing()
  await applyImageViewer()
}

async function copyCode(button: HTMLButtonElement) {
  const raw = button.dataset.code ? decodeCodePayload(button.dataset.code) : ''
  if (!raw) {
    return
  }

  let textToCopy = raw
  if (copySettings.value.enable && copySettings.value.copyrightEnable && raw.length >= copySettings.value.copyrightLimitCount) {
    textToCopy = `${raw}\n\n来源：${document.title}\n链接：${window.location.href}`
  }

  await navigator.clipboard.writeText(textToCopy)
  const previousText = button.textContent || '复制'
  button.textContent = '已复制'
  window.setTimeout(() => {
    button.textContent = previousText
  }, 1200)
}

function toggleCodeBlock(button: HTMLButtonElement) {
  const shell = button.closest<HTMLElement>('[data-code-shell="true"]')
  if (!shell) {
    return
  }

  const expanded = shell.dataset.expanded === 'true'
  shell.dataset.expanded = expanded ? 'false' : 'true'
  button.textContent = expanded ? '展开' : '收起'
}

function handleArticleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const button = target?.closest<HTMLButtonElement>('[data-action]')
  if (!button) {
    return
  }

  const action = button.dataset.action
  if (action === 'copy') {
    copyCode(button).catch((error) => {
      console.error('[ArticleContent] Failed to copy code:', error)
    })
    return
  }

  if (action === 'toggle') {
    toggleCodeBlock(button)
  }
}

onMounted(() => {
  articleRef.value?.addEventListener('click', handleArticleClick)
  applyContentEnhancements().catch((error) => {
    console.error('[ArticleContent] Failed to enhance content:', error)
  })
})

onUnmounted(() => {
  articleRef.value?.removeEventListener('click', handleArticleClick)
})

watch([renderedHtml, math, mathjax, katex, () => props.enablePhotoFigcaption, displayEnhancements, isDark], async () => {
  try {
    await applyContentEnhancements()
  }
  catch (error) {
    console.error('[ArticleContent] Failed to enhance content:', error)
  }
})
</script>

<template>
  <div
    ref="articleRef"
    class="article-content"
    :class="{ 'article-h2-divider': enableH2Divider, 'table-interlaced': enableTableInterlaced }"
    :style="articleStyle"
    v-html="renderedHtml"
  />
</template>

<style scoped>
.article-content {
  max-width: 100%;
  line-height: var(--article-line-height, 1.75);
  color: var(--color-text, #0F172A);
  font-family: var(--font-body, 'Noto Sans SC', Inter, system-ui, sans-serif);
  font-size: 1rem;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  scroll-margin-top: 7rem;
  color: var(--color-text, #0F172A);
  font-family: var(--font-heading, system-ui);
  font-weight: 600;
  line-height: 1.3;
}

.article-content :deep(h1) { font-size: 2rem; }
.article-content :deep(h2) { font-size: 1.75rem; border-bottom: 1px solid var(--color-border, #E2E8F0); padding-bottom: 0.3em; }
.article-content.article-h2-divider :deep(h2) {
  position: relative;
  margin-top: 2.2rem;
  padding-bottom: 0.8rem;
}

.article-content.article-h2-divider :deep(h2::after) {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 72px;
  height: 3px;
  border-radius: 999px;
  background: var(--anzhiyu-main);
}

.article-content :deep(h3) { font-size: 1.5rem; }
.article-content :deep(h4) { font-size: 1.25rem; }

.article-content :deep(p) {
  margin: 1em 0;
}

.article-content :deep(a) {
  color: var(--color-primary, #3B82F6);
  text-decoration: none;
  transition: color 0.15s ease;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5em 0;
  border-radius: 0.5rem;
  transition: filter 0.3s ease, transform 0.25s ease;
}

.article-content :deep(.article-image-lazy) {
  background-color: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

.article-content :deep(.article-image-blur) {
  filter: blur(10px);
}

.article-content :deep(.article-photo-figure) {
  margin: 1.8rem 0;
}

.article-content :deep(.article-photo-figure img) {
  margin: 0;
}

.article-content :deep(.article-photo-figcaption) {
  margin-top: 0.75rem;
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.9rem;
}

.article-content :deep(code) {
  background: var(--color-surface-2, #F1F5F9);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', Consolas, monospace);
  font-size: 0.875em;
}

.article-content :deep(pre) {
  margin: 0;
  overflow-x: auto;
  border-radius: 0 0 18px 18px;
  background: var(--anzhiyu-code-background, #1E293B);
  padding: 1rem 1.1rem 1.2rem;
}

.article-content :deep(pre code) {
  display: block;
  background: transparent;
  padding: 0;
  color: var(--anzhiyu-code-foreground, #E5E7EB);
  font-size: 0.875em;
}

.article-content :deep(blockquote) {
  margin: 1.5em 0;
  border-left: 4px solid var(--color-primary, #3B82F6);
  padding-left: 1em;
  color: var(--color-text-muted, #64748B);
  font-style: italic;
}

.article-content :deep(.article-note) {
  position: relative;
  border-left-width: 0;
  border-radius: var(--note-radius, 3px);
  padding: 1rem 1rem 1rem 1.1rem;
  font-style: normal;
  background: color-mix(in srgb, var(--anzhiyu-main) calc(10% + var(--note-bg-offset, 0%)), white);
  color: var(--anzhiyu-fontcolor);
}

.article-content :deep(.article-note::before) {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: var(--note-radius, 3px);
  background: var(--anzhiyu-main);
}

.article-content :deep(.article-note-with-icon p:first-child::before) {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.3rem;
  height: 1.3rem;
  margin-right: 0.55rem;
  border-radius: 999px;
  background: var(--anzhiyu-main);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 1em 0;
  padding-left: 1.5em;
}

.article-content :deep(li) {
  margin: 0.5em 0;
}

.article-content :deep(table) {
  width: 100%;
  margin: 1.5em 0;
  border-collapse: collapse;
}

.article-content :deep(th),
.article-content :deep(td) {
  border: 1px solid var(--color-border, #E2E8F0);
  padding: 0.75em;
  text-align: left;
}

.article-content :deep(th) {
  background: var(--color-surface-2, #F1F5F9);
  font-weight: 600;
}

.article-content.table-interlaced :deep(tbody tr:nth-child(even)) {
  background: color-mix(in srgb, var(--anzhiyu-main) 4%, var(--anzhiyu-card-bg));
}

.article-content :deep(hr) {
  margin: 2em 0;
  border: none;
  border-top: 1px solid var(--anzhiyu-hr-color, var(--color-border, #E2E8F0));
}

.article-content :deep(.code-block-shell) {
  margin: 1.5rem 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  background: var(--anzhiyu-code-background, #0f172a);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.14);
}

.article-content :deep(.mermaid) {
  margin: 1.5rem 0;
  overflow-x: auto;
  border-radius: 20px;
  background: color-mix(in srgb, var(--anzhiyu-main) 4%, var(--anzhiyu-card-bg));
  padding: 1rem;
}

.article-content :deep(.code-block-toolbar) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.76);
}

.article-content :deep(.code-block-language) {
  min-height: 1.5rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  color: #bfdbfe;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.article-content :deep(.code-block-language.is-empty) {
  opacity: 0;
}

.article-content :deep(.code-block-actions) {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.article-content :deep(.code-block-action) {
  padding: 0.35rem 0.78rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.article-content :deep(.code-block-action:hover) {
  transform: translateY(-1px);
  background: rgba(59, 130, 246, 0.24);
  color: #fff;
}

.article-content :deep(.code-block-shell[data-expanded='false'] pre[data-collapsible='true']) {
  max-height: var(--code-max-height, 330px);
}

.article-content :deep(.code-block-shell[data-expanded='true'] pre[data-collapsible='true']) {
  max-height: none;
}

.article-content :deep(.code-block-shell.is-wrap pre code) {
  white-space: pre-wrap;
  word-break: break-word;
}

.article-content :deep(.code-block-shell.is-nowrap pre code) {
  white-space: pre;
}

.article-content :deep(.hljs) { color: var(--anzhiyu-code-foreground, #E5E7EB); background: var(--anzhiyu-code-background, #1E293B); }
.article-content :deep(.hljs-keyword) { color: #F472B6; }
.article-content :deep(.hljs-string) { color: #A5F3FC; }
.article-content :deep(.hljs-comment) { color: #9CA3AF; }
.article-content :deep(.hljs-function) { color: #C4B5FD; }
.article-content :deep(.hljs-number) { color: #FCD34D; }
.article-content :deep(.hljs-title) { color: #C4B5FD; }
.article-content :deep(.hljs-built_in) { color: #FDBA74; }
.article-content :deep(.hljs-attr) { color: #93C5FD; }
.article-content :deep(.hljs-params) { color: #E5E7EB; }
.article-content :deep(.hljs-meta) { color: #9CA3AF; }
</style>
