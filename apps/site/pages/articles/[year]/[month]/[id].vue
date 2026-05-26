<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

type PublicArticle = {
  id: number
  title: string
  slug?: string
  content?: string | null
  excerpt?: string | null
  coverImage?: string | null
  publishedAt?: string | Date | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
  seoTitle?: string | null
  seoDescription?: string | null
  aiSummary?: string | null
  viewCount?: number
  categories?: Array<{ id: number; name: string; slug: string }>
  tags?: Array<{ id: number; name: string; slug: string }>
  author?: { username?: string | null; displayName?: string | null; avatar?: string | null; id?: number }
  mainColor?: string | null
  mathjax?: boolean | null
  katex?: boolean | null
  toc?: boolean | null
  ai?: string | null
  aside?: boolean | null
  topImg?: string | null
  keywords?: string | null
  highlightShrink?: string | null
  password?: string | null
  isTop?: boolean | null
  allowComment?: boolean | null
}

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const id = Number(route.params.id)
const { getArticle, getArticles } = usePublicApi()
const {
  homepage,
  errorImage,
  postMetaPost,
  mainTone,
  wordcount,
  toc,
  postCopyright,
  reward,
  postEdit,
  relatedPost,
  photoFigcaption,
  postPagination,
  noticeOutdate,
  anchor,
  sharejs,
  addtoany,
  ptool,
  settings,
  refresh,
} = useSiteSettings()

await refresh()

const { data, pending, error } = await useAsyncData(
  `article-${id}`,
  () => getArticle(id),
)

const { data: articleListData } = await useAsyncData(
  `article-list-${id}`,
  () => getArticles({ page: 1, pageSize: 100 }),
)

if (error.value) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const article = computed<PublicArticle | undefined>(() => data.value?.data)

const articleDate = computed(() => {
  const sourceDate = article.value?.publishedAt || article.value?.createdAt
  return sourceDate ? new Date(sourceDate) : null
})

