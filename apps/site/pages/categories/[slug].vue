<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const slug = route.params.slug as string
const page = computed(() => Number(route.query.page) || 1)
const { getCategoryBySlug, getArticles } = usePublicApi()
const { settings, refresh } = useSiteSettings()

await refresh()

const { data: categoryData } = await useAsyncData(
  `category-${slug}`,
  () => getCategoryBySlug(slug),
)

const category = computed(() => categoryData.value?.data)
const categoryUiMode = computed<'index' | 'default'>(() =>
  String(settings.value.category_ui || '').trim() === 'index' ? 'index' : 'default',
)

if (!category.value) {
  throw createError({ statusCode: 404, message: '分类不存在' })
}

const { data: articlesData } = await useAsyncData(
  `category-articles-${slug}-${page.value}`,
  () => getArticles({ page: page.value, pageSize: 10, categoryId: category.value?.id }),
  { watch: [page] },
)

useSeoMeta({
  title: () => `分类: ${category.value?.name || ''}`,
  ogTitle: () => `分类: ${category.value?.name || ''}`,
  description: () => `${category.value?.name} 分类下的所有文章`,
  ogDescription: () => `${category.value?.name} 分类下的所有文章`,
})

const titleStyle = computed(() => ({
  color: 'var(--color-text, #0F172A)',
  fontFamily: 'var(--font-heading, system-ui)',
}))

const descStyle = computed(() => ({
  color: 'var(--color-text-muted, #64748B)',
}))

const emptyStyle = computed(() => ({
  color: 'var(--color-text-muted, #94A3B8)',
}))
</script>

<template>
  <div v-if="category" class="category-page">
    <section class="page-hero" :class="{ 'page-hero-index': categoryUiMode === 'index' }">
      <h1 class="text-2xl font-bold" :style="titleStyle">分类: {{ category.name }}</h1>
      <p v-if="category.description" class="mt-2" :style="descStyle">{{ category.description }}</p>
    </section>

    <div v-if="articlesData?.data?.items?.length" :class="categoryUiMode === 'index' ? 'post-grid post-grid-double' : 'space-y-4'">
      <template v-if="categoryUiMode === 'index'">
        <BlogPostItem
          v-for="(article, index) in articlesData.data.items"
          :key="article.id"
          :article="article as any"
          :index="index"
        />
      </template>

      <template v-else>
        <BlogArticleCard
          v-for="article in articlesData.data.items"
          :key="article.id"
          :article="article"
        />
      </template>
    </div>

    <div v-else class="text-center py-12" :style="emptyStyle">
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

<style scoped>
.category-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-hero {
  padding: 1.25rem 1.35rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
}

.page-hero.page-hero-index {
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--anzhiyu-main) 14%, transparent), transparent 18rem),
    linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-card-bg) 88%, white 12%), var(--anzhiyu-card-bg));
}

.post-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 1180px) {
  .post-grid.post-grid-double {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
</style>
