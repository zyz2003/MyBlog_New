<script setup lang="ts">
const { homepage, errorImage, postMetaPost, settings } = useSiteSettings()

const props = withDefaults(defineProps<{
  title?: string
  date?: string
  updatedDate?: string
  author?: string
  viewCount?: number
  categories?: Array<{ id: number; name: string; slug: string }>
  tags?: Array<{ id: number; name: string; slug: string }>
  coverImage?: string
  readingTime?: string
  wordCount?: number
  showUnread?: boolean
  showReadingTime?: boolean
  showWordCount?: boolean
}>(), {
  title: '',
  date: '',
  updatedDate: '',
  author: '',
  viewCount: 0,
  categories: () => [],
  tags: () => [],
  coverImage: '',
  readingTime: '',
  wordCount: 0,
  showUnread: false,
  showReadingTime: false,
  showWordCount: false,
})

function applyThumbnailSuffix(url: string) {
  const suffix = homepage.value.pageThumbnailSuffix
  if (!url || !suffix) {
    return url
  }

  return `${url}${suffix}`
}

const fallbackCover = computed(() => errorImage.value.post_page || '')
const heroCover = computed(() => applyThumbnailSuffix(props.coverImage || fallbackCover.value))
const resolvedHeroCover = ref(heroCover.value)
const dynamicEffect = computed(() => {
  const raw = (settings.value.dynamicEffect as Record<string, unknown> | undefined) ?? {}
  return {
    postTopWave: raw.postTopWave !== undefined ? Boolean(raw.postTopWave) : true,
    postTopRollZoomInfo: raw.postTopRollZoomInfo !== undefined ? Boolean(raw.postTopRollZoomInfo) : false,
  }
})
const scrollProgress = ref(0)
let removeScrollListener: (() => void) | null = null

const displayCategories = computed(() => postMetaPost.value.categories ? (props.categories || []) : [])
const displayTags = computed(() => postMetaPost.value.tags ? (props.tags || []) : [])

watch(heroCover, (value) => {
  resolvedHeroCover.value = value
}, { immediate: true })

function handleHeroError() {
  if (resolvedHeroCover.value !== fallbackCover.value) {
    resolvedHeroCover.value = fallbackCover.value
  }
}

type HeroMetaItem = {
  key: string
  icon: string
  label: string
  value: string
}

const heroMeta = computed<HeroMetaItem[]>(() => {
  const showLabel = postMetaPost.value.label
  const items: Array<HeroMetaItem | null> = [
    {
      key: 'date',
      icon: 'anzhiyu-icon-calendar-days',
      label: showLabel ? '发布于' : '',
      value: props.date,
    },
    props.updatedDate
      ? {
          key: 'updated',
          icon: 'anzhiyu-icon-history',
          label: showLabel ? '更新于' : '',
          value: props.updatedDate,
        }
      : null,
    props.author
      ? {
          key: 'author',
          icon: 'anzhiyu-icon-user',
          label: showLabel ? '作者' : '',
          value: props.author,
        }
      : null,
    props.showReadingTime && props.readingTime
      ? {
          key: 'readingTime',
          icon: 'anzhiyu-icon-clock',
          label: showLabel ? '阅读' : '',
          value: props.readingTime,
        }
      : null,
    props.showWordCount && props.wordCount !== undefined
      ? {
          key: 'wordCount',
          icon: 'anzhiyu-icon-pen-to-square',
          label: showLabel ? '字数' : '',
          value: `${props.wordCount}`,
        }
      : null,
    props.viewCount !== undefined
      ? {
          key: 'views',
          icon: 'anzhiyu-icon-eye',
          label: showLabel ? '浏览' : '',
          value: `${props.viewCount}`,
        }
      : null,
  ]

  return items.filter((item): item is HeroMetaItem => item !== null)
})

