<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

interface CategoryCard {
  name: string
  path: string
  icon: string
  shadow: string
  cls: string
}

interface TodayCardConfig {
  tips: string
  title: string
  image: string
  link: string
}

interface SkillItem {
  name: string
  icon: string
  color: string
}

const route = useRoute()
const homeTitle = '首页'
const homeDescription = '分享技术见解，记录生活感悟'
const archiveText = '归档'
const friendsText = '友链'
const noArticlesText = '暂无文章'
const page = computed(() => Number(route.query.page) || 1)
const { getArticles, getCategoryTree } = usePublicApi()
const { homepage, errorImage, refresh } = useSiteSettings()
const { observe, cleanup } = useScrollReveal()

// Template ref for PostItem elements
const postItemRefs = ref<HTMLElement[]>([])

onMounted(() => {
  // Observe each PostItem for scroll-reveal after data is loaded
  nextTick(() => {
    postItemRefs.value.forEach((el) => {
      observe(el)
    })
  })
})

onUnmounted(() => {
  cleanup()
})

// Re-observe when page changes (new articles loaded)
watch(page, () => {
  postItemRefs.value = []
  nextTick(() => {
    nextTick(() => {
      postItemRefs.value.forEach((el) => {
        observe(el)
      })
    })
  })
})

await refresh()
const homepageSkills = computed<SkillItem[]>(() => homepage.value.skills as SkillItem[])
const homePageSize = computed(() => homepage.value.pageSize)

function resolveCover(coverImage: string | null | undefined, id: number, fallbackSize: string) {
  const fallback = errorImage.value.post_page || `https://picsum.photos/seed/${id}/${fallbackSize}`
  const base = coverImage || fallback
  const suffix = homepage.value.pageThumbnailSuffix
  return suffix && base ? `${base}${suffix}` : base
}

const { data: articlesData, pending: articlesPending } = await useAsyncData(
  'home-articles',
  () => getArticles({ page: page.value, pageSize: homePageSize.value }),
  { watch: [page, homePageSize] },
)

const { data: categoriesData, pending: categoriesPending } = await useAsyncData('home-categories', () => getCategoryTree())

const homepageCategoryCards = computed<CategoryCard[]>(() => {
  const configuredCards = (homepage.value.categories as CategoryCard[]).slice(0, 3).map((card, index) => ({
    name: card.name,
    path: card.path,
    icon: card.icon || ['anzhiyu-icon-dove', 'anzhiyu-icon-fire', 'anzhiyu-icon-book'][index % 3],
    shadow: card.shadow || ['var(--anzhiyu-shadow-blue)', 'var(--anzhiyu-shadow-red)', 'var(--anzhiyu-shadow-green)'][index % 3],
    cls: card.cls || ['blue', 'red', 'green'][index % 3],
  }))

  const generatedCards = (categoriesData.value?.data || []).slice(0, 3).map((category, index) => ({
    name: category.name,
    path: `/categories/${category.slug}`,
    icon: ['anzhiyu-icon-dove', 'anzhiyu-icon-fire', 'anzhiyu-icon-book'][index % 3],
    shadow: ['var(--anzhiyu-shadow-blue)', 'var(--anzhiyu-shadow-red)', 'var(--anzhiyu-shadow-green)'][index % 3],
    cls: ['blue', 'red', 'green'][index % 3],
  }))

  const fallbackCards: CategoryCard[] = [
    {
      name: archiveText,
      path: '/archives',
      icon: 'anzhiyu-icon-book',
      shadow: 'var(--anzhiyu-shadow-red)',
      cls: 'red',
    },
    {
      name: friendsText,
      path: '/friends',
      icon: 'anzhiyu-icon-dove',
      shadow: 'var(--anzhiyu-shadow-green)',
      cls: 'green',
    },
  ]

  const sourceCards = configuredCards.length ? configuredCards : generatedCards
  const mergedCards = [...sourceCards]

  for (const card of fallbackCards) {
    if (mergedCards.length >= 3) {
      break
    }
    mergedCards.push(card)
  }

  return mergedCards.slice(0, 3)
})

const allArticles = computed(() => articlesData.value?.data?.items || [])

