<script setup lang="ts">
interface Article {
  id: number
  title: string
  publishedAt: string | Date | null
  createdAt: string | Date
}

interface YearGroup {
  year: number
  count: number
  articles: Article[]
}

const { data } = await useFetch<{ code: number; data: { years: YearGroup[] } }>('/api/articles/archive')
const years = computed(() => data.value?.data?.years ?? [])
const totalCount = computed(() => years.value.reduce((s, y) => y.count + s, 0))

function parseDate(input: string | Date | null | undefined): Date {
  if (input instanceof Date) return input
  if (typeof input === 'string') return new Date(input)
  return new Date()
}

function formatDate(date: string | Date | null) {
  const d = parseDate(date)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="card-widget archive-widget">
    <div class="card-header">
      <span class="card-title">归档</span>
      <span class="card-count">{{ totalCount }} 篇</span>
    </div>

    <div v-if="years.length === 0" class="empty-state">
      暂无文章
    </div>

    <div v-else class="archive-timeline">
      <div v-for="yearItem in years" :key="yearItem.year" class="archive-year">
        <div class="year-header">
          <span class="year-text">{{ yearItem.year }}</span>
          <span class="year-count">{{ yearItem.count }} 篇</span>
        </div>

        <div class="month-list">
          <NuxtLink
            v-for="article in yearItem.articles"
            :key="article.id"
            :to="`/articles/${new Date(parseDate(article.publishedAt)).getFullYear()}/${String(new Date(parseDate(article.publishedAt)).getMonth() + 1).padStart(2, '0')}/${article.id}`"
            class="month-item"
          >
            <span class="month-dot" />
            <span class="month-text">{{ formatDate(article.publishedAt) }}</span>
            <span class="article-title">{{ article.title }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-widget {
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  border-radius: 18px;
  box-shadow: var(--anzhiyu-shadow-border);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: var(--style-border-always);
}

.card-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--anzhiyu-secondtext);
  text-transform: uppercase;
}

.card-count {
  font-size: 0.75rem;
  color: var(--anzhiyu-secondtext);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.empty-state {
  text-align: center;
  color: var(--anzhiyu-secondtext);
  font-size: 0.85rem;
  padding: 1rem 0;
}

.archive-timeline {
  padding: 0.75rem 1rem 1rem;
  position: relative;
}

.archive-year {
  margin-bottom: 1.25rem;
}

.archive-year:last-child {
  margin-bottom: 0;
}

.year-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}

.year-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--anzhiyu-main);
  position: relative;
  padding-left: 0.75rem;
}

.year-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--anzhiyu-main);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--anzhiyu-main) 15%, white);
}

.year-count {
  font-size: 0.75rem;
  color: var(--anzhiyu-secondtext);
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}

.month-list {
  position: relative;
  padding-left: 0.5rem;
}

.month-list::before {
  content: '';
  position: absolute;
  left: 0.18rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--anzhiyu-main) 20%, white) 0%,
    color-mix(in srgb, var(--anzhiyu-main) 20%, white) 100%
  );
  opacity: 0.4;
}

.month-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.month-item:hover {
  background: color-mix(in srgb, var(--anzhiyu-main) 5%, white);
}

.month-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 0.35rem;
  border-radius: 50%;
  background: var(--anzhiyu-card-bg);
  border: 2px solid var(--anzhiyu-main);
  z-index: 1;
  transition: all 0.3s ease;
}

.month-item:hover .month-dot {
  background: var(--anzhiyu-main);
  transform: scale(1.2);
}

.month-text {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--anzhiyu-secondtext);
  min-width: 3.5rem;
  text-align: right;
  padding-right: 0.5rem;
}

.article-title {
  flex: 1;
  font-size: 0.85rem;
  color: var(--anzhiyu-fontcolor);
  line-height: 1.5;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.month-item:hover .article-title {
  color: var(--anzhiyu-main);
}

@media (max-width: 768px) {
  .month-text {
    min-width: 3rem;
    font-size: 0.7rem;
  }

  .article-title {
    font-size: 0.8rem;
  }
}
</style>
