<script setup lang="ts">
interface ArticleItem {
  id: number
  title: string
  content?: string | null
  coverImage?: string | null
  excerpt?: string | null
  publishedAt?: Date | string | null
  createdAt: Date | string
  updatedAt?: Date | string | null
  viewCount?: number
  commentCount?: number
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

const { homepage, errorImage, comments, postMetaPage, postMetaPost, indexPostContent } = useSiteSettings()

function formatRelativeDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  }

  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))} 小时前`
  }

  if (diff < day * 30) {
    return `${Math.max(1, Math.floor(diff / day))} 天前`
  }

  return date.toLocaleDateString('zh-CN')
}

function formatDateByConfig(sourceDate: string | Date | null | undefined) {
  if (!sourceDate) {
    return ''
  }

  const date = new Date(sourceDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  if (postMetaPage.value.dateFormat === 'relative') {
    return formatRelativeDate(date)
  }

  if (postMetaPage.value.dateFormat === 'simple') {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const displayDate = computed(() => {
  const created = props.article.createdAt
  const updated = props.article.updatedAt || props.article.publishedAt

  if (postMetaPage.value.dateType === 'updated') {
    return formatDateByConfig(updated)
  }

  if (postMetaPage.value.dateType === 'both') {
    const createdText = formatDateByConfig(created)
    const updatedText = formatDateByConfig(updated)
    if (createdText && updatedText && createdText !== updatedText) {
      return `${createdText} / ${updatedText}`
    }
    return createdText || updatedText
  }

  return formatDateByConfig(props.article.publishedAt || created)
})

const excerpt = computed(() => {
  const strategy = indexPostContent.value.method
  const maxLength = indexPostContent.value.length
  const manualExcerpt = props.article.excerpt?.trim() || ''
  const autoExcerpt = stripMarkdown(props.article.content || manualExcerpt)
  const clamp = (value: string) => value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value

  if (strategy === false) {
    return ''
  }

  if (strategy === 1) {
    return manualExcerpt
  }

  if (strategy === 2) {
    return clamp(manualExcerpt || autoExcerpt)
  }

  return clamp(autoExcerpt || manualExcerpt)
})

const articleUrl = computed(() => {
  const date = new Date(props.article.publishedAt || props.article.createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${props.article.id}`
})

function pickDefaultCover() {
  if (!homepage.value.defaultCovers.length) {
    return ''
  }

  return homepage.value.defaultCovers[props.index % homepage.value.defaultCovers.length] || ''
}

function applyThumbnailSuffix(url: string) {
  const suffix = homepage.value.pageThumbnailSuffix
  if (!url || !suffix) {
    return url
  }

  return `${url}${suffix}`
}

const fallbackCover = computed(() => pickDefaultCover() || errorImage.value.post_page || `https://picsum.photos/seed/${props.article.id}/960/640`)
const coverUrl = computed(() => applyThumbnailSuffix(props.article.coverImage || fallbackCover.value))
const hasCover = computed(() => Boolean(props.coverEnabled && coverUrl.value))
const resolvedCover = ref(coverUrl.value)

const cardDirection = computed<'left' | 'right'>(() => {
  if (props.coverPosition === 'both') {
    return (props.index || 0) % 2 === 0 ? 'left' : 'right'
  }

  return props.coverPosition === 'right' ? 'right' : 'left'
})

const displayCategories = computed(() => postMetaPage.value.categories ? (props.article.categories || []) : [])
const displayTags = computed(() => postMetaPage.value.tags ? (props.article.tags || []) : [])

watch(coverUrl, (value) => {
  resolvedCover.value = value
}, { immediate: true })

function handleCoverError() {
  if (resolvedCover.value !== fallbackCover.value) {
    resolvedCover.value = fallbackCover.value
  }
}
</script>

