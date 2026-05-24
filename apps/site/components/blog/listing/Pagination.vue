<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  baseUrl: string
}>()

const router = useRouter()

function goToPage(page: number) {
  router.push({ path: props.baseUrl, query: page > 1 ? { page } : undefined })
}

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
  <nav v-if="totalPages > 1" class="pagination-container">
    <button
      v-if="currentPage > 1"
      type="button"
      class="pagination-btn pagination-prev"
      :to="`${baseUrl}?page=${currentPage - 1}`"
      @click="goToPage(currentPage - 1)"
    >
      <i class="anzhiyufont anzhiyu-icon-angle-left" />
      <span>上一页</span>
    </button>
    <span v-else class="pagination-btn pagination-prev disabled">
      <i class="anzhiyufont anzhiyu-icon-angle-left" />
      <span>上一页</span>
    </span>

    <template v-for="(page, i) in pages" :key="i">
      <span v-if="page === '...'" class="pagination-ellipsis">...</span>
      <button
        v-else
        type="button"
        class="pagination-page"
        :class="{ active: page === currentPage }"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
    </template>

    <button
      v-if="currentPage < totalPages"
      type="button"
      class="pagination-btn pagination-next"
      :to="`${baseUrl}?page=${currentPage + 1}`"
      @click="goToPage(currentPage + 1)"
    >
      <span>下一页</span>
      <i class="anzhiyufont anzhiyu-icon-angle-right" />
    </button>
    <span v-else class="pagination-btn pagination-next disabled">
      <span>下一页</span>
      <i class="anzhiyufont anzhiyu-icon-angle-right" />
    </span>
  </nav>
</template>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.pagination-btn,
.pagination-page,
.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  color: var(--anzhiyu-fontcolor);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.pagination-btn {
  gap: 0.35rem;
  cursor: pointer;
  text-decoration: none;
}

.pagination-btn:hover:not(.disabled) {
  background: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  transform: translateY(-2px);
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page {
  cursor: pointer;
}

.pagination-page:hover:not(.active) {
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, white);
  border-color: var(--anzhiyu-main);
  color: var(--anzhiyu-main);
}

.pagination-page.active {
  background: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

.pagination-ellipsis {
  border: none;
  background: transparent;
  color: var(--anzhiyu-secondtext);
  cursor: default;
}

@media (max-width: 768px) {
  .pagination-btn span {
    display: none;
  }

  .pagination-btn {
    min-width: 2.5rem;
    padding: 0;
  }
}
</style>
