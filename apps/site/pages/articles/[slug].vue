<script setup lang="ts">
/**
 * Legacy slug-based route - redirects to new date+ID format
 * Keeps old links working while migrating to /articles/:year/:month/:id
 */
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const slug = route.params.slug as string
const { getArticleBySlug } = usePublicApi()

const { data, error } = await useAsyncData(
  `article-redirect-${slug}`,
  () => getArticleBySlug(slug),
)

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const article = data.value.data
const date = new Date(article.publishedAt || article.createdAt)
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')

await navigateTo(`/articles/${year}/${month}/${article.id}`, { redirectCode: 301 })
</script>

<template>
  <div class="px-4 py-12 text-center text-sm text-[var(--anzhiyu-secondtext)]">
    正在跳转到文章新地址...
  </div>
</template>
