<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const { themeConfig } = useTheme()

const contentConfig = computed(() => themeConfig.value?.components?.articleContent ?? {})

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

md.options.highlight = (str: string, lang: string): string => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
    } catch (_) {}
  }
  return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
}

const renderedHtml = computed(() => md.render(props.content || ''))

const articleStyle = computed(() => ({
  maxWidth: '100%',
  lineHeight: contentConfig.value.lineHeight || '1.75',
  width: '100%',
}))
</script>

<template>
  <div class="article-content" :style="articleStyle" v-html="renderedHtml" />
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
  font-family: var(--font-heading, system-ui);
  color: var(--color-text, #0F172A);
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.article-content :deep(h1) { font-size: 2rem; }
.article-content :deep(h2) { font-size: 1.75rem; border-bottom: 1px solid var(--color-border, #E2E8F0); padding-bottom: 0.3em; }
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
  border-radius: 0.5rem;
  margin: 1.5em 0;
}

.article-content :deep(code) {
  font-family: var(--font-mono, 'JetBrains Mono', Consolas, monospace);
  background: var(--color-surface-2, #F1F5F9);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
}

.article-content :deep(pre) {
  background: #1E293B;
  border-radius: 8px;
  padding: 1em;
  overflow-x: auto;
  margin: 1.5em 0;
}

.article-content :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 0.875em;
  color: #E5E7EB;
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary, #3B82F6);
  padding-left: 1em;
  margin: 1.5em 0;
  color: var(--color-text-muted, #64748B);
  font-style: italic;
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
  border-collapse: collapse;
  margin: 1.5em 0;
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

.article-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border, #E2E8F0);
  margin: 2em 0;
}

/* Syntax highlighting */
.article-content :deep(.hljs) { color: #E5E7EB; background: #1E293B; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
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