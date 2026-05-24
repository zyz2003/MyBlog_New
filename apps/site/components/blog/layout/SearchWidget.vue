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
  categories?: Array<{ id: number; name: string; slug: string }>
  tags?: Array<{ id: number; name: string; slug: string; color?: string | null }>
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

function formatDate(article: SearchItem) {
  const sourceDate = article.publishedAt || article.createdAt
  if (!sourceDate) return ''
  return new Date(sourceDate).toLocaleDateString('zh-CN')
}

function highlight(text: string, term: string): string {
  if (!term) return text
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="search-keyword">$1</mark>',
  )
}

function formatSnippet(article: SearchItem): string {
  const text = (article.excerpt || '').trim()
  if (!text) return '暂无摘要，点击查看完整内容。'
  if (!trimmedQuery.value) return text.slice(0, 120)

  const lowerText = text.toLowerCase()
  const lowerQuery = trimmedQuery.value.toLowerCase()
  const matchIndex = lowerText.indexOf(lowerQuery)
  if (matchIndex < 0) return text.slice(0, 120)

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
    error.value = '当前选择了 DocSearch，弹窗暂不支持 DocSearch UI。'
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

    if (currentRequest !== requestId) return

    results.value = response.data.items ?? []
    total.value = response.data.total ?? 0
    selectedIndex.value = 0
  }
  catch (searchError) {
    if (currentRequest !== requestId) return
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
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => searchArticles(), 240)
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

watch(trimmedQuery, () => queueSearch())
watch(currentProvider, () => queueSearch())

onMounted(() => {
  setTimeout(() => inputRef.value?.focus(), 80)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <Teleport to="body">
    <!-- Mask overlay -->
    <div class="search-mask" @click="emit('close')" />

    <!-- Search dialog -->
    <div class="search-dialog">
      <!-- Search input header -->
      <div class="search-dialog-header">
        <div class="search-dialog-title">
          <i class="anzhiyufont anzhiyu-icon-magnifying-glass" />
          <span>站内搜索</span>
        </div>
        <button
          type="button"
          class="search-close-button"
          @click="emit('close')"
        >
          <i class="anzhiyufont anzhiyu-icon-xmark" />
        </button>
      </div>

      <!-- Search input -->
      <div class="search-input-box">
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="search-input-field"
          placeholder="输入关键词搜索文章..."
          @keydown="handleKeydown"
          @keyup.esc="emit('close')"
        >
      </div>

      <!-- Status bar -->
      <div v-if="trimmedQuery && !loading" class="search-status-bar">
        找到 {{ total }} 条结果
      </div>
      <div v-else-if="loading" class="search-status-bar">
        <i class="anzhiyufont anzhiyu-icon-spinner animate-spin" />
        搜索中...
      </div>
      <div v-else-if="error" class="search-status-bar error">
        {{ error }}
      </div>
      <div v-else class="search-status-bar">
        输入关键词后实时搜索文章
      </div>

      <!-- Results area -->
      <div class="search-results-scroll">
        <div v-if="!trimmedQuery" class="search-empty">
          <i class="anzhiyufont anzhiyu-icon-magnifying-glass search-empty-icon" />
          <p>输入关键词开始搜索</p>
        </div>

        <div v-else-if="loading && results.length === 0" class="search-empty">
          <i class="anzhiyufont anzhiyu-icon-spinner animate-spin search-empty-icon" />
          <p>正在搜索中...</p>
        </div>

        <div v-else-if="error && results.length === 0" class="search-empty">
          <p>{{ error }}</p>
        </div>

        <div v-else-if="results.length === 0 && trimmedQuery" class="search-empty">
          <i class="anzhiyufont anzhiyu-icon-file-lines search-empty-icon" />
          <p>没有找到相关结果，试试更简短的关键词</p>
        </div>

        <!-- Result items (anzhiyu local-search style with dot indicator) -->
        <NuxtLink
          v-for="(article, index) in results"
          :key="`${article.id}-${article.slug || ''}`"
          :to="articlePath(article)"
          class="search-hit-item"
          :class="{ selected: index === selectedIndex }"
          @click="emit('close')"
          @mouseenter="selectedIndex = index"
        >
          <div class="search-hit-title" v-html="highlight(article.title, trimmedQuery)" />
          <div
            v-if="article.excerpt"
            class="search-hit-excerpt"
            v-html="highlight(formatSnippet(article), trimmedQuery)"
          />
          <div class="search-hit-meta">
            <span class="search-hit-date">{{ formatDate(article) }}</span>
            <span v-if="article.categories?.length" class="search-hit-category">{{ article.categories[0].name }}</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Keyboard hints -->
      <div class="search-dialog-footer">
        <span><kbd>Enter</kbd> 打开</span>
        <span><kbd>↑↓</kbd> 切换</span>
        <span><kbd>Esc</kbd> 关闭</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- Mask (anzhiyu style) --- */
.search-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: search-mask-in 0.3s ease;
}

@keyframes search-mask-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* --- Dialog (anzhiyu style) --- */
.search-dialog {
  position: fixed;
  top: 5rem;
  left: 50%;
  z-index: 1001;
  transform: translateX(-50%);
  width: 37.5rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.14);
  animation: search-dialog-in 0.3s ease;
}

