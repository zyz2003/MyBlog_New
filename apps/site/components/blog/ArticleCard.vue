<script setup lang="ts">
interface ArticleCardProps {
  article: {
    id: number
    title: string
    slug: string
    excerpt?: string | null
    coverImage?: string | null
    publishedAt?: Date | string | null
    createdAt: Date | string
    viewCount?: number
    categories?: Array<{ id: number; name: string; slug: string }>
    tags?: Array<{ id: number; name: string; slug: string; color?: string | null }>
  }
}

const props = defineProps<ArticleCardProps>()

const displayDate = computed(() => {
  const date = props.article.publishedAt || props.article.createdAt
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const articleUrl = computed(() => {
  const date = new Date(props.article.publishedAt || props.article.createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${props.article.id}`
})
</script>

<template>
  <article class="group rounded-lg border border-gray-200 bg-white p-4 sm:p-6 transition-shadow hover:shadow-md">
    <div class="flex gap-4">
      <!-- Cover image -->
      <div v-if="article.coverImage" class="hidden sm:block w-32 h-24 rounded-md overflow-hidden shrink-0">
        <img :src="article.coverImage" :alt="article.title" class="w-full h-full object-cover" />
      </div>
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <NuxtLink :to="articleUrl" class="block">
          <h2 class="text-lg font-semibold truncate group-hover:text-blue-600 transition-colors">
            {{ article.title }}
          </h2>
        </NuxtLink>
        <p v-if="article.excerpt" class="mt-2 text-sm text-gray-500 line-clamp-2">
          {{ article.excerpt }}
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>{{ displayDate }}</span>
          <span v-if="article.viewCount">{{ article.viewCount }} 次阅读</span>
          <NuxtLink
            v-for="cat in article.categories?.slice(0, 2)"
            :key="cat.id"
            :to="`/categories/${cat.slug}`"
            class="rounded bg-blue-50 px-2 py-0.5 text-blue-600 hover:bg-blue-100"
          >
            {{ cat.name }}
          </NuxtLink>
          <NuxtLink
            v-for="tag in article.tags?.slice(0, 3)"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="rounded px-2 py-0.5"
            :style="{ background: (tag.color || '#E5E7EB') + '20', color: tag.color || '#6B7280' }"
          >
            {{ tag.name }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>
