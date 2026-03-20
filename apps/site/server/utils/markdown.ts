/**
 * Markdown Rendering Utility
 *
 * Converts Markdown content to HTML with syntax highlighting.
 * Uses Shiki for VS Code-quality code highlighting.
 * Supports custom component syntax [ComponentName]
 */

import { codeToHtml } from 'shiki'

/**
 * Cache for rendered markdown (optional performance optimization)
 */
const renderCache = new Map<string, string>()

/**
 * Options for markdown rendering
 */
export interface RenderOptions {
  /** Enable syntax highlighting (default: true) */
  highlight?: boolean
  /** Shiki theme (default: 'github-dark') */
  theme?: string
  /** Enable cache (default: false) */
  cache?: boolean
  /** Custom components registry */
  components?: Record<string, string>
}

/**
 * Default code blocks counter for unique IDs
 */
let codeBlockCounter = 0

/**
 * Render Markdown content to HTML
 *
 * @param content - Markdown content
 * @param options - Rendering options
 * @returns HTML string
 *
 * @example
 * renderMarkdown('# Hello\n\n```ts\nconst x = 1\n```')
 * // Returns HTML with highlighted code
 */
export function renderMarkdown(content: string, options: RenderOptions = {}): string {
  const { highlight = true, cache = false, components = {} } = options

  // Check cache
  const cacheKey = `${content}-${JSON.stringify(options)}`
  if (cache && renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey)!
  }

  if (!content) {
    return ''
  }

  // Simple Markdown parsing (can be enhanced with more features)
  let html = content

  // 1. Extract and protect code blocks before other processing
  const codeBlocks: { placeholder: string; html: string }[] = []
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `%%CODE_BLOCK_${codeBlockCounter++}%%`

    if (highlight && lang) {
      // Will be replaced with highlighted version later
      codeBlocks.push({ placeholder, html: '', code, lang, pending: true })
    } else {
      const highlighted = `<pre class="shiki" tabindex="0"><code>${escapeHtml(code.trim())}</code></pre>`
      codeBlocks.push({ placeholder, html: highlighted, code, lang, pending: false })
    }

    return placeholder
  })

  // 2. Process inline code (protect from other transformations)
  const inlineCodes: { placeholder: string; html: string }[] = []
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `%%INLINE_CODE_${inlineCodes.length}%%`
    inlineCodes.push({ placeholder, html: `<code class="inline-code">${escapeHtml(code)}</code>` })
    return placeholder
  })

  // 3. Process custom component syntax [ComponentName]
  html = html.replace(/\[([A-Z][a-zA-Z0-9-]*)\]/g, (match, componentName) => {
    const component = components[componentName]
    if (component) {
      return component
    }
    // Return original syntax if component not found
    return match
  })

  // 4. Headers (must be before other inline elements)
  html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>')
  html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>')
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // 5. Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n')

  // 6. Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 7. Horizontal rule
  html = html.replace(/^---$/gm, '<hr />')

  // 8. Links and Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 9. Unordered lists (simple single-level)
  html = html.replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // 10. Ordered lists (simple single-level)
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')

  // 11. Line breaks (convert remaining newlines to <br /> or <p>)
  // Split by double newlines for paragraphs
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs
    .map((p) => {
      p = p.trim()
      if (!p) return ''
      // Don't wrap if already a block element
      if (
        p.startsWith('<h') ||
        p.startsWith('<ul') ||
        p.startsWith('<ol') ||
        p.startsWith('<li') ||
        p.startsWith('<blockquote') ||
        p.startsWith('<hr') ||
        p.startsWith('<pre') ||
        p.startsWith('%%CODE_BLOCK') ||
        p.startsWith('%%INLINE_CODE')
      ) {
        return p
      }
      // Convert single newlines to <br />
      p = p.replace(/\n/g, '<br />\n')
      return `<p>${p}</p>`
    })
    .join('\n')

  // 12. Restore code blocks with syntax highlighting
  for (const block of codeBlocks) {
    if (block.pending) {
      // Highlight will be added asynchronously, use placeholder for now
      // The caller should use renderMarkdownAsync for proper highlighting
      block.html = `<pre class="shiki" data-lang="${block.lang}"><code>${escapeHtml(block.code.trim())}</code></pre>`
    }
    html = html.replace(block.placeholder, block.html)
  }

  // 13. Restore inline codes
  for (const inline of inlineCodes) {
    html = html.replace(inline.placeholder, inline.html)
  }

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '')

  // Store in cache
  if (cache) {
    renderCache.set(cacheKey, html)
  }

  return html
}