@keyframes search-dialog-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* --- Header --- */
.search-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.search-dialog-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--anzhiyu-main);
  font-size: 1.1rem;
  font-weight: 700;
}

.search-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--anzhiyu-secondtext);
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
}

.search-close-button:hover {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

/* --- Input (anzhiyu local-search style with rounded border) --- */
.search-input-box {
  margin-bottom: 0.75rem;
}

.search-input-field {
  width: 100%;
  padding: 0.6rem 1rem;
  outline: none;
  border: 2px solid var(--anzhiyu-main);
  border-radius: 40px;
  background: var(--anzhiyu-card-bg);
  color: var(--anzhiyu-fontcolor);
  font-size: 0.95rem;
  transition: 0.3s;
}

.search-input-field::placeholder {
  color: var(--anzhiyu-secondtext);
}

.search-input-field:focus {
  border-color: var(--anzhiyu-main);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
}

/* --- Status bar --- */
.search-status-bar {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.82rem;
  color: var(--anzhiyu-secondtext);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.search-status-bar.error {
  color: var(--anzhiyu-red, #f65);
}

/* --- Results scroll --- */
.search-results-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: calc(80vh - 12rem);
  scrollbar-width: thin;
}

.search-results-scroll::-webkit-scrollbar {
  width: 4px;
}

.search-results-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--anzhiyu-main) 30%, transparent);
  border-radius: 2px;
}

/* --- Empty state --- */
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--anzhiyu-secondtext);
  font-size: 0.9rem;
}

.search-empty-icon {
  font-size: 2rem;
  color: color-mix(in srgb, var(--anzhiyu-main) 40%, transparent);
  margin-bottom: 0.5rem;
}

/* --- Hit items (anzhiyu local-search dot style) --- */
.search-hit-item {
  position: relative;
  padding-left: 1.5rem;
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
  padding-right: 0.75rem;
  line-height: 1.7;
  display: block;
  border-bottom: 1px solid var(--style-border-always);
  text-decoration: none;
  color: var(--anzhiyu-fontcolor);
  transition: 0.2s;
}

.search-hit-item:last-child {
  border-bottom: none;
}

/* Dot indicator (anzhiyu local-search style) */
.search-hit-item::before {
  content: '';
  position: absolute;
  top: 0.85rem;
  left: 0.4rem;
  width: 0.5rem;
  height: 0.5rem;
  border: 3px solid var(--anzhiyu-main);
  border-radius: 50%;
  background: transparent;
  transition: 0.2s;
}

.search-hit-item:hover::before,
.search-hit-item.selected::before {
  border-color: var(--anzhiyu-main);
  background: var(--anzhiyu-main);
}

.search-hit-item:hover,
.search-hit-item.selected {
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
}

.search-hit-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--anzhiyu-fontcolor);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-hit-item:hover .search-hit-title {
  color: var(--anzhiyu-main);
}

.search-hit-excerpt {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  color: var(--anzhiyu-secondtext);
  line-height: 1.6;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-keyword {
  color: var(--anzhiyu-main);
  font-weight: bold;
  border-radius: 2px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  padding: 0 2px;
}

.search-hit-meta {
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: var(--anzhiyu-secondtext);
  display: flex;
  gap: 0.5rem;
}

.search-hit-category {
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

/* --- Footer (keyboard hints) --- */
.search-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  border-top: var(--style-border-always);
  font-size: 0.78rem;
  color: var(--anzhiyu-secondtext);
}

.search-dialog-footer kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--anzhiyu-secondtext) 10%, transparent);
  font-size: 0.72rem;
  font-family: monospace;
}

/* --- Responsive (anzhiyu style: full-screen on mobile) --- */
@media (max-width: 768px) {
  .search-dialog {
    top: 0;
    left: 0;
    transform: none;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
    padding: 1rem;
  }

  .search-results-scroll {
    max-height: calc(100vh - 10rem);
  }

  .search-mask {
    backdrop-filter: none;
  }
}

@media (max-height: 580px) {
  .search-dialog {
    top: 0;
    left: 0;
    transform: none;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>