<template>
  <article class="recent-post-item" :class="[`cover-${cardDirection}`, { 'no-cover': !hasCover }]">
    <NuxtLink :to="articleUrl" class="recent-post-link">
      <div v-if="hasCover" class="post_cover">
        <img :src="resolvedCover" :alt="article.title" class="post_bg" @error="handleCoverError">
      </div>

      <div class="recent-post-info">
        <div class="recent-post-info-top">
          <div class="recent-post-info-top-tips">
            <span v-if="article.sticky" class="sticky-warp">
              <i class="anzhiyufont anzhiyu-icon-thumbtack sticky-icon" />
              <span class="sticky">置顶</span>
            </span>
            <span v-if="displayCategories.length" class="article-category">
              {{ displayCategories[0].name }}
            </span>
            <span v-if="article.isNew" class="new-post">NEW</span>
            <span v-if="postMetaPost.unread" class="unvisited-post">未读</span>
          </div>

          <span class="article-title">
            {{ article.title }}
          </span>
        </div>

        <div class="article-meta-wrap">
          <span class="post-meta-date">
            <i class="anzhiyufont anzhiyu-icon-calendar-days" />
            <span v-if="postMetaPage.label" class="article-meta-label">发布于</span>
            {{ displayDate }}
          </span>
          <span v-if="article.viewCount !== undefined" class="post-meta-views">
            <i class="anzhiyufont anzhiyu-icon-eye" />
            <span v-if="postMetaPage.label" class="article-meta-label">阅读</span>
            {{ article.viewCount }}
          </span>
          <span v-if="comments.cardPostCount && article.commentCount !== undefined" class="post-meta-comments">
            <i class="anzhiyufont anzhiyu-icon-comments" />
            <span v-if="postMetaPage.label" class="article-meta-label">评论</span>
            {{ article.commentCount }}
          </span>
          <span v-if="displayTags.length" class="article-meta-tags">
            <span
              v-for="tag in displayTags.slice(0, 2)"
              :key="tag.id"
              class="article-tag"
            >
              <i class="anzhiyufont anzhiyu-icon-hashtag" />
              {{ tag.name }}
            </span>
          </span>
        </div>

        <div v-if="excerpt" class="content">
          {{ excerpt }}
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.recent-post-item {
  overflow: hidden;
  border-radius: 18px;
  background: var(--anzhiyu-card-bg);
  border: var(--style-border-always);
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.3s;
}

.recent-post-item:hover {
  border: var(--style-border-hover);
  box-shadow: var(--anzhiyu-shadow-main);
}

.recent-post-link {
  display: flex;
  align-items: stretch;
  min-height: 280px;
  text-decoration: none;
  color: inherit;
}

.cover-right .recent-post-link {
  flex-direction: row-reverse;
}

.post_cover {
  width: 44%;
  min-width: 44%;
  overflow: hidden;
  background: var(--anzhiyu-secondbg);
}

.post_bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.6s;
}

.recent-post-item:hover .post_bg {
  transform: scale(1.04);
}

.recent-post-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  padding: 1.4rem 1.55rem 1.45rem;
}

.recent-post-info-top {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.recent-post-info-top-tips {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.sticky-warp,
.article-category,
.new-post,
.unvisited-post {
  display: inline-flex;
  align-items: center;
  min-height: 1.7rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.sticky-warp {
  gap: 0.35rem;
  color: #f97316;
  background: color-mix(in srgb, #f97316 14%, white);
}

.sticky-icon {
  font-size: 0.78rem;
}

.article-category {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 10%, white);
}

.new-post {
  color: #0ea5e9;
  background: color-mix(in srgb, #0ea5e9 10%, white);
}

.unvisited-post {
  color: var(--anzhiyu-fontcolor);
  background: var(--anzhiyu-secondbg);
}

.article-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--anzhiyu-fontcolor);
  font-size: 1.7rem;
  line-height: 1.35;
  font-weight: 700;
  text-decoration: none;
  transition: 0.3s;
}

.recent-post-item:hover .article-title {
  color: var(--anzhiyu-main);
}

.article-meta-wrap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  color: var(--anzhiyu-secondtext);
  font-size: 0.88rem;
}

.post-meta-date,
.post-meta-views,
.post-meta-comments,
.article-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.article-meta-label {
  color: var(--anzhiyu-secondtext);
}

.article-meta-tags {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.post-meta-comments {
  color: var(--anzhiyu-secondtext);
}

.article-tag {
  color: var(--anzhiyu-secondtext);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

.content {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: var(--anzhiyu-secondtext);
  font-size: 0.95rem;
  line-height: 1.85;
}

.no-cover .recent-post-link {
  min-height: 220px;
}

@media (max-width: 900px) {
  .recent-post-link,
  .cover-right .recent-post-link {
    flex-direction: column;
    min-height: 0;
  }

  .post_cover {
    width: 100%;
    min-width: 100%;
    height: 220px;
  }

  .recent-post-info {
    padding: 1.1rem 1.1rem 1.2rem;
  }

  .article-title {
    font-size: 1.35rem;
  }
}
</style>
