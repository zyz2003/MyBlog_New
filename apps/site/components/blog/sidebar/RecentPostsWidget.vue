<script setup lang="ts">
const { getArticles } = usePublicApi()
const { homepage, errorImage } = useSiteSettings()

const { data } = await useAsyncData('recent-posts-widget', () => getArticles({ pageSize: 5 }))
const recentArticles = computed(() => ((data.value as any)?.data?.items || []).slice(0, 5))

function articlePath(article: any): string {
  const date = new Date(article.publishedAt || article.createdAt)
  return `/articles/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${article.id}`
}

function articleCover(article: any): string {
  const fallback = errorImage.value.post_page || `https://picsum.photos/seed/recent-${article.id}/120/120`
  const base = article.coverImage || fallback
  const suffix = homepage.value.pageThumbnailSuffix
  return suffix && base ? `${base}${suffix}` : base
}

function articleDate(article: any): string {
  const date = new Date(article.publishedAt || article.createdAt)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <div class="card-widget card-recent-post">
    <div class="card-title">
      <i class="anzhiyufont anzhiyu-icon-history" />
      <span>最新文章</span>
    </div>

    <div v-if="!recentArticles.length" class="empty-state">暂无文章</div>

    <div v-else class="aside-list">
      <NuxtLink
        v-for="article in recentArticles"
        :key="article.id"
        :to="articlePath(article)"
        class="aside-list-item"
      >
        <div class="thumbnail">
          <img :src="articleCover(article)" :alt="article.title">
        </div>
        <div class="content">
          <div class="title">{{ article.title }}</div>
          <time class="time">{{ articleDate(article) }}</time>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--anzhiyu-secondtext);
}

.empty-state {
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
  padding: 0.75rem 0;
}

.aside-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.aside-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem;
  border-radius: 14px;
  text-decoration: none;
  transition: 0.3s;
}

.aside-list-item:hover {
  background: var(--anzhiyu-main);
  box-shadow: var(--anzhiyu-shadow-main);
}

.thumbnail {
  width: 4rem;
  height: 4rem;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 12px;
  border: var(--style-border-always);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  min-width: 0;
  flex: 1;
}

.title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--anzhiyu-fontcolor);
  font-size: 0.88rem;
  line-height: 1.55;
  font-weight: 700;
  transition: 0.3s;
}

.time {
  display: inline-block;
  margin-top: 0.35rem;
  color: var(--anzhiyu-secondtext);
  font-size: 0.76rem;
}

.aside-list-item:hover .title {
  color: var(--anzhiyu-white);
}

.aside-list-item:hover .time {
  color: color-mix(in srgb, white 82%, transparent);
}
</style>
