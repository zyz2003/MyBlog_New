<script setup lang="ts">
import type { ArticleWithRelations } from '~/server/services/article.service'

const props = defineProps<{
  articles: ArticleWithRelations[]
  loading: boolean
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
  'page-change': [page: number]
}>()

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function getPrimaryCategory(article: ArticleWithRelations): string {
  if (!article.categories || article.categories.length === 0) return 'Uncategorized'
  const primary = article.categories.find(c => c.isPrimary) || article.categories[0]
  return primary.name
}

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, props.currentPage - 2)
  const end = Math.min(props.totalPages, start + 4)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="articles.length === 0" class="text-center py-12">
      <span class="i-heroicons-document-text w-16 h-16 mx-auto text-gray-300 block mb-4" />
      <p class="text-gray-500">No articles found</p>
    </div>

    <!-- Table -->
    <div v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="article in articles"
              :key="article.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <button
                  class="text-sm font-medium text-gray-900 hover:text-primary text-left"
                  @click="emit('edit', article.id)"
                >
                  {{ article.title }}
                </button>
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusColors[article.status] || 'bg-gray-100 text-gray-700'"
                >
                  {{ article.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-500">
                {{ getPrimaryCategory(article) }}
              </td>
              <td class="py-3 px-4 text-sm text-gray-500">
                {{ formatDate(article.createdAt) }}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                    @click="emit('edit', article.id)"
                  >
                    Edit
                  </button>
                  <button
                    class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    @click="emit('delete', article.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="emit('page-change', currentPage - 1)"
          >
            Prev
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            class="px-3 py-1.5 text-sm rounded border transition-colors"
            :class="page === currentPage
              ? 'bg-primary text-white border-primary'
              : 'border-gray-300 hover:bg-gray-50'"
            @click="emit('page-change', page)"
          >
            {{ page }}
          </button>
          <button
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="emit('page-change', currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
