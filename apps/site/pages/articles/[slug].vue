<script setup lang="ts">
/**
 * Legacy slug-based route — redirects to new date+ID format
 * Keeps old links working while migrating to /articles/:year/:month/:id
 */
definePageMeta({ layout: 'blog' })

const route = useRoute()
const slug = route.params.slug as string
const { getArticleBySlug } = usePublicApi()

const { data, error } = await useAsyncData(
  `article-redirect-${slug}`,
  () => getArticleBySlug(slug)
)

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const article = data.value.data
const date = new Date(article.publishedAt || article.createdAt)
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')

// Redirect to new URL format
await navigateTo(`/articles/${year}/${month}/${article.id}`, { redirectCode: 301 })
</script>

<template>
  <div>
    <p>正在跳转...</p>
  </div>
</template>
