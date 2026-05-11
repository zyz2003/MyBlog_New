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
    <NuxtLink
      v-if="currentPage > 1"
      :to="`${baseUrl}?page=${currentPage - 1}`"
      class="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-lg border border-border hover:bg-surface-2 hover:text-primary transition-colors"
      @click="emit('pageChange', currentPage - 1)"
    >
      上一页
    </NuxtLink>
    <span v-else class="px-4 py-2 text-sm text-muted bg-surface-2 rounded-lg border border-border opacity-50 cursor-not-allowed">
      上一页
    </span>

    <template v-for="(page, i) in pages" :key="i">
      <span v-if="page === '...'" class="px-2 py-2 text-muted">...</span>
      <NuxtLink
        v-else
        :to="`${baseUrl}?page=${page}`"
        class="w-10 h-10 text-sm font-medium rounded-lg flex items-center justify-center transition-colors"
        :class="page === currentPage
          ? 'bg-primary text-white'
          : 'bg-surface text-secondary border border-border hover:bg-surface-2 hover:text-primary'"
        @click="emit('pageChange', page as number)"
      >
        {{ page }}
      </NuxtLink>
    </template>

    <NuxtLink
      v-if="currentPage < totalPages"
      :to="`${baseUrl}?page=${currentPage + 1}`"
      class="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-lg border border-border hover:bg-surface-2 hover:text-primary transition-colors"
      @click="emit('pageChange', currentPage + 1)"
    >
      下一页
    </NuxtLink>
    <span v-else class="px-4 py-2 text-sm text-muted bg-surface-2 rounded-lg border border-border opacity-50 cursor-not-allowed">
      下一页
    </span>
  </nav>
</template>
