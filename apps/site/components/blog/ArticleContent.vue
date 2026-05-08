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
.article-content a,
.prose a {
  color: #4F46E5;
}
.prose-headings {
  font-family: var(--font-heading, system-ui);
  color: #1F2937;
}
.prose code {
  font-family: var(--font-mono, JetBrains Mono, monospace);
  background: #F3F4F6;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
.prose pre {
  background: #1F2937;
  border-radius: 8px;
  overflow-x: auto;
}
.prose blockquote {
  border-left-color: #4F46E5;
  color: #6B7280;
}
.hljs { color: #E5E7EB; background: #1F2937; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
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
