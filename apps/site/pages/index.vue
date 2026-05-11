<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const { getArticles } = usePublicApi()
const route = useRoute()
const page = computed(() => Number(route.query.page) || 1)

const { data } = await useAsyncData(
  `home-articles-${page.value}`,
  () => getArticles({ page: page.value, pageSize: 10 }),
  { watch: [page] },
)

useSeoMeta({
  title: '首页',
  ogTitle: '首页',
  description: '分享技术见解，记录生活感悟',
  ogDescription: '分享技术见解，记录生活感悟',
})

const router = useRouter()
const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl sm:text-5xl font-bold text-primary mb-4">
        分享技术见解<br class="sm:hidden" /> 记录生活感悟
      </h1>
      <p class="text-lg text-muted mb-8 max-w-2xl mx-auto">
        探索代码的乐趣，品味生活的美好
      </p>
      <!-- Search bar -->
      <form @submit.prevent="handleSearch" class="max-w-xl mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章..."
            class="w-full px-5 py-3 pr-12 text-base rounded-xl border border-border bg-surface text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all"
          >
          <button
            type="submit"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <span class="i-heroicons-magnifying-glass w-5 h-5" />
          </button>
        </div>
      </form>
    </div>

    <!-- Section title -->
    <div class="flex items-center gap-3 mb-6">
      <h2 class="text-xl font-semibold text-primary">最新文章</h2>
      <div class="flex-1 h-px bg-border" />
    </div>

    <!-- Articles -->
    <div v-if="data?.data?.items?.length" class="space-y-4">
      <BlogArticleCard
        v-for="article in data.data.items"
        :key="article.id"
        :article="article"
      />
    </div>
    <div v-else class="text-center py-16 text-muted">
      <span class="i-heroicons-document-text w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>暂无文章</p>
    </div>

    <BlogPagination
      v-if="data?.data"
      :current-page="data.data.page"
      :total-pages="data.data.totalPages"
      base-url="/"
    />
  </div>
</template>