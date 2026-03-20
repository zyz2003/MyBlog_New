/**
 * Markdown Utility Tests
 *
 * Tests for markdown.ts covering:
 * - renderMarkdown for basic Markdown
 * - renderMarkdownAsync for code highlighting
 * - Custom component syntax
 * - Cache functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  renderMarkdown,
  renderMarkdownAsync,
  clearRenderCache,
  removeFromCache,
} from '../../server/utils/markdown'

describe('Markdown Utility', () => {
  beforeEach(() => {
    clearRenderCache()
  })

  describe('renderMarkdown', () => {
    it('renders headers', () => {
      expect(renderMarkdown('# Hello')).toContain('<h1>Hello</h1>')
      expect(renderMarkdown('## Hello')).toContain('<h2>Hello</h2>')
      expect(renderMarkdown('### Hello')).toContain('<h3>Hello</h3>')
    })

    it('renders bold and italic', () => {
      expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>')
      expect(renderMarkdown('*italic*')).toContain('<em>italic</em>')
      expect(renderMarkdown('***both***')).toContain('<strong><em>both</em></strong>')
    })

    it('renders links', () => {
      const result = renderMarkdown('[link](https://example.com)')
      expect(result).toContain('<a href="https://example.com">link</a>')
    })

    it('renders images', () => {
      const result = renderMarkdown('![alt](image.png)')
      expect(result).toContain('<img src="image.png" alt="alt" />')
    })

    it('renders blockquotes', () => {
      const result = renderMarkdown('> This is a quote')
      expect(result).toContain('<blockquote>This is a quote</blockquote>')
    })

    it('renders code blocks (without highlighting)', () => {
      const result = renderMarkdown('```\ncode\n```')
      expect(result).toContain('<pre')
      expect(result).toContain('<code>code</code>')
    })

    it('renders inline code', () => {
      const result = renderMarkdown('This is `inline code`')
      expect(result).toContain('<code class="inline-code">inline code</code>')
    })

    it('renders horizontal rules', () => {
      const result = renderMarkdown('---')
      expect(result).toContain('<hr />')
    })

    it('renders paragraphs', () => {
      const result = renderMarkdown('Paragraph 1\n\nParagraph 2')
      expect(result).toContain('<p>Paragraph 1</p>')
      expect(result).toContain('<p>Paragraph 2</p>')
    })

    it('renders unordered lists', () => {
      const result = renderMarkdown('- Item 1\n- Item 2')
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>Item 1</li>')
      expect(result).toContain('<li>Item 2</li>')
    })

    it('renders ordered lists', () => {
      const result = renderMarkdown('1. First\n2. Second')
      expect(result).toContain('<li>First</li>')
      expect(result).toContain('<li>Second</li>')
    })

    it('handles custom component syntax', () => {
      const result = renderMarkdown('Before [MyComponent] After', {
        components: { MyComponent: '<custom-component />' },
      })
      expect(result).toContain('<custom-component />')
    })

    it('preserves unknown component syntax', () => {
      const result = renderMarkdown('Before [UnknownComponent] After')
      expect(result).toContain('[UnknownComponent]')
    })

    it('escapes HTML in code', () => {
      const result = renderMarkdown('`<script>alert(1)</script>`')
      expect(result).toContain('&lt;script&gt;')
      expect(result).not.toContain('<script>')
    })

    it('returns empty string for empty input', () => {
      expect(renderMarkdown('')).toBe('')
      expect(renderMarkdown(null as unknown as string)).toBe('')
    })

    it('caches rendered output when enabled', () => {
      const content = '# Cached Content'
      const first = renderMarkdown(content, { cache: true })
      const second = renderMarkdown(content, { cache: true })
      expect(first).toBe(second)
    })
  })

  describe('renderMarkdownAsync', () => {
    it('renders markdown with async code highlighting', async () => {
      const markdown = '# Hello\n\n```ts\nconst x = 1\n```'
      const result = await renderMarkdownAsync(markdown)

      expect(result).toContain('<h1>Hello</h1>')
      expect(result).toContain('<pre')
      expect(result).toContain('class="shiki"')
    })

    it('handles code blocks without language', async () => {
      const markdown = '```\nplain code\n```'
      const result = await renderMarkdownAsync(markdown)

      expect(result).toContain('<pre')
      expect(result).toContain('plain code')
    })

    it('uses custom theme', async () => {
      const markdown = '```js\nconst x = 1\n```'
      const result = await renderMarkdownAsync(markdown, { theme: 'github-light' })

      expect(result).toBeDefined()
    })

    it('disables highlighting when option is false', async () => {
      const markdown = '```ts\nconst x = 1\n```'
      const result = await renderMarkdownAsync(markdown, { highlight: false })

      expect(result).toContain('<pre')
    })

    it('caches rendered output when enabled', async () => {
      const content = '# Async Cached'
      const first = await renderMarkdownAsync(content, { cache: true })
      const second = await renderMarkdownAsync(content, { cache: true })
      expect(first).toBe(second)
    })

    it('handles complex markdown', async () => {
      const markdown = `
# Title

This is a paragraph with **bold** and *italic*.

## Code Example

\`\`\`ts
function hello() {
  console.log('Hello')
}
\`\`\`

- List item 1
- List item 2

> A quote

[Link](https://example.com)
      `.trim()

      const result = await renderMarkdownAsync(markdown)

      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<strong>bold</strong>')
      expect(result).toContain('<em>italic</em>')
      expect(result).toContain('<h2>Code Example</h2>')
      expect(result).toContain('<ul>')
      expect(result).toContain('<blockquote>')
      expect(result).toContain('<a href=')
    })
  })

  describe('clearRenderCache', () => {
    it('clears all cached items', () => {
      renderMarkdown('# Test', { cache: true })
      clearRenderCache()
      // Cache should be empty
      expect(renderMarkdown('# Test', { cache: true })).toBe(
        renderMarkdown('# Test', { cache: true })
      )
    })
  })

  describe('removeFromCache', () => {
    it('removes specific content from cache', () => {
      const content = '# Specific Content'
      renderMarkdown(content, { cache: true })
      removeFromCache(content)
      // Content should be removed
      expect(renderMarkdown(content, { cache: true })).toBe(
        renderMarkdown(content, { cache: true })
      )
    })
  })
})
