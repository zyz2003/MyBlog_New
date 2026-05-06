<script setup lang="ts">
definePageMeta({ layout: 'blog' })

const route = useRoute()
const { getArticles } = usePublicApi()

const page = computed(() => Number(route.query.page) || 1)
const categoryId = computed(() => route.query.categoryId ? Number(route.query.categoryId) : undefined)
const tagId = computed(() => route.query.tagId ? Number(route.query.tagId) : undefined)

const { data } = await useAsyncData(
  `articles-${page.value}-${categoryId.value}-${tagId.value}`,
  () => getArticles({
    page: page.value,
    pageSize: 10,
    categoryId: categoryId.value,
    tagId: tagId.value,
  }),
  { watch: [page, categoryId, tagId] },
)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">文章列表</h1>
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
      base-url="/articles"
    />
  </div>
</template>