const swiperList = computed(() =>
  allArticles.value.slice(0, 5).map(article => ({
    id: article.id,
    title: article.title,
    path: `/articles/${new Date(article.publishedAt || article.createdAt).getFullYear()}/${String(new Date(article.publishedAt || article.createdAt).getMonth() + 1).padStart(2, '0')}/${article.id}`,
    cover: resolveCover(article.coverImage, article.id, '400/240'),
    date: new Date(article.publishedAt || article.createdAt).toLocaleDateString('zh-CN'),
    description: article.excerpt || '',
  })),
)

const topPostList = computed(() =>
  allArticles.value.slice(1, 5).map(article => ({
    id: article.id,
    title: article.title,
    path: `/articles/${new Date(article.publishedAt || article.createdAt).getFullYear()}/${String(new Date(article.publishedAt || article.createdAt).getMonth() + 1).padStart(2, '0')}/${article.id}`,
    cover: resolveCover(article.coverImage, article.id, '400/240'),
  })),
)

const topGroupList = computed(() =>
  allArticles.value.slice(0, 6).map(article => ({
    id: article.id,
    title: article.title,
    path: `/articles/${new Date(article.publishedAt || article.createdAt).getFullYear()}/${String(new Date(article.publishedAt || article.createdAt).getMonth() + 1).padStart(2, '0')}/${article.id}`,
    cover: resolveCover(article.coverImage, article.id, '400/240'),
  })),
)

function toRandomPost() {
  if (allArticles.value.length === 0) {
    return
  }

  const randomArticle = allArticles.value[Math.floor(Math.random() * allArticles.value.length)]
  const date = new Date(randomArticle.publishedAt || randomArticle.createdAt)
  navigateTo(`/articles/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${randomArticle.id}`)
}

useSeoMeta({
  title: homeTitle,
  ogTitle: homeTitle,
  description: homeDescription,
  ogDescription: homeDescription,
})
</script>

<template>
  <div>
    <BlogHomeTop
      :enabled="homepage.enabled"
      :title="homepage.title"
      :sub-title="homepage.subTitle"
      :site-text="homepage.siteText"
      :skills="homepageSkills"
      :people-canvas="homepage.peopleCanvas"
      :top-image="homepage.topImage"
      :swiper-enabled="homepage.swiperEnabled"
      :swiper-list="swiperList"
      :top-post-list="topPostList"
      :top-group-list="topGroupList"
      :today-card="homepage.todayCard as TodayCardConfig"
      :categories="homepageCategoryCards"
      :hero-full-screen-enable="homepage.heroFullScreenEnable"
      :hero-parallax-enable="homepage.heroParallaxEnable"
      :hero-scroll-indicator-enable="homepage.heroScrollIndicatorEnable"
      :sub-title-source="homepage.subTitleSource"
      :typed-options="homepage.typedOptions"
      @random-post="toRandomPost"
    />

    <div id="content-inner" class="layout">
      <div id="recent-posts" class="recent-posts">
        <BlogCategoryBar :categories="categoriesData?.data || []" />

        <div v-if="articlesPending" class="post-grid" :class="{ 'post-grid-double': homepage.doubleRow }">
          <UiSkeletonLoader mode="card" :count="4" />
        </div>
        <div v-else class="post-grid" :class="{ 'post-grid-double': homepage.doubleRow }">
          <BlogPostItem
            v-for="(article, index) in allArticles"
            :key="article.id"
            :ref="(el) => { if (el?.$el) postItemRefs.push(el.$el) }"
            :article="article as any"
            :cover-position="homepage.coverPosition"
            :cover-enabled="homepage.coverEnabled"
            :index="index"
            :scroll-reveal="true"
            :delay-index="Math.min(index + 1, 6)"
          />
        </div>

        <div v-if="!articlesPending && !allArticles.length" class="text-center py-16 text-muted">
          <span class="i-heroicons-document-text w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{{ noArticlesText }}</p>
        </div>

        <BlogPagination
          v-if="articlesData?.data"
          :current-page="articlesData.data.page"
          :total-pages="articlesData.data.totalPages"
          base-url="/"
        />
      </div>

      <BlogSidebar
        :enabled="homepage.sidebarEnabled"
        :widgets="homepage.sidebarWidgets"
        :loading="categoriesPending"
      />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.recent-posts {
  flex: 1;
  min-width: 0;
}

.post-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

@media (min-width: 1180px) {
  .post-grid.post-grid-double {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .layout {
    gap: 1rem;
  }
}
</style>
