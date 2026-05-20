<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const slug = route.params.slug as string
const page = computed(() => Number(route.query.page) || 1)
const { getTagBySlug, getArticles } = usePublicApi()
const { settings, refresh } = useSiteSettings()

await refresh()

const { data: tagData } = await useAsyncData(
  `tag-${slug}`,
  () => getTagBySlug(slug),
)

const tag = computed(() => tagData.value?.data)
const tagUiMode = computed<'index' | 'default'>(() =>
  String(settings.value.tag_ui || '').trim() === 'index' ? 'index' : 'default',
)

if (!tag.value) {
  throw createError({ statusCode: 404, message: '标签不存在' })
}

const { data: articlesData } = await useAsyncData(
  `tag-articles-${slug}-${page.value}`,
  () => getArticles({ page: page.value, pageSize: 10, tagId: tag.value?.id }),
  { watch: [page] },
)

useSeoMeta({
  title: () => `标签: ${tag.value?.name || ''}`,
  ogTitle: () => `标签: ${tag.value?.name || ''}`,
  description: () => `标签 ${tag.value?.name} 下的所有文章`,
  ogDescription: () => `标签 ${tag.value?.name} 下的所有文章`,
})

const titleStyle = computed(() => ({
  color: 'var(--color-text, #0F172A)',
  fontFamily: 'var(--font-heading, system-ui)',
}))

const emptyStyle = computed(() => ({
  color: 'var(--color-text-muted, #94A3B8)',
}))
</script>

<template>
  <div v-if="tag" class="tag-page">
    <section class="page-hero" :class="{ 'page-hero-index': tagUiMode === 'index' }">
      <h1 class="text-2xl font-bold flex items-center gap-2" :style="titleStyle">
        标签:
        <span
          class="tag-chip rounded px-3 py-1 text-lg"
          :style="{ background: (tag.color || 'var(--color-secondary, #E5E7EB)') + '30', color: tag.color || 'var(--color-text-muted, #6B7280)' }"
        >
          {{ tag.name }}
        </span>
      </h1>
    </section>

    <div v-if="articlesData?.data?.items?.length" :class="tagUiMode === 'index' ? 'post-grid post-grid-double' : 'space-y-4'">
      <template v-if="tagUiMode === 'index'">
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
      该标签下暂无文章
    </div>

    <BlogPagination
      v-if="articlesData?.data"
      :current-page="articlesData.data.page"
      :total-pages="articlesData.data.totalPages"
      :base-url="`/tags/${slug}`"
    />
  </div>
</template>

<style scoped>
.tag-page {
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

.tag-chip {
  backdrop-filter: blur(10px);
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
