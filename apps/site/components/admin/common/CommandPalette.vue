<script setup lang="ts">
interface SearchItem {
  type: 'article' | 'page' | 'media'
  id: number
  title: string
  subtitle?: string
  url: string
}

const api = useAdminApi()
const router = useRouter()

const open = ref(false)
const query = ref('')
const results = ref<SearchItem[]>([])
const loading = ref(false)
const selectedIndex = ref(0)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function openPalette() {
  open.value = true
  query.value = ''
  results.value = []
  selectedIndex.value = 0
}

function closePalette() {
  open.value = false
}

async function search() {
  if (!query.value.trim()) {
    results.value = []
    return
  }

  loading.value = true
  try {
    const data = await api.get<{ items: SearchItem[] }>('/api/admin/search', { q: query.value })
    results.value = data.items
    selectedIndex.value = 0
  }
  catch (error) {
    console.error('Search failed:', error)
  }
  finally {
    loading.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!open.value) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  }
  else if (event.key === 'Enter' && results.value.length > 0) {
    event.preventDefault()
    navigateTo(results.value[selectedIndex.value].url)
    closePalette()
  }
  else if (event.key === 'Escape') {
    closePalette()
  }
}

function handleSelect(item: SearchItem) {
  router.push(item.url)
  closePalette()
}

function handleInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(search, 240)
}

const typeLabels: Record<string, string> = {
  article: '文章',
  page: '页面',
  media: '媒体',
}

const typeIcons: Record<string, string> = {
  article: 'i-heroicons-document-text',
  page: 'i-heroicons-document-duplicate',
  media: 'i-heroicons-photo',
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openPalette()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[120]" @click.self="closePalette">
      <div class="absolute inset-0 bg-[rgba(8,12,20,0.56)] backdrop-blur-sm" @click="closePalette" />

      <div class="absolute left-1/2 top-[14%] w-full max-w-2xl -translate-x-1/2 px-4">
        <div class="overflow-hidden rounded-[28px] border border-white/50 bg-[rgba(255,255,255,0.92)] shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(12,18,28,0.94)]">
          <div class="flex items-center gap-3 border-b border-border/70 px-5 py-4">
            <span class="i-heroicons-magnifying-glass h-5 w-5 text-primary" />
            <input
              v-model="query"
              type="text"
              class="flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted"
              placeholder="搜索文章、页面或媒体资源…"
              autofocus
              @input="handleInput"
              @keydown="handleKeydown"
            >
            <button v-if="loading" class="i-heroicons-arrow-path h-4 w-4 animate-spin text-muted" />
          </div>

          <div class="max-h-[26rem] overflow-y-auto px-3 py-3">
            <div v-if="results.length === 0 && query && !loading" class="rounded-2xl border border-dashed border-border/80 px-5 py-10 text-center">
              <p class="text-sm font-medium text-text">没有找到匹配结果</p>
              <p class="mt-2 text-xs text-muted">试试更短的关键词，或者直接进入对应模块筛选。</p>
            </div>

            <div v-else-if="results.length > 0" class="space-y-1">
              <button
                v-for="(item, index) in results"
                :key="`${item.type}-${item.id}`"
                class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors"
                :class="index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-surface-2/80'"
                @click="handleSelect(item)"
                @mouseenter="selectedIndex = index"
              >
                <span :class="typeIcons[item.type]" class="h-5 w-5 flex-none" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold" :class="index === selectedIndex ? 'text-primary' : 'text-text'">{{ item.title }}</p>
                  <p v-if="item.subtitle" class="truncate text-xs text-muted">{{ item.subtitle }}</p>
                </div>
                <span class="rounded-full bg-surface-2 px-2 py-1 text-xs text-muted">{{ typeLabels[item.type] }}</span>
              </button>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-border/80 px-5 py-10 text-center">
              <p class="text-sm font-medium text-text">从后台全局搜索开始</p>
              <p class="mt-2 text-xs text-muted">支持文章、页面和媒体，键盘使用 <code>Ctrl + K</code> 快速打开。</p>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-border/70 bg-surface/60 px-5 py-3 text-xs text-muted">
            <span>↑ ↓ 选择</span>
            <span>Enter 打开</span>
            <span>Esc 关闭</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
