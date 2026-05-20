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
const { search, algoliaSearch } = useSiteSettings()

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
  description: () => keyword.value ? `查看与“${keyword.value}”相关的文章搜索结果。` : '按关键词搜索博客文章内容。',
})
</script>

<template>
  <div class="search-page mx-auto max-w-[1180px] px-4 py-8">
    <section class="search-hero">
      <div class="search-hero-copy">
        <span class="search-badge">Search</span>
        <h1 class="search-title">站内搜索</h1>
        <p class="search-description">
          按标题、摘要和内容关键词快速查找文章，优先收敛你真正想读的那一篇。
        </p>
      </div>

      <form class="search-form" @submit.prevent="submitSearch">
        <label class="search-input-wrap">
          <i class="anzhiyufont anzhiyu-icon-magnifying-glass search-input-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="输入关键词，例如 Nuxt、评论系统、主题配置..."
            class="search-input"
          >
        </label>
        <button
          type="submit"
          class="search-submit"
        >
          开始搜索
        </button>
      </form>
    </section>

    <div v-if="!hasKeyword" class="search-empty-card">
      <p class="search-empty-title">输入关键词后即可开始检索</p>
      <p class="search-empty-text">建议先从框架名、页面名、功能名等较短关键词开始。</p>
    </div>

    <template v-else>
      <div class="search-result-meta">
        <p class="search-result-count">
          关键词“<span>{{ keyword }}</span>”共找到 {{ total }} 篇相关文章
        </p>
        <p class="search-result-page">第 {{ page }} / {{ totalPages }} 页</p>
      </div>

      <div v-if="currentProvider === 'docsearch'" class="search-state-card">
        当前后台选择了 DocSearch，搜索结果页暂时只支持本地搜索或 Algolia 数据源。
      </div>

      <div v-else-if="pending" class="search-state-card">
        正在加载搜索结果...
      </div>

      <div v-else-if="error" class="search-state-card">
        搜索结果加载失败，请稍后重试。
      </div>

      <div v-else-if="items.length === 0" class="search-state-card">
        没有找到相关结果，试试更短或更通用的关键词。
      </div>

      <div v-else class="space-y-4">
        <BlogArticleCard
          v-for="article in items"
          :key="`${article.id}-${article.slug || ''}`"
          :article="article"
        />
      </div>

      <div v-if="totalPages > 1" class="search-pagination">
        <NuxtLink
          v-if="page > 1"
          :to="buildPageLink(page - 1)"
          class="search-pagination-button secondary"
        >
          上一页
        </NuxtLink>
        <span
          v-else
          class="search-pagination-button muted"
        >
          上一页
        </span>

        <NuxtLink
          v-if="page < totalPages"
          :to="buildPageLink(page + 1)"
          class="search-pagination-button primary"
        >
          下一页
        </NuxtLink>
        <span
          v-else
          class="search-pagination-button muted primary-muted"
        >
          下一页
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.search-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.85fr);
  gap: 1.5rem;
  align-items: end;
  margin-bottom: 2rem;
  padding: 1.8rem;
  border: var(--style-border-always);
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--anzhiyu-main) 14%, transparent) 0, transparent 18rem),
    linear-gradient(135deg, color-mix(in srgb, var(--anzhiyu-card-bg) 86%, white 14%), var(--anzhiyu-card-bg));
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
}

.search-hero-copy {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.search-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.36rem 0.72rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
  color: var(--anzhiyu-main);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.search-title {
  color: var(--anzhiyu-fontcolor);
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.04;
  font-weight: 900;
}

.search-description {
  max-width: 38rem;
  color: var(--anzhiyu-secondtext);
  font-size: 0.98rem;
  line-height: 1.8;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 3.6rem;
  padding: 0 1rem;
  border: 1px solid var(--style-border-always);
  border-radius: 22px;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 76%, white 24%);
}

.search-input-icon {
  color: var(--anzhiyu-main);
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  min-height: 3.25rem;
  border: 0;
  background: transparent;
  color: var(--anzhiyu-fontcolor);
  outline: none;
}

.search-submit {
  min-height: 3.4rem;
  border: 0;
  border-radius: 20px;
  background: var(--anzhiyu-main);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.search-submit:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.search-empty-card,
.search-state-card {
  padding: 2.2rem 1.5rem;
  border: var(--style-border-always);
  border-radius: 28px;
  background: var(--anzhiyu-card-bg);
  text-align: center;
  color: var(--anzhiyu-secondtext);
}

.search-empty-title {
  color: var(--anzhiyu-fontcolor);
  font-size: 1rem;
  font-weight: 700;
}

.search-empty-text {
  margin-top: 0.45rem;
  font-size: 0.92rem;
}

.search-result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-result-count {
  color: var(--anzhiyu-secondtext);
  font-size: 0.94rem;
}

.search-result-count span {
  color: var(--anzhiyu-main);
  font-weight: 700;
}

.search-result-page {
  color: var(--anzhiyu-secondtext);
  font-size: 0.82rem;
}

.search-pagination {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.search-pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  min-height: 2.9rem;
  padding: 0 1.25rem;
  border-radius: 999px;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 700;
}

.search-pagination-button.secondary {
  border: 1px solid var(--style-border-always);
  background: var(--anzhiyu-card-bg);
  color: var(--anzhiyu-fontcolor);
}

.search-pagination-button.primary {
  background: var(--anzhiyu-main);
  color: #fff;
}

.search-pagination-button.muted {
  border: 1px solid var(--style-border-always);
  background: var(--anzhiyu-card-bg);
  color: var(--anzhiyu-secondtext);
  opacity: 0.65;
}

.search-pagination-button.primary-muted {
  background: color-mix(in srgb, var(--anzhiyu-main) 15%, transparent);
  color: var(--anzhiyu-main);
  border-color: transparent;
}

@media (max-width: 900px) {
  .search-hero {
    grid-template-columns: 1fr;
    padding: 1.25rem;
  }
}
</style>
