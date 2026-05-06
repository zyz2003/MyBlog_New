<script setup lang="ts">
definePageMeta({ layout: 'blog' })

const route = useRoute()
const slug = route.params.slug as string
const { getArticleBySlug } = usePublicApi()

const { data, error } = await useAsyncData(
  `article-${slug}`,
  () => getArticleBySlug(slug)
)

if (error.value) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const article = computed(() => data.value?.data)

useHead({
  title: computed(() => article.value?.seoTitle || article.value?.title || '文章详情'),
  meta: [
    { name: 'description', content: computed(() => article.value?.seoDescription || article.value?.excerpt || '') },
    { property: 'og:title', content: computed(() => article.value?.seoTitle || article.value?.title || '') },
    { property: 'og:description', content: computed(() => article.value?.seoDescription || article.value?.excerpt || '') },
    { property: 'og:image', content: computed(() => article.value?.coverImage || '') },
  ],
})

const displayDate = computed(() => {
  if (!article.value) return ''
  const date = article.value.publishedAt || article.value.createdAt
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})
</script>

<template>
  <div v-if="article">
    <!-- Article header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold mb-4">{{ article.title }}</h1>
      <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>{{ displayDate }}</span>
        <span v-if="article.author">{{ article.author.displayName || article.author.username }}</span>
        <span v-if="article.viewCount">{{ article.viewCount }} 次阅读</span>
      </div>
      <div v-if="article.categories?.length || article.tags?.length" class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="cat in article.categories"
          :key="cat.id"
          :to="`/categories/${cat.slug}`"
          class="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100"
        >
          {{ cat.name }}
        </NuxtLink>
        <NuxtLink
          v-for="tag in article.tags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="rounded px-2 py-0.5 text-xs"
          :style="{ background: (tag.color || '#E5E7EB') + '20', color: tag.color || '#6B7280' }"
        >
          {{ tag.name }}
        </NuxtLink>
      </div>
    </header>

    <!-- Cover image -->
    <div v-if="article.coverImage" class="mb-8 rounded-lg overflow-hidden">
      <img :src="article.coverImage" :alt="article.title" class="w-full h-auto object-cover max-h-96" />
    </div>

    <!-- Article content -->
    <BlogArticleContent :content="article.content || ''" />

    <!-- Back link -->
    <div class="mt-12 pt-6 border-t border-gray-200">
      <NuxtLink to="/articles" class="text-blue-600 hover:underline text-sm">
        &larr; 返回文章列表
      </NuxtLink>
    </div>
  </div>
</template>
