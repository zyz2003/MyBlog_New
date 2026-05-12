<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const id = Number(route.params.id)
const { getArticle } = usePublicApi()

const { data, error } = await useAsyncData(
  `article-${id}`,
  () => getArticle(id)
)

if (error.value) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const article = computed(() => data.value?.data)

useSeoMeta({
  title: () => article.value?.seoTitle || article.value?.title || '文章详情',
  ogTitle: () => article.value?.seoTitle || article.value?.title || '文章详情',
  description: () => article.value?.seoDescription || article.value?.excerpt || '',
  ogDescription: () => article.value?.seoDescription || article.value?.excerpt || '',
  ogImage: () => article.value?.coverImage || '',
  twitterCard: 'summary_large_image',
})

const displayDate = computed(() => {
  if (!article.value) return ''
  const date = article.value.publishedAt || article.value.createdAt
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const titleStyle = computed(() => ({
  color: 'var(--color-text, #0F172A)',
  fontFamily: 'var(--font-heading, system-ui)',
}))

const metaStyle = computed(() => ({
  color: 'var(--color-text-muted, #64748B)',
}))

const categoryBadgeStyle = computed(() => ({
  background: 'var(--color-primary, #3B82F6)15',
  color: 'var(--color-primary, #3B82F6)',
  borderRadius: 'var(--radius-small, 4px)',
  padding: '2px 8px',
  fontSize: '0.75rem',
  transition: 'background var(--transition-fast, 0.15s ease)',
}))

const borderStyle = computed(() => ({
  borderTop: '1px solid var(--color-border, #E2E8F0)',
}))

const linkStyle = computed(() => ({
  color: 'var(--color-primary, #3B82F6)',
}))
</script>

<template>
  <div v-if="article">
    <!-- Article header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold mb-4" :style="titleStyle">{{ article.title }}</h1>
      <div class="flex flex-wrap items-center gap-3 text-sm" :style="metaStyle">
        <span>{{ displayDate }}</span>
        <span v-if="article.author">{{ article.author.displayName || article.author.username }}</span>
        <span v-if="article.viewCount">{{ article.viewCount }} 次阅读</span>
      </div>
      <div v-if="article.categories?.length || article.tags?.length" class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="cat in article.categories"
          :key="cat.id"
          :to="`/categories/${cat.slug}`"
          :style="categoryBadgeStyle"
        >
          {{ cat.name }}
        </NuxtLink>
        <NuxtLink
          v-for="tag in article.tags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="rounded px-2 py-0.5 text-xs"
          :style="{ background: (tag.color || 'var(--color-secondary, #E5E7EB)') + '20', color: tag.color || 'var(--color-text-muted, #6B7280)' }"
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
    <div class="card mt-8 max-w-3xl mx-auto">
      <BlogArticleContent :content="article.content || ''" />
    </div>

    <!-- Back link -->
    <div class="mt-12 pt-6" :style="borderStyle">
      <NuxtLink to="/articles" class="hover:underline text-sm" :style="linkStyle">
        &larr; 返回文章列表
      </NuxtLink>
    </div>
  </div>
</template>
