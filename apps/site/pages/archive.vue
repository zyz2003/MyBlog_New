<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const { data, pending, error } = await useFetch<{
  code: number
  data: {
    years: Array<{
      year: number
      count: number
      articles: Array<{
        id: number
        title: string
        publishedAt: number | null
        createdAt: number
        coverImage: string | null
        categories: Array<{ name: string; slug: string }>
      }>
    }>
  }
}>('/api/articles/archive')

const { observe, cleanup } = useScrollReveal()

// Template ref for timeline item elements
const timelineItemRefs = ref<HTMLElement[]>([])

interface CategoryBadge {
  name: string
  slug: string
}

interface ArticleItem {
  id: number
  title: string
  publishedAt: number | null
  createdAt: number
  coverImage: string | null
  categories: CategoryBadge[]
}

interface YearGroup {
  year: number
  count: number
  articles: ArticleItem[]
}

const years = computed<YearGroup[]>(() => data.value?.data?.years ?? [])
const totalArticles = computed(() => years.value.reduce((sum, yearGroup) => sum + yearGroup.count, 0))

function formatDate(ts: number | null, fallback: number): string {
  const date = new Date(ts ?? fallback)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function articlePath(article: ArticleItem): string {
  const date = new Date(article.publishedAt ?? article.createdAt)
  return `/articles/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${article.id}`
}

// Compute cascade delay class for a timeline item based on its overall index
function timelineItemDelayClass(yearIndex: number, articleIndex: number): string {
  const overallIndex = yearIndex * 3 + articleIndex + 1
  const delay = Math.min(overallIndex, 6)
  return delay > 0 ? `scroll-reveal-delay-${delay}` : ''
}

onMounted(() => {
  nextTick(() => {
    timelineItemRefs.value.forEach((el) => {
      observe(el)
    })
  })
})

onUnmounted(() => {
  cleanup()
})

useSeoMeta({
  title: '文章归档',
  ogTitle: '文章归档',
  description: '按时间线查看博客文章归档。',
  ogDescription: '按时间线查看博客文章归档。',
})
</script>

<template>
  <div class="archive-page mx-auto max-w-[980px] px-4 py-8">
    <section class="archive-hero">
      <span class="archive-badge">Archive</span>
      <h1 class="archive-title">文章归档</h1>
      <p class="archive-description">
        按发布时间回看内容轨迹，把博客从一篇篇文章重新串成时间线。
      </p>
      <div class="archive-total">
        当前共收录 {{ totalArticles }} 篇文章
      </div>
    </section>

    <div v-if="pending" class="archive-state-card">
      正在加载归档内容...
    </div>

    <div v-else-if="error" class="archive-state-card">
      归档内容加载失败，请稍后重试。
    </div>

    <div v-else-if="!years.length" class="archive-state-card">
      暂无文章归档。
    </div>

    <div v-else id="archive" class="archive-shell">
      <div class="article-sort-title">
        文章总览 - {{ totalArticles }}
      </div>

      <div class="timeline">
        <div class="timeline-line" />

        <section
          v-for="(yearGroup, yearIndex) in years"
          :key="yearGroup.year"
          class="timeline-group"
        >
          <div class="timeline-heading">
            <span class="timeline-dot" />
            <h2 class="timeline-year">{{ yearGroup.year }}</h2>
            <span class="timeline-count">{{ yearGroup.count }} 篇</span>
          </div>

          <div class="timeline-list">
            <NuxtLink
              v-for="(article, articleIndex) in yearGroup.articles"
              :key="article.id"
              :ref="(el) => { if (el?.$el) timelineItemRefs.push(el.$el) }"
              :to="articlePath(article)"
              class="timeline-item scroll-reveal-left"
              :class="timelineItemDelayClass(yearIndex, articleIndex)"
            >
              <div class="timeline-item-content">
                <div class="timeline-item-text">
                  <span class="timeline-date">{{ formatDate(article.publishedAt, article.createdAt) }}</span>
                  <span class="timeline-item-title">{{ article.title }}</span>
                  <div v-if="article.categories?.length" class="timeline-categories">
                    <NuxtLink
                      v-for="cat in article.categories"
                      :key="cat.slug"
                      :to="`/categories/${cat.slug}`"
                      class="timeline-cat-badge"
                    >
                      {{ cat.name }}
                    </NuxtLink>
                  </div>
                </div>
                <img
                  v-if="article.coverImage"
                  :src="article.coverImage"
                  alt=""
                  class="timeline-thumb"
                  loading="lazy"
                />
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-hero {
  margin-bottom: 1.8rem;
  padding: 1.65rem 1.75rem;
  border: var(--style-border-always);
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--anzhiyu-main) 14%, transparent) 0, transparent 16rem),
    linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-card-bg) 88%, white 12%), var(--anzhiyu-card-bg));
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.archive-badge {
  display: inline-flex;
  padding: 0.36rem 0.72rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  color: var(--anzhiyu-main);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.archive-title {
  margin-top: 0.85rem;
  color: var(--anzhiyu-fontcolor);
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 900;
  line-height: 1.05;
}

.archive-description {
  margin-top: 0.65rem;
  color: var(--anzhiyu-secondtext);
  font-size: 0.98rem;
  line-height: 1.8;
}

.archive-total {
  margin-top: 1rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 0.95rem;
  font-weight: 700;
}

.archive-state-card {
  padding: 2.2rem 1.5rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
  text-align: center;
  color: var(--anzhiyu-secondtext);
}

.archive-shell {
  padding: 1.5rem 1.6rem 1.25rem;
  border: var(--style-border-always);
  border-radius: 30px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
}

.article-sort-title {
  margin-bottom: 1.5rem;
  color: var(--anzhiyu-fontcolor);
  font-size: 1.35rem;
  font-weight: 800;
}

.timeline {
  position: relative;
  padding-left: 2.4rem;
}

.timeline-line {
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: color-mix(in srgb, var(--anzhiyu-main) 22%, transparent);
}

.timeline-group {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-heading {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.timeline-dot {
  position: absolute;
  left: -2rem;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  background: var(--anzhiyu-main);
  border: 4px solid var(--anzhiyu-card-bg);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--anzhiyu-main) 25%, transparent);
}

.timeline-year {
  color: var(--anzhiyu-fontcolor);
  font-size: 1.45rem;
  font-weight: 800;
}

.timeline-count {
  color: var(--anzhiyu-secondtext);
  font-size: 0.88rem;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.timeline-item {
  display: block;
  padding: 0.55rem 0.65rem 0.55rem 1.1rem;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
}

.timeline-item:hover {
  transform: translateX(4px);
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, transparent);
  box-shadow: 0 4px 16px var(--anzhiyu-shadow-border);
}

.timeline-item-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.timeline-item-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.timeline-date {
  color: var(--anzhiyu-secondtext);
  font-size: 0.8rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.timeline-item-title {
  color: var(--anzhiyu-fontcolor);
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 600;
}

.timeline-item:hover .timeline-item-title {
  color: var(--anzhiyu-main);
}

.timeline-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.15rem;
}

.timeline-cat-badge {
  display: inline-flex;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  color: var(--anzhiyu-main);
  font-size: 0.72rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.timeline-cat-badge:hover {
  background: var(--anzhiyu-main);
  color: white;
}

.timeline-thumb {
  width: 76px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: var(--style-border-always);
}

@media (max-width: 768px) {
  .archive-hero,
  .archive-shell {
    padding: 1.2rem 1.1rem;
  }

  .timeline {
    padding-left: 1.9rem;
  }

  .timeline-dot {
    left: -1.55rem;
  }

  .timeline-item {
    padding-inline: 0.65rem;
  }
}
</style>
