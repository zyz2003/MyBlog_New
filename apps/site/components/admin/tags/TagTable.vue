<script setup lang="ts">
const props = defineProps<{
  tags: Array<{
    id: number
    name: string
    slug: string
    color: string | null
    createdAt: Date | string
  }>
  loading: boolean
}>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
}>()

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="tags.length === 0" class="text-center py-12">
      <span class="i-heroicons-tag w-16 h-16 mx-auto text-gray-300 block mb-4" />
      <p class="text-gray-500">No tags yet</p>
    </div>

    <!-- Table -->
    <div v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 w-10">Color</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Slug</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tag in tags"
              :key="tag.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div
                  class="w-5 h-5 rounded-full border border-gray-200"
                  :style="{ backgroundColor: tag.color || '#3B82F6' }"
                />
              </td>
              <td class="py-3 px-4 text-sm font-medium text-gray-900">
                {{ tag.name }}
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{{ tag.slug }}</span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-500">
                {{ formatDate(tag.createdAt) }}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-1 text-gray-400 hover:text-primary rounded transition-colors"
                    title="Edit"
                    @click="emit('edit', tag.id)"
                  >
                    <span class="i-heroicons-pencil w-4 h-4" />
                  </button>
                  <button
                    class="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Delete"
                    @click="emit('delete', tag.id)"
                  >
                    <span class="i-heroicons-trash w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
