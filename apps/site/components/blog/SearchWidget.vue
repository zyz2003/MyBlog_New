<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const emit = defineEmits<{ close: [] }>()

interface SearchItem {
  id: number
  title: string
  slug?: string | null
  excerpt?: string | null
  coverImage?: string | null
  publishedAt?: string | null
  createdAt?: string | null
}

interface SearchResponse {
  code: number
  data: {
    items: SearchItem[]
    total: number
    page: number
    pageSize: number
  }
}

const router = useRouter()
const { search, algoliaSearch } = useSiteSettings()

const query = ref('')
const inputRef = ref<HTMLInputElement>()
const results = ref<SearchItem[]>([])
const loading = ref(false)
const error = ref('')
const total = ref(0)
const selectedIndex = ref(0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

const trimmedQuery = computed(() => query.value.trim())
const currentProvider = computed(() => search.value.provider || 'local')
const pageSize = computed(() => currentProvider.value === 'algolia'
  ? Math.max(1, Number(algoliaSearch.value.perPage || 6))
  : 8)

function articlePath(article: SearchItem): string {
  if (article.slug) {
    return `/articles/${article.slug}`
  }

  const sourceDate = article.publishedAt || article.createdAt
  if (!sourceDate) {
    return `/articles/${article.id}`
  }

  const date = new Date(sourceDate)
  if (Number.isNaN(date.getTime())) {
    return `/articles/${article.id}`
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${article.id}`
}

function highlight(text: string, term: string): string {
  if (!term) {
    return text
  }

  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matcher = new RegExp(`(${escapedTerm})`, 'gi')
  return text.replace(
    matcher,
    '<mark class="rounded bg-[var(--anzhiyu-main)]/12 px-1 text-[var(--anzhiyu-main)]">$1</mark>',
  )
}

function formatSnippet(article: SearchItem): string {
  const text = (article.excerpt || '').trim()
  if (!text) {
    return '这篇文章暂无摘要，点击后可查看完整内容。'
  }

  if (!trimmedQuery.value) {
    return text.slice(0, 120)
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = trimmedQuery.value.toLowerCase()
  const matchIndex = lowerText.indexOf(lowerQuery)
  if (matchIndex < 0) {
    return text.slice(0, 120)
  }

  const start = Math.max(0, matchIndex - 28)
  const end = Math.min(text.length, matchIndex + trimmedQuery.value.length + 72)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < text.length ? '...' : ''
  return `${prefix}${text.slice(start, end)}${suffix}`
}

async function searchArticles() {
  const currentQuery = trimmedQuery.value
  requestId += 1
  const currentRequest = requestId

  if (!currentQuery) {
    results.value = []
    total.value = 0
    error.value = ''
    loading.value = false
    selectedIndex.value = 0
    return
  }

  if (currentProvider.value === 'docsearch') {
    results.value = []
    total.value = 0
    error.value = '当前后台选择了 DocSearch，该弹窗暂不承载 DocSearch UI。'
    loading.value = false
    selectedIndex.value = 0
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch<SearchResponse>('/api/search', {
      params: {
        q: currentQuery,
        page: 1,
        pageSize: pageSize.value,
        provider: currentProvider.value,
      },
    })

    if (currentRequest !== requestId) {
      return
    }

    results.value = response.data.items ?? []
    total.value = response.data.total ?? 0
    selectedIndex.value = 0
  }
  catch (searchError) {
    if (currentRequest !== requestId) {
      return
    }

    results.value = []
    total.value = 0
    error.value = searchError instanceof Error ? searchError.message : '搜索暂时不可用，请稍后再试。'
  }
  finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

function queueSearch() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    searchArticles()
  }, 240)
}

async function openSelectedResult() {
  const target = results.value[selectedIndex.value]
  if (!target) {
    if (trimmedQuery.value) {
      await router.push({ path: '/search', query: { q: trimmedQuery.value } })
      emit('close')
    }
    return
  }

  await router.push(articlePath(target))
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (results.value.length > 0) {
      selectedIndex.value = (selectedIndex.value + 1) % results.value.length
    }
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (results.value.length > 0) {
      selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    openSelectedResult()
  }
}

watch(trimmedQuery, () => {
  queueSearch()
})

watch(currentProvider, () => {
  queueSearch()
})

onMounted(() => {
  setTimeout(() => inputRef.value?.focus(), 80)
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[1001] flex items-start justify-center pt-[12vh]" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/52 backdrop-blur-sm" />

      <div class="relative z-1 mx-4 w-full max-w-[680px] overflow-hidden rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div class="flex items-center gap-3 border-b border-[var(--style-border-always)] px-5 py-4">
          <i class="anzhiyufont anzhiyu-icon-magnifying-glass text-lg text-[var(--anzhiyu-main)]" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="flex-1 border-none bg-transparent text-base text-[var(--anzhiyu-fontcolor)] outline-none placeholder:text-[var(--anzhiyu-secondtext)]"
            placeholder="搜索文章标题或摘要..."
            @keydown="handleKeydown"
            @keyup.esc="emit('close')"
          >
          <button
            type="button"
            class="cursor-pointer border-none bg-transparent text-lg text-[var(--anzhiyu-secondtext)] transition-colors hover:text-[var(--anzhiyu-fontcolor)]"
            @click="emit('close')"
          >
            <i class="anzhiyufont anzhiyu-icon-xmark" />
          </button>
        </div>

        <div class="border-b border-[var(--style-border-always)] px-5 py-3 text-xs text-[var(--anzhiyu-secondtext)]">
          <span v-if="currentProvider === 'docsearch'">当前选择了 DocSearch，该弹窗仅支持本地搜索与 Algolia。</span>
          <span v-else-if="trimmedQuery">找到 {{ total }} 条相关结果</span>
          <span v-else>输入关键词后将实时搜索已发布文章</span>
        </div>

        <div class="max-h-[55vh] overflow-y-auto">
          <div v-if="!trimmedQuery" class="px-6 py-10 text-center text-sm text-[var(--anzhiyu-secondtext)]">
            输入关键词后即可搜索文章、摘要与主题内容。
          </div>

          <div v-else-if="loading" class="px-6 py-10 text-center text-sm text-[var(--anzhiyu-secondtext)]">
            正在搜索相关文章...
          </div>

          <div v-else-if="error" class="px-6 py-10 text-center text-sm text-[var(--anzhiyu-secondtext)]">
            {{ error }}
          </div>

          <div v-else-if="results.length === 0" class="px-6 py-10 text-center text-sm text-[var(--anzhiyu-secondtext)]">
            没有找到相关结果，试试更简短的关键词。
          </div>

          <NuxtLink
            v-for="(article, index) in results"
            :key="`${article.id}-${article.slug || ''}`"
            :to="articlePath(article)"
            class="block border-b border-[var(--style-border-always)] px-5 py-4 no-underline transition-colors last:border-b-0"
            :class="index === selectedIndex ? 'bg-[var(--anzhiyu-main)]/7' : 'hover:bg-[var(--anzhiyu-main)]/4'"
            @click="emit('close')"
            @mouseenter="selectedIndex = index"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <div class="line-clamp-1 text-sm font-semibold text-[var(--anzhiyu-fontcolor)]">{{ article.title }}</div>
              <span class="shrink-0 text-[11px] text-[var(--anzhiyu-secondtext)]">
                {{ new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('zh-CN') }}
              </span>
            </div>
            <div
              class="line-clamp-2 text-xs leading-6 text-[var(--anzhiyu-secondtext)]"
              v-html="highlight(formatSnippet(article), trimmedQuery)"
            />
          </NuxtLink>
        </div>

        <div class="flex flex-wrap items-center gap-3 border-t border-[var(--style-border-always)] px-5 py-3 text-[11px] text-[var(--anzhiyu-secondtext)]">
          <span><kbd class="rounded bg-[var(--anzhiyu-secondtext)]/10 px-1.5 py-0.5">Enter</kbd> 打开结果</span>
          <span><kbd class="rounded bg-[var(--anzhiyu-secondtext)]/10 px-1.5 py-0.5">↑/↓</kbd> 切换结果</span>
          <span><kbd class="rounded bg-[var(--anzhiyu-secondtext)]/10 px-1.5 py-0.5">Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.line-clamp-1,
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  -webkit-line-clamp: 2;
}
</style>
