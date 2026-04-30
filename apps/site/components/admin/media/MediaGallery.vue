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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function getDisplayName(item: MediaItem): string {
  return item.originalName || item.filename
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
      <p class="text-gray-500">No media files yet</p>
    </div>

    <!-- Gallery grid -->
    <div v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
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

          <!-- Delete button -->
          <button
            class="absolute top-2 right-2 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
            title="Delete"
            @click="emit('delete', item.id)"
          >
            <span class="i-heroicons-trash w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Page {{ page }} of {{ totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="page <= 1"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="emit('page-change', page - 1)"
          >
            Prev
          </button>
          <button
            :disabled="page >= totalPages"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="emit('page-change', page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
