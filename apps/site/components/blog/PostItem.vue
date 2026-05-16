<script setup lang="ts">
interface ArticleItem {
  id: number
  title: string
  coverImage?: string | null
  excerpt?: string | null
  publishedAt?: Date | string | null
  createdAt: Date | string
  viewCount?: number
  categories?: Array<{ id: number; name: string; slug: string }>
  tags?: Array<{ id: number; name: string; slug: string; color?: string | null }>
  sticky?: boolean
  isNew?: boolean
}

const props = withDefaults(defineProps<{
  article: ArticleItem
  coverPosition?: 'left' | 'right' | 'both'
  coverEnabled?: boolean
  index?: number
}>(), {
  coverPosition: 'left',
  coverEnabled: true,
  index: 0,
})

const displayDate = computed(() => {
  const date = props.article.publishedAt || props.article.createdAt
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
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

const effectivePosition = computed(() => {
  if (props.coverPosition === 'both') {
    return props.index % 2 === 0 ? 'left' : 'right'
  }
  return props.coverPosition
})

const hasCover = computed(() => props.coverEnabled && props.article.coverImage !== false)
</script>

<template>
  <article class="recent-post-item" :class="{ 'lastestpost-item': index === 0 }">
    <NuxtLink :to="articleUrl" class="recent-post-link">
      <!-- Cover image -->
      <div
        v-if="hasCover"
        class="post_cover"
        :class="effectivePosition"
      >
        <img
          :src="coverUrl"
          :alt="article.title"
          class="post_bg"
        >
      </div>

      <!-- Post info -->
      <div class="recent-post-info" :class="{ 'no-cover': !hasCover }">
        <!-- Top tips -->
        <div class="recent-post-info-top">
          <div class="recent-post-info-top-tips">
            <span v-if="article.sticky" class="sticky-warp">
              <svg class="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
              <span class="text-xs text-orange-500 font-medium">置顶</span>
            </span>
            <span v-if="article.categories?.length" class="article-categories-original">
              {{ article.categories[0].name }}
            </span>
            <span v-if="article.isNew" class="newPost">新</span>
          </div>
          <span class="article-title">{{ article.title }}</span>
        </div>

        <!-- Content excerpt -->
        <div v-if="article.excerpt" class="content">
          {{ article.excerpt }}
        </div>

        <!-- Meta info -->
        <div class="article-meta-wrap">
          <span class="post-meta-date">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {{ displayDate }}
          </span>
          <span v-if="article.tags?.length" class="article-meta tags">
            <NuxtLink
              v-for="tag in article.tags.slice(0, 2)"
              :key="tag.id"
              :to="`/tags/${tag.slug}`"
              class="article-meta__tags"
              @click.stop
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ tag.name }}
            </NuxtLink>
          </span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.recent-post-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  height: 18em;
  position: relative;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: none;
  transition: all 0.3s ease;
  margin-bottom: 0;
}

.recent-post-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary);
}

.recent-post-item:hover .post_bg {
  filter: brightness(0.82) !important;
  transform: scale(1.03) !important;
  transition: 0.3s ease-in-out;
}

.recent-post-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

.recent-post-item:not(:first-child) {
  margin-top: 20px;
  animation: slide-in 0.6s 0.4s backwards;
  will-change: transform;
}

.recent-post-item.first-child,
.lastestpost-item {
  margin-top: 0;
}

.post_cover {
  overflow: hidden;
  width: 70%;
  height: 200px;
  flex-shrink: 0;
}

.post_cover.right {
  order: 1;
}

.post_bg {
  border-radius: 0;
  height: 100%;
  width: 100%;
  transition: all 0.6s ease;
  object-fit: cover;
}

.recent-post-info {
  height: 174px;
  width: 100%;
  cursor: pointer;
  position: relative;
  padding: 0;
  display: inline-block;
  overflow: hidden;
}

.recent-post-info.no-cover {
  width: 100%;
}

.recent-post-info-top {
  position: relative;
  transition: 0.3s;
  padding: 0 32px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.recent-post-info-top-tips {
  display: flex;
  margin-bottom: 8px;
  gap: 8px;
  align-items: center;
}

.sticky-warp {
  display: flex;
  align-items: center;
  gap: 2px;
}

.article-categories-original {
  display: flex;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  position: relative;
  margin-right: 8px;
}

.newPost {
  display: flex;
  color: var(--color-primary);
  font-size: 0.75rem;
  position: relative;
  margin-right: 8px;
  font-weight: 600;
}

.article-title {
  font-size: 20px;
  -webkit-line-clamp: 2;
  line-height: 30px;
  margin-top: 0;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0;
  width: 100%;
  transition: 0.3s;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.recent-post-item:hover .article-title {
  color: var(--color-primary);
}

.content {
  transition: all 0.3s ease;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
  font-size: 14px;
  padding: 0 32px;
}

.article-meta-wrap {
  color: var(--color-text);
  font-size: 0.7rem;
  position: absolute;
  padding: 0 32px;
  transition: 0.3s;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  left: 0;
  bottom: 30px;
  flex-direction: row-reverse;
  align-items: center;
}

.post-meta-date {
  color: var(--color-text);
  font-size: 0.875rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.article-meta.tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.article-meta__tags {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  transition: 0.3s;
}

.article-meta__tags:hover {
  color: var(--color-primary);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .recent-post-item {
    flex-direction: column;
    height: auto;
  }

  .post_cover {
    width: 100%;
    height: 200px;
  }

  .post_cover.right {
    order: 0;
  }

  .recent-post-info {
    width: 100%;
    min-height: 140px;
  }

  .article-title {
    font-size: 19px;
    line-height: 23px;
  }

  .recent-post-item:not(:first-child) {
    margin: 20px 20px 0;
  }
}
</style>