onMounted(() => {
  if (!dynamicEffect.value.postTopRollZoomInfo) {
    return
  }

  const handleScroll = () => {
    scrollProgress.value = Math.min(1, Math.max(0, window.scrollY / 320))
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  removeScrollListener = () => window.removeEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  removeScrollListener?.()
})
</script>

<template>
  <div v-if="resolvedHeroCover" id="post-top-cover" class="relative h-[52vh] max-h-[620px] min-h-[320px] w-full overflow-hidden">
    <img :src="resolvedHeroCover" :alt="title" class="h-full w-full object-cover transition-transform duration-300" :style="dynamicEffect.postTopRollZoomInfo ? { transform: `scale(${1 + scrollProgress * 0.08})` } : undefined" @error="handleHeroError">
    <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.18)_36%,rgba(255,255,255,0.92)_100%)]" />
    <div v-if="dynamicEffect.postTopWave" class="post-top-wave" aria-hidden="true" />
  </div>

  <div class="post-header relative z-1 mx-auto max-w-[980px] px-4" :class="{ '-mt-40 md:-mt-44': resolvedHeroCover, 'pt-10': !resolvedHeroCover }">
    <nav class="post-breadcrumb mb-3 flex items-center gap-1.5 text-sm text-[var(--anzhiyu-secondtext)]">
      <NuxtLink to="/" class="inline-flex items-center gap-1 text-[var(--anzhiyu-secondtext)] no-underline transition-colors hover:text-[var(--anzhiyu-main)]">
        <i class="anzhiyufont anzhiyu-icon-house-chimney text-xs" />
      </NuxtLink>
      <template v-for="(category, index) in displayCategories" :key="category.id">
        <i class="anzhiyufont anzhiyu-icon-angle-right text-[0.6rem] text-[var(--anzhiyu-thirdtext)]" />
        <NuxtLink :to="`/categories/${category.slug}`" class="text-[var(--anzhiyu-secondtext)] no-underline transition-colors hover:text-[var(--anzhiyu-main)]">
          {{ category.name }}
        </NuxtLink>
      </template>
      <i class="anzhiyufont anzhiyu-icon-angle-right text-[0.6rem] text-[var(--anzhiyu-thirdtext)]" />
      <span class="truncate text-[var(--anzhiyu-fontcolor)]">{{ title }}</span>
    </nav>

    <div class="overflow-hidden rounded-[30px] border border-[var(--style-border-always)] bg-[color-mix(in_srgb,var(--anzhiyu-card-bg)_88%,white)] px-5 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur transition-transform duration-300 md:px-8 md:py-8" :style="dynamicEffect.postTopRollZoomInfo ? { transform: `translateY(${-scrollProgress * 18}px) scale(${1 - scrollProgress * 0.04})` } : undefined">
      <div v-if="displayCategories.length > 0" class="mb-4 flex flex-wrap items-center gap-2">
        <NuxtLink
          v-for="cat in displayCategories"
          :key="cat.id"
          :to="`/categories/${cat.slug}`"
          class="inline-flex items-center rounded-full bg-[var(--anzhiyu-main-op-deep)] px-3 py-1 text-sm font-medium text-[var(--anzhiyu-main)] no-underline transition-all hover:-translate-y-0.5 hover:bg-[var(--anzhiyu-main-op)]"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>

      <h1 class="mb-5 text-3xl leading-tight font-bold text-[var(--anzhiyu-fontcolor)] md:text-[2.7rem] md:leading-[1.2]">
        {{ title }}
      </h1>

      <div class="mb-5 flex flex-wrap gap-3 text-sm text-[var(--anzhiyu-secondtext)]">
        <span
          v-for="item in heroMeta"
          :key="item.key"
          class="inline-flex items-center gap-2 rounded-full bg-[var(--anzhiyu-secondbg)] px-3 py-1.5"
        >
          <i class="anzhiyufont" :class="item.icon" />
          <span v-if="item.label">{{ item.label }}</span>
          <span class="text-[var(--anzhiyu-fontcolor)]">{{ item.value }}</span>
        </span>
        <span v-if="showUnread" class="inline-flex items-center gap-2 rounded-full bg-[var(--anzhiyu-main-op-deep)] px-3 py-1.5 text-[var(--anzhiyu-main)]">
          <i class="anzhiyufont anzhiyu-icon-fire" />
          <span>未读提醒</span>
        </span>
      </div>

      <div v-if="displayTags.length > 0" class="flex flex-wrap items-center gap-2">
        <span v-if="postMetaPost.label" class="text-sm text-[var(--anzhiyu-secondtext)]">标签</span>
        <NuxtLink
          v-for="tag in displayTags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="inline-flex items-center gap-1 rounded-full border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] px-3 py-1 text-xs text-[var(--anzhiyu-secondtext)] no-underline transition-all hover:border-[var(--anzhiyu-main)] hover:text-[var(--anzhiyu-main)]"
        >
          <i class="anzhiyufont anzhiyu-icon-hashtag text-[0.75rem]" />
          <span>{{ tag.name }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-top-wave {
  position: absolute;
  inset-inline: -6%;
  bottom: -1px;
  height: 72px;
  background:
    radial-gradient(circle at 15% 0, rgba(255, 255, 255, 0.92) 0 34px, transparent 35px),
    radial-gradient(circle at 40% 0, rgba(255, 255, 255, 0.94) 0 42px, transparent 43px),
    radial-gradient(circle at 68% 0, rgba(255, 255, 255, 0.92) 0 36px, transparent 37px),
    radial-gradient(circle at 88% 0, rgba(255, 255, 255, 0.95) 0 38px, transparent 39px);
  background-repeat: repeat-x;
  pointer-events: none;
}
</style>