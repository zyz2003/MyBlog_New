<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

definePageMeta({ layout: 'frontend-default' })

interface SearchPageArticle {
  id: number
  title: string
  slug?: string | null
  excerpt?: string | null
  coverImage?: string | null
  publishedAt?: string | null
  createdAt?: string | null
  categories?: Array<{ id: number; name: string; slug: string }>
  tags?: Array<{ id: number; name: string; slug: string; color?: string | null }>
}

interface SearchPageResponse {
  code: number
  data: {
    items: SearchPageArticle[]
    total: number
    page: number
    pageSize: number
  }
}

const route = useRoute()
const router = useRouter()
const { search, algoliaSearch, homepage, errorImage } = useSiteSettings()

const searchQuery = ref(String(route.query.q || ''))
const keyword = computed(() => String(route.query.q || '').trim())
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const hasKeyword = computed(() => Boolean(keyword.value))
const currentProvider = computed(() => search.value.provider || 'local')
const pageSize = computed(() => currentProvider.value === 'algolia'
  ? Math.max(1, Number(algoliaSearch.value.perPage || 6))
  : 10)

const { data: searchData, pending, error } = await useAsyncData(
  () => `search-${currentProvider.value}-${keyword.value}-${page.value}-${pageSize.value}`,
  () => {
    if (!keyword.value) {
      return Promise.resolve(null)
    }

    return $fetch<SearchPageResponse>('/api/search', {
      params: {
        q: keyword.value,
        page: page.value,
        pageSize: pageSize.value,
        provider: currentProvider.value,
      },
    })
  },
  {
    watch: [keyword, page, currentProvider, pageSize],
  },
)

