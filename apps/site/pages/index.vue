<script setup lang="ts">
definePageMeta({ layout: 'blog' })

const { getArticles } = usePublicApi()
const route = useRoute()
const page = computed(() => Number(route.query.page) || 1)

const { data } = await useAsyncData(
  `home-articles-${page.value}`,
  () => getArticles({ page: page.value, pageSize: 10 }),
  { watch: [page] },
)

if (import.meta.server) {
  useSeoMeta({
    title: '首页',
    ogTitle: '首页',
    description: '最新文章列表',
    ogDescription: '最新文章列表',
  })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">最新文章</h1>
    <div v-if="data?.data?.items?.length" class="space-y-4">
      <BlogArticleCard
        v-for="article in data.data.items"
        :key="article.id"
        :article="article"
      />
    </div>
    <div v-else class="text-center py-12 text-gray-400">
      暂无文章
    </div>
    <BlogPagination
      v-if="data?.data"
      :current-page="data.data.page"
      :total-pages="data.data.totalPages"
      base-url="/"
    />
  </div>
</template>
