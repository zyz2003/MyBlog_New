<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const { data, pending, error } = await useFetch<{
  code: number
  data: { years: Array<{ year: number; count: number; articles: Array<{ id: number; title: string; publishedAt: number | null; createdAt: number }> }> }
}>('/api/articles/archive')

interface ArticleItem { id: number; title: string; publishedAt: number | null; createdAt: number }
interface YearGroup { year: number; count: number; articles: ArticleItem[] }

const years = computed<YearGroup[]>(() => data.value?.data?.years ?? [])

const totalArticles = computed(() => years.value.reduce((sum, y) => sum + y.count, 0))

function formatDate(ts: number | null, fallback: number): string {
  const d = new Date(ts ?? fallback)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function articlePath(article: ArticleItem): string {
  const d = new Date(article.publishedAt ?? article.createdAt)
  return `/articles/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${article.id}`
}

useSeoMeta({
  title: '归档',
  ogTitle: '归档',
  description: '文章归档',
  ogDescription: '文章归档',
})
</script>

<template>
  <div class="archive-page max-w-[800px] mx-auto py-8 px-4">
    <!-- Loading -->
    <div v-if="pending" class="text-center py-16 text-[var(--anzhiyu-secondtext)]">
      <i class="anzhiyufont anzhiyu-icon-spinner animate-spin text-3xl block mb-4" />
      <p>加载中...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 text-[var(--anzhiyu-secondtext)]">
      <p>加载失败，请刷新重试</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!years.length" class="text-center py-16 text-[var(--anzhiyu-secondtext)]">
      <i class="anzhiyufont anzhiyu-icon-box-archive text-5xl block mb-4 opacity-30" />
      <p>暂无文章</p>
    </div>

    <!-- Archive content -->
    <template v-else>
      <h1 class="text-2xl font-bold text-[var(--anzhiyu-fontcolor)] mb-2 text-center">
        文章归档
      </h1>
      <p class="text-center text-sm text-[var(--anzhiyu-secondtext)] mb-8">
        共 {{ totalArticles }} 篇文章
      </p>

      <div class="timeline relative pl-8 md:pl-12">
        <!-- Vertical line -->
        <div class="absolute left-[13px] md:left-[17px] top-0 bottom-0 w-[2px] bg-[var(--anzhiyu-main)] opacity-20" />

        <div v-for="yearGroup in years" :key="yearGroup.year" class="mb-10">
          <!-- Year heading -->
          <div class="flex items-center gap-3 mb-4 relative">
            <div
              class="absolute -left-[32px] md:-left-[37px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--anzhiyu-main)] border-3 border-[var(--anzhiyu-card-bg)] z-1"
            />
            <h2 class="text-xl font-semibold text-[var(--anzhiyu-fontcolor)]">
              {{ yearGroup.year }}
            </h2>
            <span class="text-sm text-[var(--anzhiyu-secondtext)]">
              {{ yearGroup.count }} 篇
            </span>
          </div>

          <!-- Article list -->
          <div class="ml-4 space-y-2">
            <NuxtLink
              v-for="article in yearGroup.articles"
              :key="article.id"
              :to="articlePath(article)"
              class="flex items-baseline gap-3 py-2 group no-underline hover:bg-[var(--anzhiyu-main)]/5 rounded-lg px-3 -mx-3 transition-colors"
            >
              <span class="text-xs text-[var(--anzhiyu-secondtext)] font-mono whitespace-nowrap min-w-[45px]">
                {{ formatDate(article.publishedAt, article.createdAt) }}
              </span>
              <span class="text-sm text-[var(--anzhiyu-fontcolor)] group-hover:text-[var(--anzhiyu-main)] transition-colors truncate">
                {{ article.title }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
