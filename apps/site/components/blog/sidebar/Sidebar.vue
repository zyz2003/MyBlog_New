<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

interface Props {
  enabled?: boolean
  widgets?: string[]
  sidebarWidth?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  widgets: () => ['profile', 'stats', 'tags', 'categories', 'recent'],
  sidebarWidth: '300px',
  loading: false,
})

const { sidebar, aside, sidebarCards } = useSiteSettings()
const { getArticles, getCategoryTree } = usePublicApi()

const widgetList = computed(() => {
  const base = props.widgets || sidebar.value.widgets || ['profile', 'stats', 'tags', 'categories', 'recent']
  return base.filter((name) => {
    if (name === 'profile') return sidebarCards.value.author.enable
    if (name === 'announcement') return sidebarCards.value.announcement.enable
    if (name === 'wechat') return sidebarCards.value.weixin.enable
    if (name === 'recent') return sidebarCards.value.recentPost.enable
    if (name === 'categories') return sidebarCards.value.categories.enable
    if (name === 'tags') return sidebarCards.value.tags.enable
    if (name === 'archive') return sidebarCards.value.archives.enable
    if (name === 'recent_comments') return sidebarCards.value.newestComments.enable
    if (name === 'stats') return sidebarCards.value.webinfo.enable || sidebarCards.value.runtimeShow.enable
    return true
  })
})

const { data: articleStats } = await useAsyncData('sidebar-article-stats', () => getArticles({ pageSize: 1 }))
const { data: categoryStats } = await useAsyncData('sidebar-category-stats', () => getCategoryTree())
const { data: tagStats } = await useFetch<{ code: number, data: Array<{ id: number }> }>('/api/tags')

const stats = computed(() => ({
  articles: articleStats.value?.data?.total || 0,
  categories: categoryStats.value?.data?.length || 0,
  tags: tagStats.value?.data?.length || 0,
}))
</script>

<template>
  <aside
    v-if="enabled && aside.enable"
    id="aside-content"
    class="sidebar-widget"
    :style="{ width: sidebarWidth }"
  >
    <div class="sticky_layout">
      <div v-if="loading" class="sidebar-skeleton">
        <USkeletonLoader mode="sidebar" />
      </div>
      <template v-else>
        <template v-for="name in widgetList" :key="name">
          <div v-if="widgetList.length > 0" class="sidebar-card card-hover">
            <BlogProfileWidget v-if="name === 'profile'" />
            <BlogStatsWidget
              v-else-if="name === 'stats'"
              :articles="stats.articles"
              :categories="stats.categories"
              :tags="stats.tags"
            />
            <BlogTagCloud v-else-if="name === 'tags'" />
            <BlogCategoriesWidget v-else-if="name === 'categories'" />
            <BlogRecentPostsWidget v-else-if="name === 'recent'" />
            <BlogAnnounceWidget v-else-if="name === 'announcement'" />
            <BlogArchiveWidget v-else-if="name === 'archive'" />
            <BlogWechatWidget v-else-if="name === 'wechat'" />
            <BlogRecentCommentsWidget v-else-if="name === 'recent_comments'" />
          </div>
        </template>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-widget {
  flex-shrink: 0;
  min-width: 0;
}

.sticky_layout {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card {
  background: var(--anzhiyu-card-bg);
  border-radius: 12px;
  border: var(--style-border-always);
  box-shadow: var(--anzhiyu-shadow-border);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.sidebar-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: var(--style-border-hover);
}

.card-hover {
  will-change: transform;
}

@media (max-width: 1024px) {
  .sidebar-widget {
    display: none;
  }
}
</style>