const items = computed(() =>
  (searchData.value?.data?.items ?? []).map(article => ({
    ...article,
    slug: article.slug || '',
    createdAt: article.createdAt || article.publishedAt || new Date().toISOString(),
  })),
)
const total = computed(() => searchData.value?.data?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function resolveCover(article: SearchPageArticle) {
  const fallback = errorImage.value.post_page || `https://picsum.photos/seed/${article.id}/400/240`
  const base = article.coverImage || fallback
  const suffix = homepage.value.pageThumbnailSuffix
  return suffix && base ? `${base}${suffix}` : base
}

function articlePath(article: SearchPageArticle) {
  const sourceDate = article.publishedAt || article.createdAt
  if (!sourceDate) return `/articles/${article.id}`
  const date = new Date(sourceDate)
  if (Number.isNaN(date.getTime())) return `/articles/${article.id}`
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${article.id}`
}

function formatDate(article: SearchPageArticle) {
  const sourceDate = article.publishedAt || article.createdAt
  if (!sourceDate) return ''
  return new Date(sourceDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function highlightKeyword(text: string, term: string) {
  if (!term) return text
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="search-keyword">$1</mark>',
  )
}

function submitSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    router.push({ path: '/search' })
    return
  }

  router.push({
    path: '/search',
    query: { q, page: 1 },
  })
}

function buildPageLink(targetPage: number) {
  return {
    path: '/search',
    query: {
      q: keyword.value,
      page: targetPage,
    },
  }
}

watch(
  () => route.query.q,
  (value) => {
    searchQuery.value = String(value || '')
  },
)

useSeoMeta({
  title: () => keyword.value ? `搜索：${keyword.value}` : '搜索文章',
  description: () => keyword.value ? `查看与"${keyword.value}"相关的文章搜索结果。` : '按关键词搜索博客文章内容。',
})
</script>

<template>
  <div id="search-page" class="search-page-container">
    <!-- Search input area -->
    <div class="search-input-area">
      <div class="search-input-icon-wrap">
        <i class="anzhiyufont anzhiyu-icon-magnifying-glass" />
      </div>
      <form class="search-input-form" @submit.prevent="submitSearch">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input-field"
          placeholder="输入关键词搜索文章..."
        >
        <button type="submit" class="search-input-submit">
          <i class="anzhiyufont anzhiyu-icon-magnifying-glass" />
        </button>
      </form>
    </div>

    <!-- Empty state -->
    <div v-if="!hasKeyword" class="search-empty-state">
      <i class="anzhiyufont anzhiyu-icon-magnifying-glass search-empty-icon" />
      <p class="search-empty-title">输入关键词开始搜索</p>
      <p class="search-empty-desc">支持搜索文章标题、摘要与关键词内容</p>
    </div>

    <!-- Search results -->
    <template v-else>
      <div class="search-result-header">
        <span class="search-result-count">
          找到 <em>{{ total }}</em> 篇与"<strong>{{ keyword }}</strong>"相关的文章
        </span>
        <span v-if="totalPages > 1" class="search-result-page-info">
          第 {{ page }}/{{ totalPages }} 页
        </span>
      </div>

      <!-- State cards -->
      <div v-if="currentProvider === 'docsearch'" class="search-state-card">
        <i class="anzhiyufont anzhiyu-icon-info-circle" />
        <span>当前选择了 DocSearch，搜索页仅支持本地搜索或 Algolia 数据源。</span>
      </div>

      <div v-else-if="pending" class="search-state-card">
        <i class="anzhiyufont anzhiyu-icon-spinner animate-spin" />
        <span>正在搜索中...</span>
      </div>

      <div v-else-if="error" class="search-state-card">
        <i class="anzhiyufont anzhiyu-icon-exclamation-triangle" />
        <span>搜索加载失败，请稍后重试。</span>
      </div>

      <div v-else-if="items.length === 0" class="search-state-card">
        <i class="anzhiyufont anzhiyu-icon-file-lines" />
        <span>没有找到相关文章，试试更简短的关键词。</span>
      </div>

      <!-- Result list -->
      <div v-else class="search-result-list">
        <NuxtLink
          v-for="article in items"
          :key="`${article.id}-${article.slug || ''}`"
          :to="articlePath(article)"
          class="search-result-item"
        >
          <div v-if="article.coverImage" class="search-result-cover">
            <img :src="resolveCover(article)" :alt="article.title" loading="lazy" @error="($event.target as HTMLImageElement).style.display = 'none'">
          </div>
          <div class="search-result-content">
            <div class="search-result-title" v-html="highlightKeyword(article.title, keyword)" />
            <div v-if="article.excerpt" class="search-result-excerpt" v-html="highlightKeyword(article.excerpt.slice(0, 160), keyword)" />
            <div class="search-result-meta">
              <span class="search-result-date">
                <i class="anzhiyufont anzhiyu-icon-clock" />
                {{ formatDate(article) }}
              </span>
              <span v-if="article.categories?.length" class="search-result-category">
                <i class="anzhiyufont anzhiyu-icon-folder" />
                {{ article.categories[0].name }}
              </span>
              <span v-if="article.tags?.length" class="search-result-tags">
                <i class="anzhiyufont anzhiyu-icon-tags" />
                {{ article.tags.slice(0, 3).map(t => t.name).join(' / ') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="search-pagination">
        <NuxtLink
          v-if="page > 1"
          :to="buildPageLink(page - 1)"
          class="search-pagination-btn prev"
        >
          <i class="anzhiyufont anzhiyu-icon-arrow-left" />
          上一页
        </NuxtLink>
        <span v-else class="search-pagination-btn disabled">上一页</span>

        <div class="search-pagination-pages">
          <NuxtLink
            v-for="p in totalPages"
            :key="p"
            :to="buildPageLink(p)"
            class="search-pagination-num"
            :class="{ active: p === page }"
          >
            {{ p }}
          </NuxtLink>
        </div>

        <NuxtLink
          v-if="page < totalPages"
          :to="buildPageLink(page + 1)"
          class="search-pagination-btn next"
        >
          下一页
          <i class="anzhiyufont anzhiyu-icon-arrow-right" />
        </NuxtLink>
        <span v-else class="search-pagination-btn disabled">下一页</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* --- Page container --- */
.search-page-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}

/* --- Search input area (anzhiyu style) --- */
.search-input-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.3s;
}

.search-input-area:hover {
  box-shadow: var(--anzhiyu-shadow-main);
  border-color: var(--anzhiyu-main);
}

.search-input-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, white);
  color: var(--anzhiyu-main);
  font-size: 1.1rem;
  transition: 0.3s;
}

.search-input-area:hover .search-input-icon-wrap {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

.search-input-form {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.5rem;
}

.search-input-field {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--anzhiyu-fontcolor);
  font-size: 1rem;
  outline: none;
  min-height: 2.5rem;
}

.search-input-field::placeholder {
  color: var(--anzhiyu-secondtext);
}

.search-input-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: none;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  color: var(--anzhiyu-main);
  cursor: pointer;
  font-size: 0.95rem;
  transition: 0.3s;
}

.search-input-submit:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  transform: translateY(-1px);
}

/* --- Empty state --- */
.search-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
}

.search-empty-icon {
  font-size: 3rem;
  color: color-mix(in srgb, var(--anzhiyu-main) 40%, transparent);
  margin-bottom: 1rem;
}

.search-empty-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  margin-bottom: 0.5rem;
}

.search-empty-desc {
  font-size: 0.9rem;
  color: var(--anzhiyu-secondtext);
}

/* --- Result header --- */
.search-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
}

.search-result-count {
  font-size: 0.9rem;
  color: var(--anzhiyu-secondtext);
}

.search-result-count em {
  font-style: normal;
  font-weight: 700;
  color: var(--anzhiyu-main);
}

.search-result-count strong {
  color: var(--anzhiyu-main);
}

.search-result-page-info {
  font-size: 0.8rem;
  color: var(--anzhiyu-secondtext);
}

/* --- State card --- */
.search-state-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  color: var(--anzhiyu-secondtext);
  font-size: 0.9rem;
}

.search-state-card i {
  color: var(--anzhiyu-main);
  font-size: 1.2rem;
}

/* --- Result list (anzhiyu local-search style) --- */
.search-result-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: none;
  overflow-y: visible;
}

.search-result-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem 1rem 2rem;
  border-radius: 12px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  text-decoration: none;
  transition: all 0.3s ease;
}

.search-result-item:hover {
  border-color: var(--anzhiyu-main);
  box-shadow: var(--anzhiyu-shadow-main);
  transform: translateY(-2px);
}

/* Dot indicator (anzhiyu local-search style) */
.search-result-item::before {
  content: '';
  position: absolute;
  top: 1.2rem;
  left: 0.75rem;
  width: 0.45rem;
  height: 0.45rem;
  border: 3px solid var(--anzhiyu-main);
  border-radius: 50%;
  background: transparent;
  transition: 0.2s;
}

.search-result-item:hover::before {
  border-color: var(--anzhiyu-main);
  background: var(--anzhiyu-main);
}

/* --- Result cover --- */
.search-result-cover {
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.search-result-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.search-result-item:hover .search-result-cover img {
  transform: scale(1.05);
}

/* --- Result content --- */
.search-result-content {
  flex: 1;
  min-width: 0;
}

.search-result-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  line-height: 1.5;
  margin-bottom: 0.35rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-result-item:hover .search-result-title {
  color: var(--anzhiyu-main);
}

.search-result-excerpt {
  font-size: 0.85rem;
  color: var(--anzhiyu-secondtext);
  line-height: 1.7;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

/* Keyword highlight */
.search-keyword {
  color: var(--anzhiyu-main);
  font-weight: bold;
  border-radius: 2px;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  padding: 0 2px;
}

/* --- Result meta --- */
.search-result-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--anzhiyu-secondtext);
}

.search-result-meta i {
  font-size: 0.85rem;
  margin-right: 0.2rem;
}

.search-result-date,
.search-result-category,
.search-result-tags {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

/* --- Pagination (anzhiyu style) --- */
.search-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
  padding: 1rem;
}

.search-pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: 0.3s;
}

.search-pagination-btn.prev,
.search-pagination-btn.next {
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  color: var(--anzhiyu-fontcolor);
}

.search-pagination-btn.prev:hover,
.search-pagination-btn.next:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  border-color: var(--anzhiyu-main);
}

.search-pagination-btn.disabled {
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  color: var(--anzhiyu-secondtext);
  opacity: 0.5;
  cursor: not-allowed;
}

.search-pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.search-pagination-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--anzhiyu-fontcolor);
  background: var(--anzhiyu-card-bg);
  border: 1px solid transparent;
  transition: 0.3s;
}

.search-pagination-num:hover {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

.search-pagination-num.active {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* --- Mobile --- */
@media (max-width: 768px) {
  .search-page-container {
    padding: 1rem 0.5rem 3rem;
  }

  .search-input-area {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .search-result-item {
    flex-direction: column;
    padding: 1rem 1rem 1rem 1.5rem;
    gap: 0.5rem;
  }

  .search-result-item::before {
    top: 1rem;
    left: 0.5rem;
  }

  .search-result-cover {
    width: 100%;
    height: 120px;
  }

  .search-result-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-pagination {
    flex-wrap: wrap;
  }

  .search-pagination-pages {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
}
</style>