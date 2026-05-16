<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

interface Article { id: number; title: string; excerpt?: string; content?: string }
const allArticles = ref<Article[]>([])
const query = ref('')
const inputRef = ref<HTMLInputElement>()

let debounceTimer: ReturnType<typeof setTimeout>

const results = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return allArticles.value
    .filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q)
    )
    .slice(0, 20)
    .map(a => {
      const text = a.excerpt || a.content || ''
      const idx = text.toLowerCase().indexOf(q)
      const snippet = idx >= 0
        ? '...' + text.slice(Math.max(0, idx - 30), Math.min(text.length, idx + q.length + 80)) + '...'
        : text.slice(0, 120)
      return { ...a, snippet }
    })
})

function articlePath(a: { id: number }): string {
  return `/articles/${a.id}`
}

function highlight(text: string, term: string): string {
  if (!term) return text
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(re, '<mark class="bg-[var(--anzhiyu-main)]/20 text-[var(--anzhiyu-main)] rounded px-0.5">$1</mark>')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { emit('close') }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { /* query is reactive, results update automatically */ }, 200)
}

onMounted(async () => {
  try {
    const res = await $fetch<{ code: number; data: { items: Article[] } }>('/api/search', { params: { q: '' } })
    allArticles.value = (res as any).data?.items ?? (res as any).data ?? []
  } catch { /* fail silently */ }
  setTimeout(() => inputRef.value?.focus(), 100)
})

onUnmounted(() => clearTimeout(debounceTimer))
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[1001] flex items-start justify-center pt-[15vh]" @click.self="emit('close')">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <!-- Search panel -->
      <div class="relative z-1 w-full max-w-[600px] mx-4 bg-[var(--anzhiyu-card-bg)] rounded-2xl border border-[var(--style-border-always)] shadow-2xl overflow-hidden">
        <!-- Input -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-[var(--style-border-always)]">
          <i class="anzhiyufont anzhiyu-icon-magnifying-glass text-lg text-[var(--anzhiyu-secondtext)]" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="flex-1 bg-transparent border-none outline-none text-base text-[var(--anzhiyu-fontcolor)] placeholder:text-[var(--anzhiyu-secondtext)]"
            placeholder="搜索文章..."
            @input="onKeydown"
            @keyup.esc="emit('close')"
          />
          <button class="text-[var(--anzhiyu-secondtext)] hover:text-[var(--anzhiyu-fontcolor)] cursor-pointer border-none bg-transparent text-lg" @click="emit('close')">
            <i class="anzhiyufont anzhiyu-icon-xmark" />
          </button>
        </div>

        <!-- Results -->
        <div class="max-h-[50vh] overflow-y-auto">
          <div v-if="!query.trim()" class="text-center py-8 text-sm text-[var(--anzhiyu-secondtext)]">
            输入关键词搜索文章
          </div>
          <div v-else-if="results.length === 0" class="text-center py-8 text-sm text-[var(--anzhiyu-secondtext)]">
            未找到相关文章
          </div>
          <NuxtLink
            v-for="article in results" :key="article.id" :to="articlePath(article)"
            class="block px-5 py-3 no-underline hover:bg-[var(--anzhiyu-main)]/5 transition-colors border-b border-[var(--style-border-always)] last:border-b-0"
            @click="emit('close')"
          >
            <div class="text-sm font-medium text-[var(--anzhiyu-fontcolor)] mb-1">{{ article.title }}</div>
            <div class="text-xs text-[var(--anzhiyu-secondtext)] leading-relaxed" v-html="highlight(article.snippet, query)" />
          </NuxtLink>
        </div>

        <!-- Footer hint -->
        <div class="px-5 py-2 border-t border-[var(--style-border-always)] text-[10px] text-[var(--anzhiyu-secondtext)] flex items-center gap-3">
          <span><kbd class="px-1 py-0.5 rounded bg-[var(--anzhiyu-secondtext)]/10 text-[var(--anzhiyu-secondtext)]">Esc</kbd> 关闭</span>
          <span><kbd class="px-1 py-0.5 rounded bg-[var(--anzhiyu-secondtext)]/10 text-[var(--anzhiyu-secondtext)]">↑↓</kbd> 导航</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
