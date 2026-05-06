<script setup lang="ts">
definePageMeta({ layout: 'blog' })

const route = useRoute()
const slug = route.params.slug as string
const page = computed(() => Number(route.query.page) || 1)
const { getCategoryBySlug, getArticles } = usePublicApi()

const { data: categoryData } = await useAsyncData(
  `category-${slug}`,
  () => getCategoryBySlug(slug)
)

const category = computed(() => categoryData.value?.data)

if (!category.value) {
  throw createError({ statusCode: 404, message: '分类不存在' })
}

const { data: articlesData } = await useAsyncData(
  `category-articles-${slug}-${page.value}`,
  () => getArticles({ page: page.value, pageSize: 10, categoryId: category.value?.id }),
  { watch: [page] }
)

useHead({
  title: computed(() => `分类: ${category.value?.name || ''}`),
  meta: [
    { name: 'description', content: computed(() => `${category.value?.name} 分类下的所有文章`) },
  ],
})
</script>

<template>
  <div v-if="category">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">分类: {{ category.name }}</h1>
      <p v-if="category.description" class="mt-2 text-gray-500">{{ category.description }}</p>
    </div>
    <div v-if="articlesData?.data?.items?.length" class="space-y-4">
      <BlogArticleCard
        v-for="article in articlesData.data.items"
        :key="article.id"
        :article="article"
      />
    </div>
    <div v-else class="text-center py-12 text-gray-400">
      该分类下暂无文章
    </div>
    <BlogPagination
      v-if="articlesData?.data"
      :current-page="articlesData.data.page"
      :total-pages="articlesData.data.totalPages"
      :base-url="`/categories/${slug}`"
    />
  </div>
</template>
