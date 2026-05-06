<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  baseUrl: string
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const pages = computed(() => {
  const result: (number | string)[] = []
  const { currentPage, totalPages } = props
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) result.push(i)
  }
  else {
    result.push(1)
    if (currentPage > 3) result.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      result.push(i)
    }
    if (currentPage < totalPages - 2) result.push('...')
    result.push(totalPages)
  }
  return result
})
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-8">
    <button
      :disabled="currentPage <= 1"
      class="px-3 py-1 rounded text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
      @click="emit('pageChange', currentPage - 1)"
    >
      上一页
    </button>
    <template v-for="(page, i) in pages" :key="i">
      <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
      <NuxtLink
        v-else
        :to="`${baseUrl}?page=${page}`"
        class="px-3 py-1 rounded text-sm border"
        :class="page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'"
        @click="emit('pageChange', page as number)"
      >
        {{ page }}
      </NuxtLink>
    </template>
    <button
      :disabled="currentPage >= totalPages"
      class="px-3 py-1 rounded text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
      @click="emit('pageChange', currentPage + 1)"
    >
      下一页
    </button>
  </nav>
</template>
