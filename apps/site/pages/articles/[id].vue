<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const id = Number(route.params.id)

const { data, pending, error } = await useAsyncData(
  `article-${id}`,
  () => $fetch<{ code: number; data: any }>(`/api/articles/${id}`)
)

if (error.value) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const article = computed(() => data.value?.data)

// Computed fields
const displayDate = computed(() => {
  if (!article.value) return ''
  const date = article.value.publishedAt || article.value.createdAt
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const wordCount = computed(() => {
  const content = article.value?.content || ''
  // Count CJK characters + words
  const cjk = (content.match(/[一-鿿㐀-䶿]/g) || []).length
  const words = (content.match(/[a-zA-Z0-9]+/g) || []).length
  return cjk + words
})

const readingTime = computed(() => {
  const minutes = Math.ceil(wordCount.value / 200)
  return minutes < 1 ? '不到 1 分钟' : `${minutes} 分钟`
})

const categories = computed(() => article.value?.categories || [])
const tags = computed(() => article.value?.tags || [])

const aiSummary = computed(() => article.value?.aiSummary || '')

const coverImage = computed(() => article.value?.coverImage || '')

useSeoMeta({
  title: () => article.value?.seoTitle || article.value?.title || '文章详情',
  ogTitle: () => article.value?.seoTitle || article.value?.title || '文章详情',
  description: () => article.value?.seoDescription || article.value?.excerpt || '',
  ogDescription: () => article.value?.seoDescription || article.value?.excerpt || '',
  ogImage: () => article.value?.coverImage || '',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-32">
      <div class="text-center text-[var(--anzhiyu-secondtext)]">
        <i class="anzhiyufont anzhiyu-icon-spinner animate-spin text-3xl block mb-3" />
        <p class="text-sm">加载中...</p>
      </div>
    </div>

    <!-- Article not found -->
    <div v-else-if="!article" class="text-center py-32 text-[var(--anzhiyu-secondtext)]">
      <i class="anzhiyufont anzhiyu-icon-file-circle-xmark text-5xl block mb-4 opacity-30" />
      <p>文章不存在</p>
    </div>

    <!-- Article content -->
    <article v-else>
      <BlogPostHeader
        :title="article.title"
        :date="displayDate"
        :categories="categories"
        :tags="tags"
        :cover-image="coverImage"
        :reading-time="readingTime"
        :word-count="wordCount"
      />

      <BlogAiSummary
        v-if="aiSummary"
        :summary="aiSummary"
      />

      <div class="max-w-[800px] mx-auto px-4 py-8">
        <BlogArticleContent :content="article.content" />
      </div>

      <BlogPostCopyright
        :author="article.author?.username"
        :title="article.title"
      />

      <!-- Comment section -->
      <div class="border-t border-[var(--style-border-always)] mt-8">
        <BlogCommentWidget />
      </div>
    </article>
  </div>
</template>
