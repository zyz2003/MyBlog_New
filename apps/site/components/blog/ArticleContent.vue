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
  maxWidth: contentConfig.value.maxWidth ?? 'var(--container-max, 720px)',
  lineHeight: contentConfig.value.lineHeight ?? 1.75,
  color: 'var(--color-text, #0F172A)',
  fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)',
}))
</script>

<template>
  <article
    class="prose prose-slate max-w-none
      prose-headings:scroll-mt-20
      prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-lg
      prose-code:before:content-none prose-code:after:content-none"
    :style="articleStyle"
    v-html="renderedHtml"
  />
</template>

<style>
.prose a {
  color: var(--color-primary, #3B82F6);
}
.prose-headings {
  font-family: var(--font-heading, system-ui);
  color: var(--color-text, #0F172A);
}
.prose code {
  font-family: var(--font-mono, JetBrains Mono, monospace);
  background: var(--color-surface-2, #F1F5F9);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
.prose pre {
  background: var(--color-surface, #1E293B);
  border-radius: 8px;
  overflow-x: auto;
}
.prose blockquote {
  border-left-color: var(--color-primary, #3B82F6);
  color: var(--color-text-muted, #64748B);
}
.hljs { color: #E5E7EB; background: #1E293B; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
.hljs-keyword { color: #F472B6; }
.hljs-string { color: #A5F3FC; }
.hljs-comment { color: #9CA3AF; }
.hljs-function { color: #C4B5FD; }
.hljs-number { color: #FCD34D; }
.hljs-title { color: #C4B5FD; }
.hljs-built_in { color: #FDBA74; }
.hljs-attr { color: #93C5FD; }
.hljs-params { color: #E5E7EB; }
.hljs-meta { color: #9CA3AF; }
</style>