const canonicalPath = computed(() => {
  if (!article.value || !articleDate.value || Number.isNaN(articleDate.value.getTime())) {
    return ''
  }

  const year = articleDate.value.getFullYear()
  const month = String(articleDate.value.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${article.value.id}`
})

if (article.value && canonicalPath.value && route.path !== canonicalPath.value) {
  await navigateTo(canonicalPath.value, { redirectCode: 301 })
}

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

function formatDateByConfig(sourceDate: string | Date | null | undefined, mode: 'date' | 'relative' | 'simple') {
  if (!sourceDate) {
    return ''
  }

  const date = new Date(sourceDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  if (mode === 'relative') {
    return formatRelativeDate(date)
  }

  if (mode === 'simple') {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildArticlePath(item: PublicArticle) {
  const date = new Date(item.publishedAt || item.createdAt || Date.now())
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${item.id}`
}

const displayDate = computed(() => {
  const created = article.value?.createdAt
  const updated = article.value?.updatedAt || article.value?.publishedAt
  const mode = postMetaPost.value.dateFormat
  const type = postMetaPost.value.dateType

  if (type === 'updated') {
    return formatDateByConfig(updated, mode)
  }

  if (type === 'both') {
    const createdText = formatDateByConfig(created, mode)
    const updatedText = formatDateByConfig(updated, mode)
    if (createdText && updatedText && createdText !== updatedText) {
      return `${createdText} / ${updatedText}`
    }
    return createdText || updatedText
  }

  return formatDateByConfig(created, mode)
})

const updatedDate = computed(() => {
  if (postMetaPost.value.dateType !== 'both') {
    return ''
  }

  return formatDateByConfig(article.value?.updatedAt || article.value?.publishedAt, postMetaPost.value.dateFormat)
})

const wordCountValue = computed(() => {
  const content = article.value?.content || ''
  const cjkChars = (content.match(/[\u3400-\u9fff]/g) || []).length
  const latinWords = (content.match(/[a-zA-Z0-9]+/g) || []).length
  return cjkChars + latinWords
})

const readingTime = computed(() => {
  const minutes = Math.max(1, Math.ceil(wordCountValue.value / 300))
  return `${minutes} 分钟`
})

const showWordCount = computed(() => wordcount.value.enable && wordcount.value.postWordcount)
const showReadingTime = computed(() => wordcount.value.enable && wordcount.value.min2read)

/** Normalize string/boolean Front Matter values to boolean */
function normalizeBool(value: unknown): boolean {
  return ['true', true, 1, '1'].includes(value as string | number | boolean)
}

const showToc = computed(() => {
  const raw = article.value?.toc
  return raw !== undefined && raw !== null ? normalizeBool(raw) : toc.value.post
})
const showAside = computed(() => {
  const raw = article.value?.aside
  return raw !== undefined && raw !== null ? normalizeBool(raw) : true
})

const allowCommentValue = computed(() => {
  const raw = article.value?.allowComment
  if (raw === undefined || raw === null) return true
  return normalizeBool(raw)
})

const articleUrl = computed(() => {
  if (import.meta.client && canonicalPath.value) {
    return new URL(canonicalPath.value, window.location.origin).toString()
  }

  return canonicalPath.value || `${runtimeConfig.public.siteUrl || ''}${route.fullPath}`
})

const authorName = computed(() => article.value?.author?.displayName || article.value?.author?.username || '')
const articleViewCount = computed(() => article.value?.viewCount)

const heroImage = computed(() => {
  const base = article.value?.topImg || article.value?.coverImage || errorImage.value.post_page || ''
  if (!base) {
    return ''
  }

  const suffix = homepage.value.pageThumbnailSuffix
  return suffix ? `${base}${suffix}` : base
})

const aiSummaryText = computed(() => {
  return article.value?.ai || (article.value as { aiSummary?: string } | undefined)?.aiSummary || ''
})
const aiSummaryConfig = computed(() => {
  const raw = (settings.value.aiSummary as Record<string, unknown> | undefined) ?? {}
  return {
    gptName: String(raw.gptName || 'AnZhiYu'),
    btnLink: String(raw.btnLink || ''),
  }
})

const toneColor = ref('')

async function resolveMainTone() {
  if (!import.meta.client || !mainTone.value.enable || !heroImage.value) {
    toneColor.value = ''
    return
  }

  const tryApi = async () => {
    if (!mainTone.value.api || (mainTone.value.mode !== 'api' && mainTone.value.mode !== 'both')) {
      return ''
    }

    try {
      const response = await $fetch<unknown>(`${mainTone.value.api}${encodeURIComponent(heroImage.value)}`)
      if (typeof response === 'string' && response.startsWith('#')) {
        return response
      }

      if (response && typeof response === 'object') {
        const record = response as Record<string, unknown>
        const candidates = [record.color, record.hex, record.data, record.rgb]
        const hit = candidates.find(value => typeof value === 'string' && String(value).startsWith('#'))
        return typeof hit === 'string' ? hit : ''
      }
    }
    catch {
      return ''
    }

    return ''
  }

  const tryCanvas = async () => {
    try {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = heroImage.value
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('cover load failed'))
      })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        return ''
      }

      canvas.width = 24
      canvas.height = 24
      context.drawImage(image, 0, 0, 24, 24)

      const { data } = context.getImageData(0, 0, 24, 24)
      let r = 0
      let g = 0
      let b = 0
      let count = 0

      for (let index = 0; index < data.length; index += 4) {
        r += data[index]
        g += data[index + 1]
        b += data[index + 2]
        count += 1
      }

      if (!count) {
        return ''
      }

      const toHex = (value: number) => Math.round(value / count).toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
    catch {
      return ''
    }
  }

  const apiColor = await tryApi()
  if (apiColor) {
    toneColor.value = apiColor
    return
  }

  if (mainTone.value.mode === 'api') {
    toneColor.value = ''
    return
  }

  toneColor.value = await tryCanvas()
}

const articleToneStyle = computed(() => {
  const articleMainColor = article.value?.mainColor
  if (articleMainColor) {
    return {
      '--anzhiyu-main': articleMainColor,
      '--anzhiyu-main-op': `${articleMainColor}22`,
      '--anzhiyu-main-op-deep': `${articleMainColor}33`,
    } as Record<string, string>
  }

  if (!toneColor.value || !mainTone.value.enable) {
    return {}
  }

  return {
    '--anzhiyu-main': toneColor.value,
    '--anzhiyu-main-op': `${toneColor.value}22`,
    '--anzhiyu-main-op-deep': `${toneColor.value}33`,
  } as Record<string, string>
})

watch([heroImage, mainTone], () => {
  resolveMainTone()
}, { immediate: true, deep: true })

const allArticles = computed<PublicArticle[]>(() => articleListData.value?.data?.items || [])

const sortedArticles = computed(() => {
  return [...allArticles.value].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.publishedAt || 0).getTime()
    const bTime = new Date(b.createdAt || b.publishedAt || 0).getTime()
    return bTime - aTime
  })
})

