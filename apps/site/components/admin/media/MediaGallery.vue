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
}>()

const emit = defineEmits<{
  delete: [id: number]
  'page-change': [page: number]
}>()

const selectedItem = ref<MediaItem | null>(null)
const copied = ref(false)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('zh-CN')
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function getDisplayName(item: MediaItem): string {
  return item.originalName || item.filename
}

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
    // fallback: select text
  }
}

function handleDeleteConfirm() {
  if (!selectedItem.value) return
  if (!confirm('确定要删除这个媒体文件吗？')) return
  emit('delete', selectedItem.value.id)
  closeDetail()
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="aspect-square bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="text-center py-12">
      <span class="i-heroicons-photo w-16 h-16 mx-auto text-gray-300 block mb-4" />
      <p class="text-gray-500">暂无媒体文件</p>
    </div>

    <!-- Gallery grid -->
    <div v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
          @click="openDetail(item)"
        >
          <!-- Image thumbnail -->
          <img
            v-if="isImage(item.mimeType)"
            :src="item.url"
            :alt="getDisplayName(item)"
            class="w-full h-full object-cover"
          />

          <!-- File icon for non-images -->
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="i-heroicons-document w-12 h-12 text-gray-300" />
          </div>

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p class="text-white text-xs truncate">{{ getDisplayName(item) }}</p>
            <p class="text-white/70 text-xs">{{ formatFileSize(item.size) }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          第 {{ page }} 页，共 {{ totalPages }} 页
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="page <= 1"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="emit('page-change', page - 1)"
          >
            上一页
          </button>
          <button
            :disabled="page >= totalPages"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="emit('page-change', page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeDetail"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
          <!-- Preview -->
          <div class="bg-gray-100 flex items-center justify-center p-4" style="min-height: 200px; max-height: 400px;">
            <img
              v-if="isImage(selectedItem.mimeType)"
              :src="selectedItem.url"
              :alt="getDisplayName(selectedItem)"
              class="max-w-full max-h-80 object-contain"
            />
            <div v-else class="text-center">
              <span class="i-heroicons-document w-16 h-16 text-gray-300 block mx-auto mb-2" />
              <p class="text-sm text-gray-500">非图片文件</p>
            </div>
          </div>

          <!-- Info -->
          <div class="p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 truncate">{{ getDisplayName(selectedItem) }}</h3>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors"
                @click="closeDetail"
              >
                <span class="i-heroicons-x-mark w-5 h-5" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-500">文件名</span>
                <p class="text-gray-900 truncate">{{ selectedItem.filename }}</p>
              </div>
              <div>
                <span class="text-gray-500">类型</span>
                <p class="text-gray-900">{{ selectedItem.mimeType }}</p>
              </div>
              <div>
                <span class="text-gray-500">大小</span>
                <p class="text-gray-900">{{ formatFileSize(selectedItem.size) }}</p>
              </div>
              <div>
                <span class="text-gray-500">上传时间</span>
                <p class="text-gray-900">{{ formatDate(selectedItem.createdAt) }}</p>
              </div>
            </div>

            <!-- URL -->
            <div>
              <span class="text-sm text-gray-500">访问地址</span>
              <div class="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  :value="selectedItem.url"
                  readonly
                  class="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 font-mono"
                />
                <button
                  class="px-3 py-1.5 text-sm rounded border transition-colors"
                  :class="copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:bg-gray-50 text-gray-700'"
                  @click="copyUrl(selectedItem.url)"
                >
                  {{ copied ? '已复制' : '复制' }}
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end pt-2 border-t border-gray-100">
              <button
                class="px-4 py-2 text-sm rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                @click="handleDeleteConfirm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