/**
 * Render Markdown to HTML with async syntax highlighting
 * Use this when you need proper code highlighting with Shiki
 *
 * @param content - Markdown content
 * @param options - Rendering options
 * @returns Promise resolving to HTML string
 */
export async function renderMarkdownAsync(
  content: string,
  options: RenderOptions = {}
): Promise<string> {
  const { highlight = true, theme = 'github-dark', cache = false, components = {} } = options

  // Check cache
  const cacheKey = `${content}-${JSON.stringify(options)}`
  if (cache && renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey)!
  }

  if (!content) {
    return ''
  }

  let html = content

  // 1. Extract code blocks and highlight them
  const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g
  const codeBlocks: { match: string; lang: string; code: string }[] = []

  html = html.replace(codeBlockPattern, (match, lang, code) => {
    codeBlocks.push({ match, lang: lang || 'text', code })
    return `%%PENDING_CODE_${codeBlocks.length - 1}%%`
  })

  // Protect inline codes
  const inlineCodes: { placeholder: string; html: string }[] = []
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `%%INLINE_CODE_${inlineCodes.length}%%`
    inlineCodes.push({ placeholder, html: `<code class="inline-code">${escapeHtml(code)}</code>` })
    return placeholder
  })

  // Process custom components
  html = html.replace(/\[([A-Z][a-zA-Z0-9-]*)\]/g, (match, componentName) => {
    const component = components[componentName]
    return component || match
  })

  // Headers
  html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>')
  html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>')
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n')

  // Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />')

  // Links and Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Lists
  html = html.replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')

  // Paragraphs
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs
    .map((p) => {
      p = p.trim()
      if (!p) return ''
      if (
        p.startsWith('<h') ||
        p.startsWith('<ul') ||
        p.startsWith('<ol') ||
        p.startsWith('<li') ||
        p.startsWith('<blockquote') ||
        p.startsWith('<hr') ||
        p.startsWith('<pre') ||
        p.startsWith('%%PENDING_CODE') ||
        p.startsWith('%%INLINE_CODE')
      ) {
        return p
      }
      p = p.replace(/\n/g, '<br />\n')
      return `<p>${p}</p>`
    })
    .join('\n')

  // Highlight code blocks with Shiki
  for (let i = 0; i < codeBlocks.length; i++) {
    const { lang, code } = codeBlocks[i]
    const placeholder = `%%PENDING_CODE_${i}%%`

    if (highlight) {
      try {
        const highlighted = await codeToHtml(code.trim(), {
          lang,
          theme,
        })
        html = html.replace(placeholder, highlighted)
      } catch {
        // Fallback to non-highlighted code
        const fallback = `<pre class="shiki" data-lang="${lang}"><code>${escapeHtml(code.trim())}</code></pre>`
        html = html.replace(placeholder, fallback)
      }
    } else {
      const plain = `<pre class="shiki"><code>${escapeHtml(code.trim())}</code></pre>`
      html = html.replace(placeholder, plain)
    }
  }

  // Restore inline codes
  for (const inline of inlineCodes) {
    html = html.replace(inline.placeholder, inline.html)
  }

  // Clean up
  html = html.replace(/<p>\s*<\/p>/g, '')

  // Cache result
  if (cache) {
    renderCache.set(cacheKey, html)
  }

  return html
}

/**
 * Escape HTML special characters
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => escapeMap[char])
}

/**
 * Clear the render cache
 */
export function clearRenderCache(): void {
  renderCache.clear()
}

/**
 * Remove a specific item from cache
 *
 * @param key - Content key to remove
 */
export function removeFromCache(content: string): void {
  const keys = Array.from(renderCache.keys())
  for (const key of keys) {
    if (key.startsWith(content.substring(0, 50))) {
      renderCache.delete(key)
    }
  }
}
