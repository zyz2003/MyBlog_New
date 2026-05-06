<script setup lang="ts">
definePageMeta({ layout: 'blog' })

const route = useRoute()
const router = useRouter()
const searchQuery = ref(route.query.q as string || '')
const page = computed(() => Number(route.query.page) || 1)

const { data: searchData } = await useAsyncData(
  `search-${route.query.q}-${route.query.page}`,
  () => {
    if (!route.query.q) return Promise.resolve(null)
    return $fetch<{ code: number; data: { items: any[]; total: number; page: number; totalPages: number } }>('/api/search', {
      params: {
        q: route.query.q,
        page: Number(route.query.page) || 1,
        pageSize: 10,
      },
    })
  },
  { watch: [() => route.query.q, () => route.query.page] },
)

function onSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
  }
}

if (import.meta.server) {
  useSeoMeta({
    title: () => route.query.q ? `搜索: ${route.query.q}` : '搜索',
    description: () => `搜索文章 - ${route.query.q || '请输入关键词'}`,
  })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">搜索</h1>
    <form @submit.prevent="onSearch" class="flex gap-2 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="输入搜索关键词..."
        class="flex-1 rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
      <button
        type="submit"
        class="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        搜索
      </button>
    </form>

    <div v-if="route.query.q">
      <div v-if="searchData?.data?.items?.length" class="space-y-4">
        <BlogArticleCard
          v-for="article in searchData.data.items"
          :key="article.id"
          :article="article"
        />
      </div>
      <div v-else class="text-center py-12 text-gray-400">
        未找到相关文章
      </div>
      <BlogPagination
        v-if="searchData?.data"
        :current-page="searchData.data.page"
        :total-pages="searchData.data.totalPages"
        base-url="/search"
      />
    </div>
    <div v-else class="text-center py-12 text-gray-400">
      请输入关键词进行搜索
    </div>
  </div>
</template>
