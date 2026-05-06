<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (_) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

const renderedHtml = computed(() => md.render(props.content || ''))
</script>

<template>
  <article
    class="prose prose-slate max-w-none
      prose-headings:scroll-mt-20
      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-lg
      prose-pre:bg-gray-900 prose-pre:text-gray-100
      prose-code:before:content-none prose-code:after:content-none
      prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
    v-html="renderedHtml"
  />
</template>

<style>
.hljs { color: #c9d1d9; background: #0d1117; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
.hljs-keyword { color: #ff7b72; }
.hljs-string { color: #a5d6ff; }
.hljs-comment { color: #8b949e; }
.hljs-function { color: #d2a8ff; }
.hljs-number { color: #79c0ff; }
.hljs-title { color: #d2a8ff; }
.hljs-built_in { color: #ffa657; }
.hljs-attr { color: #79c0ff; }
.hljs-params { color: #c9d1d9; }
.hljs-meta { color: #8b949e; }
</style>
