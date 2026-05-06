<script setup lang="ts">
definePageMeta({ layout: 'blog' })

const route = useRoute()
const slug = route.params.slug as string
const page = computed(() => Number(route.query.page) || 1)
const { getTagBySlug, getArticles } = usePublicApi()

const { data: tagData } = await useAsyncData(
  `tag-${slug}`,
  () => getTagBySlug(slug)
)

const tag = computed(() => tagData.value?.data)

if (!tag.value) {
  throw createError({ statusCode: 404, message: '标签不存在' })
}

const { data: articlesData } = await useAsyncData(
  `tag-articles-${slug}-${page.value}`,
  () => getArticles({ page: page.value, pageSize: 10, tagId: tag.value?.id }),
  { watch: [page] }
)

useSeoMeta({
  title: () => `标签: ${tag.value?.name || ''}`,
  ogTitle: () => `标签: ${tag.value?.name || ''}`,
  description: () => `标签 ${tag.value?.name} 下的所有文章`,
  ogDescription: () => `标签 ${tag.value?.name} 下的所有文章`,
})
</script>

<template>
  <div v-if="tag">
    <div class="mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        标签:
        <span
          class="rounded px-3 py-1 text-lg"
          :style="{ background: (tag.color || '#E5E7EB') + '30', color: tag.color || '#6B7280' }"
        >
          {{ tag.name }}
        </span>
      </h1>
    </div>
    <div v-if="articlesData?.data?.items?.length" class="space-y-4">
      <BlogArticleCard
        v-for="article in articlesData.data.items"
        :key="article.id"
        :article="article"
      />
    </div>
    <div v-else class="text-center py-12 text-gray-400">
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
