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

const coverUrl = computed(() => {
  return props.article.coverImage || `https://picsum.photos/seed/${props.article.id}/400/240`
})
</script>

<template>
  <article class="group bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-border">
    <NuxtLink :to="articleUrl" class="block">
      <!-- Cover image -->
      <div class="relative h-48 overflow-hidden bg-surface-2">
        <img
          :src="coverUrl"
          :alt="article.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        >
        <!-- Category badge -->
        <div v-if="article.categories?.length" class="absolute top-4 left-4">
          <span class="px-3 py-1 text-xs font-medium bg-surface/90 backdrop-blur-sm text-accent rounded-full shadow-sm">
            {{ article.categories[0].name }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5">
        <h2 class="text-lg font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {{ article.title }}
        </h2>
        <p v-if="article.excerpt" class="text-sm text-muted line-clamp-2 mb-4">
          {{ article.excerpt }}
        </p>

        <!-- Meta -->
        <div class="flex items-center justify-between text-xs text-muted">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1">
              <span class="i-heroicons-calendar w-4 h-4" />
              {{ displayDate }}
            </span>
            <span v-if="article.viewCount" class="flex items-center gap-1">
              <span class="i-heroicons-eye w-4 h-4" />
              {{ article.viewCount }}
            </span>
          </div>

          <!-- Tags -->
          <div v-if="article.tags?.length" class="flex gap-1">
            <span
              v-for="tag in article.tags.slice(0, 2)"
              :key="tag.id"
              class="px-2 py-0.5 text-xs rounded-full bg-surface-2 text-accent"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
