<script setup lang="ts">
interface MediaItem {
  id: number
  filename: string
  originalName: string | null
  mimeType: string
  size: number
  url: string
  createdAt: Date | string
}

const props = defineProps<{
  items: MediaItem[]
  loading: boolean
  page: number
  totalPages: number
  total: number
}>()

const emit = defineEmits<{
  delete: [id: number]
  'page-change': [page: number]
  search: [keyword: string, type: string]
}>()

// View mode
const viewMode = ref<'grid' | 'list'>('grid')

// Filter and search
const searchQuery = ref('')
const typeFilter = ref<'all' | 'image' | 'document'>('all')
const selectedIds = ref<Set<number>>(new Set())
const isSelectionMode = ref(false)

const filteredItems = computed(() => props.items)
const selectedCount = computed(() => selectedIds.value.size)

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'i-heroicons-photo'
  if (mimeType.includes('pdf')) return 'i-heroicons-document-text'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'i-heroicons-document'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'i-heroicons-table-cells'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'i-heroicons-presentation-chart-bar'
  if (mimeType.includes('video')) return 'i-heroicons-film'
  if (mimeType.includes('audio')) return 'i-heroicons-musical-note'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('archive')) return 'i-heroicons-archive-box'
  if (mimeType.includes('text/plain') || mimeType.includes('markdown')) return 'i-heroicons-document'
  return 'i-heroicons-paper-clip'
}

function getFileTypeLabel(mimeType: string) {
  if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase()
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLS'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT'
  if (mimeType.includes('video')) return mimeType.split('/')[1].toUpperCase()
  if (mimeType.includes('audio')) return mimeType.split('/')[1].toUpperCase()
  if (mimeType.includes('zip')) return 'ZIP'
  if (mimeType.includes('rar')) return 'RAR'
  if (mimeType.includes('7z')) return '7Z'
  if (mimeType.includes('text/plain')) return 'TXT'
  if (mimeType.includes('markdown')) return 'MD'
  return mimeType.split('/')[1].toUpperCase()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('zh-CN')
}

function getDisplayName(item: MediaItem): string {
  return item.originalName || item.filename
}

function toggleSelection(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  }
  else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

function selectAll() {
  if (selectedIds.value.size === filteredItems.value.length) {
    selectedIds.value.clear()
  }
  else {
    selectedIds.value = new Set(filteredItems.value.map(i => i.id))
  }
  selectedIds.value = new Set(selectedIds.value)
}

function toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) {
    selectedIds.value.clear()
    selectedIds.value = new Set()
  }
}

function handleSearch() {
  emit('search', searchQuery.value, typeFilter.value)
}

function handleTypeFilter(type: 'all' | 'image' | 'document') {
  typeFilter.value = type
  emit('search', searchQuery.value, type)
}

// Selected item for detail modal
const selectedItem = ref<MediaItem | null>(null)
const copied = ref(false)

function openDetail(item: MediaItem) {
  selectedItem.value = item
}

function closeDetail() {
  selectedItem.value = null
  copied.value = false
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
  catch {
    // fallback
  }
}

function handleDeleteConfirm() {
  if (!selectedItem.value) return
  if (!confirm('确定要删除这个媒体文件吗？此操作不可撤销。')) return
  emit('delete', selectedItem.value.id)
  closeDetail()
}

