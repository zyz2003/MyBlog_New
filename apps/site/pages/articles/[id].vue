<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const id = Number(route.params.id)
const { getArticle } = usePublicApi()

const { data, error } = await useAsyncData(
  `article-legacy-${id}`,
  () => getArticle(id),
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
