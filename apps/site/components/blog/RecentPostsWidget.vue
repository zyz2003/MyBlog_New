<script setup lang="ts">
const { getArticles } = usePublicApi()
const { data } = await useAsyncData('recent-posts-widget', () => getArticles({ pageSize: 5 }))
const recentArticles = computed(() => ((data.value as any)?.data?.items || []).slice(0, 5))

function articlePath(a: any): string {
  const d = new Date(a.publishedAt || a.createdAt)
  return `/articles/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${a.id}`
}
</script>

<template>
  <div class="card-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="text-xs font-semibold text-[var(--anzhiyu-secondtext)] mb-3 uppercase tracking-wide">最新文章</div>
    <div v-if="!recentArticles.length" class="text-xs text-[var(--anzhiyu-secondtext)] text-center py-2">暂无文章</div>
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="article in recentArticles" :key="article.id" :to="articlePath(article)"
        class="flex items-center gap-2 text-sm text-[var(--anzhiyu-fontcolor)] no-underline hover:text-[var(--anzhiyu-main)] transition-colors"
      >
        <i class="anzhiyufont anzhiyu-icon-file-lines text-xs text-[var(--anzhiyu-secondtext)] shrink-0" />
        <span class="truncate">{{ article.title }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