function handleBulkDelete() {
  if (selectedIds.value.size === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIds.value.size} 个文件吗？此操作不可撤销。`)) return
  selectedIds.value.forEach(id => emit('delete', id))
  selectedIds.value.clear()
  selectedIds.value = new Set()
  isSelectionMode.value = false
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    closeDetail()
  }
}

// Stats
const imageCount = computed(() => props.items.filter(i => isImage(i.mimeType)).length)
const docCount = computed(() => props.items.filter(i => !isImage(i.mimeType)).length)
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-border">
      <!-- Left: Filter tabs -->
      <div class="flex items-center gap-1 p-1 bg-surface-2 rounded-lg">
        <button
          v-for="f in [{ value: 'all', label: '全部', icon: 'i-heroicons-squares-2x2' }, { value: 'image', label: '图片', icon: 'i-heroicons-photo' }, { value: 'document', label: '文档', icon: 'i-heroicons-document' }]"
          :key="f.value"
          class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          :class="typeFilter === f.value ? 'bg-surface shadow-sm text-text' : 'text-muted hover:text-text'"
          @click="handleTypeFilter(f.value as 'all' | 'image' | 'document')"
        >
          <span :class="f.icon + ' w-3.5 h-3.5'" />
          {{ f.label }}
        </button>
      </div>

      <!-- Right: View toggle + Selection mode -->
      <div class="flex items-center gap-2 sm:ml-auto">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文件..."
            class="w-40 sm:w-48 pl-8 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            @keyup.enter="handleSearch"
          >
          <span class="i-heroicons-magnifying-glass w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        </div>

        <!-- Selection toggle -->
        <button
          class="p-2 rounded-lg border transition-colors cursor-pointer"
          :class="isSelectionMode ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-surface-2 text-muted'"
          :title="isSelectionMode ? '取消选择' : '进入选择模式'"
          @click="toggleSelectionMode"
        >
          <span class="i-heroicons-check-circle w-4 h-4" />
        </button>

        <!-- View toggle -->
        <div class="flex items-center gap-0.5 p-1 bg-surface-2 rounded-lg">
          <button
            class="p-1.5 rounded transition-colors cursor-pointer"
            :class="viewMode === 'grid' ? 'bg-surface shadow-sm text-text' : 'text-muted hover:text-text'"
            title="网格视图"
            @click="viewMode = 'grid'"
          >
            <span class="i-heroicons-squares-2x2 w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded transition-colors cursor-pointer"
            :class="viewMode === 'list' ? 'bg-surface shadow-sm text-text' : 'text-muted hover:text-text'"
            title="列表视图"
            @click="viewMode = 'list'"
          >
            <span class="i-heroicons-list-bullet w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk actions bar -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isSelectionMode && selectedCount > 0" class="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border-b border-border">
        <span class="text-sm text-primary font-medium">{{ selectedCount }} 个文件已选中</span>
        <div class="flex items-center gap-1.5 ml-auto">
          <button
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border hover:bg-surface-2 transition-colors cursor-pointer flex items-center gap-1"
            @click="selectAll"
          >
            {{ selectedCount === filteredItems.length ? '取消全选' : '全选' }}
          </button>
          <button
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1"
            @click="handleBulkDelete"
          >
            <span class="i-heroicons-trash w-3.5 h-3.5" />
            批量删除
          </button>
        </div>
      </div>
    </Transition>

    <!-- Stats bar -->
    <div class="flex items-center gap-4 px-4 py-2 text-xs text-muted border-b border-border">
      <span class="flex items-center gap-1">
        <span class="i-heroicons-photo w-3.5 h-3.5" />
        {{ imageCount }} 张图片
      </span>
      <span class="flex items-center gap-1">
        <span class="i-heroicons-document w-3.5 h-3.5" />
        {{ docCount }} 个文档
      </span>
      <span class="text-border">|</span>
      <span>共 {{ total }} 个文件</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="p-4">
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <div v-for="i in 12" :key="i" class="aspect-square bg-surface-2 rounded-lg animate-pulse" />
      </div>
      <div v-else class="space-y-2">
        <div v-for="i in 8" :key="i" class="h-12 bg-surface-2 rounded-lg animate-pulse" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
        <span class="i-heroicons-photo w-10 h-10 text-muted/40" />
      </div>
      <p class="text-secondary font-medium">暂无媒体文件</p>
      <p class="text-xs text-muted mt-1">上传图片或文档开始使用</p>
    </div>

    <!-- Grid view -->
    <div v-else-if="viewMode === 'grid'" class="p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <div
          v-for="item in items"
          :key="item.id"
          class="group relative aspect-square rounded-lg overflow-hidden border bg-surface-2 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200"
          :class="[
            selectedIds.has(item.id) ? 'border-primary ring-2 ring-primary/30' : 'border-border',
            isSelectionMode ? 'cursor-pointer' : ''
          ]"
          @click="isSelectionMode ? toggleSelection(item.id) : openDetail(item)"
        >
          <!-- Checkbox -->
          <div
            v-if="isSelectionMode"
            class="absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
            :class="selectedIds.has(item.id) ? 'bg-primary border-primary' : 'bg-white/80 border-border'"
          >
            <span v-if="selectedIds.has(item.id)" class="i-heroicons-check w-3 h-3 text-white" />
          </div>

          <!-- Image thumbnail -->
          <img
            v-if="isImage(item.mimeType)"
            :src="item.url"
            :alt="getDisplayName(item)"
            class="w-full h-full object-cover"
          />

          <!-- File icon for non-images -->
          <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
            <span :class="getFileIcon(item.mimeType) + ' w-10 h-10 text-muted/40'" />
            <span class="text-[10px] text-muted truncate px-2 max-w-full">{{ getFileTypeLabel(item.mimeType) }}</span>
          </div>

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
            <p class="text-white text-xs font-medium truncate">{{ getDisplayName(item) }}</p>
            <p class="text-white/70 text-[10px]">{{ formatFileSize(item.size) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div v-else class="p-4">
      <div class="rounded-lg border border-border overflow-hidden">
        <!-- Header -->
        <div class="flex items-center gap-3 px-4 py-2.5 bg-surface-2 text-xs font-medium text-muted border-b border-border">
          <div class="w-8"><span v-if="isSelectionMode" class="sr-only">选择</span></div>
          <div class="flex-1">文件名</div>
          <div class="w-20 text-right">大小</div>
          <div class="w-32 text-right">上传时间</div>
          <div class="w-12 text-center">操作</div>
        </div>

        <!-- Rows -->
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-surface transition-colors cursor-pointer"
          :class="selectedIds.has(item.id) ? 'bg-primary/5' : ''"
          @click="isSelectionMode ? toggleSelection(item.id) : openDetail(item)"
        >
          <div class="w-8 flex items-center justify-center" @click.stop>
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer"
              :class="selectedIds.has(item.id) ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'"
              @click="toggleSelection(item.id)"
            >
              <span v-if="selectedIds.has(item.id)" class="i-heroicons-check w-3 h-3 text-white" />
            </div>
          </div>

          <div class="flex-1 flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden">
              <img v-if="isImage(item.mimeType)" :src="item.url" :alt="item.filename" class="w-full h-full object-cover" />
              <span v-else :class="getFileIcon(item.mimeType) + ' w-5 h-5 text-muted/40'" />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-text truncate">{{ getDisplayName(item) }}</p>
              <p class="text-xs text-muted truncate">{{ item.mimeType }}</p>
            </div>
          </div>

          <div class="w-20 text-right text-sm text-secondary">{{ formatFileSize(item.size) }}</div>
          <div class="w-32 text-right text-sm text-secondary">{{ formatDate(item.createdAt) }}</div>

          <div class="w-12 flex items-center justify-center gap-1" @click.stop>
            <button
              class="p-1.5 rounded hover:bg-surface-2 text-muted hover:text-red-500 transition-colors cursor-pointer"
              title="删除"
              @click="selectedItem = item"
            >
              <span class="i-heroicons-trash w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-border">
      <p class="text-xs text-muted">
        第 {{ page }} / {{ totalPages }} 页
      </p>
      <div class="flex items-center gap-1">
        <button
          :disabled="page <= 1"
          class="p-1.5 rounded-lg border border-border hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          @click="emit('page-change', page - 1)"
        >
          <span class="i-heroicons-chevron-left w-4 h-4" />
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="w-8 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer"
          :class="p === page ? 'bg-primary text-white border-primary' : 'border-border hover:bg-surface-2 text-text'"
          @click="emit('page-change', p)"
        >
          {{ p }}
        </button>
        <button
          :disabled="page >= totalPages"
          class="p-1.5 rounded-lg border border-border hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          @click="emit('page-change', page + 1)"
        >
          <span class="i-heroicons-chevron-right w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <div class="bg-surface rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-border">
          <!-- Preview -->
          <div class="bg-surface-2 flex items-center justify-center p-6" style="min-height: 200px; max-height: 320px;">
            <img
              v-if="isImage(selectedItem.mimeType)"
              :src="selectedItem.url"
              :alt="getDisplayName(selectedItem)"
              class="max-w-full max-h-72 object-contain rounded"
            />
            <div v-else class="text-center">
              <span :class="getFileIcon(selectedItem.mimeType) + ' w-16 h-16 text-muted/30 block mx-auto mb-2'" />
              <p class="text-sm text-muted">非图片文件</p>
            </div>
          </div>

          <!-- Info -->
          <div class="p-5 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-semibold text-text truncate">{{ getDisplayName(selectedItem) }}</h3>
              <button
                class="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-text transition-colors cursor-pointer shrink-0"
                @click="closeDetail"
              >
                <span class="i-heroicons-x-mark w-5 h-5" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="p-3 rounded-lg bg-surface-2">
                <span class="text-xs text-muted block mb-1">文件名</span>
                <p class="text-text text-xs truncate font-mono">{{ selectedItem.filename }}</p>
              </div>
              <div class="p-3 rounded-lg bg-surface-2">
                <span class="text-xs text-muted block mb-1">类型</span>
                <p class="text-text text-xs">{{ selectedItem.mimeType }}</p>
              </div>
              <div class="p-3 rounded-lg bg-surface-2">
                <span class="text-xs text-muted block mb-1">大小</span>
                <p class="text-text text-xs">{{ formatFileSize(selectedItem.size) }}</p>
              </div>
              <div class="p-3 rounded-lg bg-surface-2">
                <span class="text-xs text-muted block mb-1">上传时间</span>
                <p class="text-text text-xs">{{ formatDate(selectedItem.createdAt) }}</p>
              </div>
            </div>

            <!-- URL -->
            <div>
              <span class="text-xs text-muted block mb-1.5">访问地址</span>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  :value="selectedItem.url"
                  readonly
                  class="flex-1 text-xs text-text bg-surface-2 border border-border rounded-lg px-3 py-2 font-mono truncate"
                />
                <button
                  class="px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer shrink-0"
                  :class="copied ? 'bg-green-50 border-green-300 text-green-600' : 'border-border hover:bg-surface-2 text-text'"
                  @click="copyUrl(selectedItem.url)"
                >
                  {{ copied ? '已复制' : '复制' }}
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end pt-2 border-t border-border">
              <button
                class="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1.5"
                @click="handleDeleteConfirm"
              >
                <span class="i-heroicons-trash w-4 h-4" />
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