const currentArticleIndex = computed(() => sortedArticles.value.findIndex(item => item.id === article.value?.id))

const paginationLinks = computed(() => {
  const index = currentArticleIndex.value
  if (index < 0) {
    return { previous: null, next: null }
  }

  const newer = sortedArticles.value[index - 1] || null
  const older = sortedArticles.value[index + 1] || null
  const mode = postPagination.value

  const mapItem = (item: PublicArticle | null) => item
    ? {
        title: item.title,
        path: buildArticlePath(item),
        coverImage: item.coverImage || undefined,
      }
    : null

  if (mode === 2) {
    return {
      previous: mapItem(older),
      next: mapItem(newer),
    }
  }

  return {
    previous: mapItem(newer),
    next: mapItem(older),
  }
})

const relatedItems = computed(() => {
  if (!article.value || !relatedPost.value.enable) {
    return []
  }

  const currentCategoryIds = new Set((article.value.categories || []).map(item => item.id))
  const currentTagIds = new Set((article.value.tags || []).map(item => item.id))
  const sourceDateKey = relatedPost.value.dateType === 'updated' ? 'updatedAt' : 'createdAt'

  return allArticles.value
    .filter(item => item.id !== article.value?.id)
    .map((item) => {
      const categoryScore = (item.categories || []).filter(category => currentCategoryIds.has(category.id)).length * 3
      const tagScore = (item.tags || []).filter(tag => currentTagIds.has(tag.id)).length * 2
      const score = categoryScore + tagScore
      return { item, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, relatedPost.value.limit)
    .map(({ item }) => ({
      id: item.id,
      title: item.title,
      path: buildArticlePath(item),
      coverImage: item.coverImage || undefined,
      date: formatDateByConfig(item[sourceDateKey], postMetaPost.value.dateFormat),
    }))
})

const outdateDays = computed(() => {
  const updated = article.value?.updatedAt || article.value?.publishedAt || article.value?.createdAt
  if (!updated) {
    return 0
  }

  const updatedTime = new Date(updated).getTime()
  if (Number.isNaN(updatedTime)) {
    return 0
  }

  return Math.floor((Date.now() - updatedTime) / (24 * 60 * 60 * 1000))
})

const showOutdateNotice = computed(() => noticeOutdate.value.enable && outdateDays.value >= noticeOutdate.value.limitDay)

const editLink = computed(() => {
  if (!postEdit.value.enable || !article.value) {
    return ''
  }

  if (typeof postEdit.value.github === 'string' && postEdit.value.github) {
    const base = postEdit.value.github.endsWith('/') ? postEdit.value.github : `${postEdit.value.github}/`
    return `${base}${article.value.slug || article.value.id}.md`
  }

  if (typeof postEdit.value.yuque === 'string' && postEdit.value.yuque) {
    const base = postEdit.value.yuque.endsWith('/') ? postEdit.value.yuque : `${postEdit.value.yuque}/`
    return `${base}${article.value.slug || article.value.id}`
  }

  return ''
})

useSeoMeta({
  title: () => article.value?.seoTitle || article.value?.title || '文章详情',
  ogTitle: () => article.value?.seoTitle || article.value?.title || '文章详情',
  description: () => article.value?.seoDescription || article.value?.excerpt || '',
  ogDescription: () => article.value?.seoDescription || article.value?.excerpt || '',
  ogImage: () => heroImage.value,
  twitterCard: 'summary_large_image',
  keywords: () => article.value?.keywords || '',
})

const tocMobileRef = ref<{ forceReobserve: () => void } | null>(null)
const tocDesktopRef = ref<{ forceReobserve: () => void } | null>(null)

function handleContentUpdated(): void {
  tocMobileRef.value?.forceReobserve()
  tocDesktopRef.value?.forceReobserve()
}
</script>

<template>
  <div :style="articleToneStyle">
    <BlogReadingProgress v-if="!pending && article" />

    <div v-if="pending" class="mx-auto max-w-[1100px] px-4 py-24 text-center text-[var(--anzhiyu-secondtext)]">
      正在加载文章内容...
    </div>

    <div v-else-if="!article" class="mx-auto max-w-[1100px] px-4 py-24 text-center text-[var(--anzhiyu-secondtext)]">
      文章不存在或已下线。
    </div>

    <article v-else class="pb-16">
      <BlogPostHeader
        :title="article.title"
        :date="displayDate"
        :updated-date="updatedDate"
        :author="authorName"
        :view-count="articleViewCount"
        :categories="article.categories || []"
        :tags="article.tags || []"
        :cover-image="heroImage"
        :reading-time="readingTime"
        :word-count="wordCountValue"
        :show-unread="postMetaPost.unread"
        :show-reading-time="showReadingTime"
        :show-word-count="showWordCount"
      />

      <BlogAiSummary
        v-if="aiSummaryText"
        :summary="aiSummaryText"
        :gpt-name="aiSummaryConfig.gptName"
        :btn-link="aiSummaryConfig.btnLink"
      />

      <BlogPostInfoBar
        :word-count="wordCountValue"
        :reading-time="readingTime"
        :publish-date="displayDate"
        :update-date="updatedDate"
        :categories="article.categories || []"
      />

      <div class="mx-auto max-w-[1240px] px-4">
        <div v-if="showOutdateNotice && noticeOutdate.position === 'top'" class="mb-5">
          <BlogPostOutdateNotice
            :days="outdateDays"
            :message-prev="noticeOutdate.messagePrev"
            :message-next="noticeOutdate.messageNext"
            :style-type="noticeOutdate.style"
          />
        </div>

        <div v-if="showToc" class="mb-4 lg:hidden">
          <BlogTableOfContents
            ref="tocMobileRef"
            :content="article.content || ''"
            :number="toc.number"
            :expand="toc.expand"
            :simple="toc.styleSimple"
            :enable-anchor="anchor"
          />
        </div>

        <div :class="showAside ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]' : ''">
          <div class="space-y-6">
            <div class="rounded-[30px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-5 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:px-8 md:py-8">
              <BlogArticleContent
                :content="article.content || ''"
                :enable-photo-figcaption="photoFigcaption.enable"
                :article-mathjax="article.mathjax ?? undefined"
                :article-katex="article.katex ?? undefined"
                :article-highlight-shrink="article.highlightShrink || undefined"
              />
            </div>

            <div v-if="showOutdateNotice && noticeOutdate.position === 'bottom'">
              <BlogPostOutdateNotice
                :days="outdateDays"
                :message-prev="noticeOutdate.messagePrev"
                :message-next="noticeOutdate.messageNext"
                :style-type="noticeOutdate.style"
              />
            </div>

            <BlogPostCopyright
              :enabled="postCopyright.enable"
              :author="authorName"
              :author-avatar="article?.author?.avatar || undefined"
              :article-url="articleUrl"
              :title="article.title"
              :license="postCopyright.license"
              :license-url="postCopyright.licenseUrl"
              :location="postCopyright.location"
              :author-link="postCopyright.copyrightAuthorLink || postCopyright.authorHref"
              :avatar-sinks="postCopyright.avatarSinks"
            />

            <BlogPostTools
              v-if="ptool.enable"
              :categories="article.categories || []"
              :url="articleUrl"
              :title="article.title"
            />

            <BlogRewardPanel v-if="reward.enable && reward.qrCodes.length" :items="reward.qrCodes" />

            <BlogShareButtons
              v-if="sharejs.enable"
              :title="article.title"
              :url="articleUrl"
              :sites="sharejs.sites"
            />

            <BlogAddToAnyButtons
              v-if="addtoany.enable"
              :title="article.title"
              :url="articleUrl"
              :items="addtoany.item"
            />

            <div v-if="editLink" class="rounded-[24px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-5 py-4 text-sm shadow-[var(--anzhiyu-shadow-border)]">
              <a :href="editLink" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 text-[var(--anzhiyu-main)] no-underline hover:underline">
                <i class="anzhiyufont anzhiyu-icon-pen" />
                在线编辑本文
              </a>
            </div>

            <BlogRelatedPosts :items="relatedItems" />

            <BlogPostPagination
              v-if="postPagination"
              :mode="postPagination"
              :previous="postPagination >= 3 ? null : paginationLinks.previous"
              :next="paginationLinks.next"
            />

            <BlogCommentWidget :allow-comment="allowCommentValue" />
          </div>

          <aside v-if="showAside" class="hidden lg:block">
            <div class="sticky top-[96px]">
              <BlogTableOfContents
                ref="tocDesktopRef"
                v-if="showToc"
                :content="article.content || ''"
                :number="toc.number"
                :expand="toc.expand"
                :simple="toc.styleSimple"
                :enable-anchor="anchor"
              />
            </div>
          </aside>
        </div>
      </div>
    </article>
  </div>
</template>
