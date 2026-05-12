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
  catch (e) {
    console.error('Search failed:', e)
  }
  finally {
    loading.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!open.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  }
  else if (e.key === 'Enter' && results.value.length > 0) {
    e.preventDefault()
    navigateTo(results.value[selectedIndex.value].url)
    closePalette()
  }
  else if (e.key === 'Escape') {
    closePalette()
  }
}

function handleSelect(item: SearchItem) {
  router.push(item.url)
  closePalette()
}

function handleInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 300)
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

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      openPalette()
    }
  })
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50" @click.self="closePalette">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="closePalette" />

      <!-- Modal -->
      <div class="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <!-- Search input -->
        <div class="flex items-center gap-3 px-4 py-3 border-b">
          <span class="i-heroicons-magnifying-glass w-5 h-5 text-gray-400" />
          <input
            v-model="query"
            type="text"
            class="flex-1 text-lg outline-none"
            placeholder="搜索文章、页面、媒体... (Ctrl+K)"
            @input="handleInput"
            @keydown="handleKeydown"
            autofocus
          >
          <button v-if="loading" class="i-heroicons-arrow-path w-4 h-4 text-gray-400 animate-spin" />
        </div>

        <!-- Results -->
        <div class="max-h-80 overflow-y-auto">
          <div v-if="results.length === 0 && query && !loading" class="px-4 py-8 text-center text-gray-400">
            未找到结果
          </div>

          <div v-else-if="results.length > 0" class="py-2">
            <button
              v-for="(item, index) in results"
              :key="`${item.type}-${item.id}`"
              class="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
              :class="index === selectedIndex ? 'bg-surface-2' : 'hover:bg-surface'"
              @click="handleSelect(item)"
              @mouseenter="selectedIndex = index"
            >
              <span :class="typeIcons[item.type]" class="w-5 h-5 text-gray-400" />
              <div class="flex-1 text-left min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</div>
                <div v-if="item.subtitle" class="text-xs text-gray-400 truncate">{{ item.subtitle }}</div>
              </div>
              <span class="text-xs text-gray-400">{{ typeLabels[item.type] }}</span>
              <span v-if="index === selectedIndex" class="text-xs text-primary">按 Enter 跳转</span>
            </button>
          </div>

          <div v-else class="px-4 py-6 text-center text-gray-400 text-sm">
            输入关键词开始搜索
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>↑↓ 选择</span>
          <span>Enter 跳转</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>