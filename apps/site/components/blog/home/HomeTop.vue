<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

interface CategoryConfig {
  name: string
  path: string
  icon?: string
  shadow?: string
  bgColor?: string
  cls?: string
}

interface SwiperArticle {
  id: number
  title: string
  path: string
  cover: string
  date: string
  description?: string
  excerpt?: string
}

interface TopArticle {
  id: number
  title: string
  path: string
  cover: string
}

interface TodayCardConfig {
  tips?: string
  title?: string
  image?: string
  link?: string
}

interface SkillItem {
  name: string
  icon: string
  color: string
}

interface PeopleCanvasConfig {
  enable?: boolean
  img?: string
}

interface TopImageConfig {
  disableTopImg?: boolean
  indexImg?: string
  defaultTopImg?: string
  siteInfoTop?: string
  topImgHeight?: string
}

const props = defineProps<{
  enabled: boolean
  title?: string
  subTitle?: string
  siteText?: string
  skills?: SkillItem[]
  peopleCanvas?: PeopleCanvasConfig
  topImage?: TopImageConfig
  swiperEnabled?: boolean
  swiperList?: SwiperArticle[]
  topPostList?: TopArticle[]
  topGroupList?: TopArticle[]
  todayCard?: TodayCardConfig
  categories?: CategoryConfig[]
  // Hero config
  heroFullScreenEnable?: boolean
  heroParallaxEnable?: boolean
  heroScrollIndicatorEnable?: boolean
  subTitleSource?: 'custom' | 'hitokoto'
  typedOptions?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'random-post': []
}>()

function toRandomPost() {
  emit('random-post')
}

// Full-screen Hero logic
const isFullScreen = computed(() => props.heroFullScreenEnable && !props.topImage?.disableTopImg)

// Typed subtitle
const typedText = ref('')
const isTyping = ref(false)
let typingTimer: ReturnType<typeof setTimeout> | null = null

const typedOpts = computed(() => ({
  typeSpeed: Number(props.typedOptions?.typeSpeed ?? 100),
  backSpeed: Number(props.typedOptions?.backSpeed ?? 50),
  startDelay: Number(props.typedOptions?.startDelay ?? 500),
  backDelay: Number(props.typedOptions?.backDelay ?? 2000),
  loop: props.typedOptions?.loop !== false,
}))

async function fetchHitokoto(): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k', { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return ''
    const data = await res.json()
    return data.hitokoto || ''
  }
  catch {
    return ''
  }
}

function startTyping(texts: string[]) {
  if (!texts.length) return
  isTyping.value = true
  let textIndex = 0
  let charIndex = 0
  let isDeleting = false

  function tick() {
    const current = texts[textIndex]
    if (!current) { isTyping.value = false; return }

    if (!isDeleting) {
      charIndex++
      typedText.value = current.slice(0, charIndex)
      if (charIndex >= current.length) {
        if (!typedOpts.value.loop && textIndex >= texts.length - 1) { isTyping.value = false; return }
        typingTimer = setTimeout(() => { isDeleting = true; tick() }, typedOpts.value.backDelay)
        return
      }
      typingTimer = setTimeout(tick, typedOpts.value.typeSpeed)
    }
    else {
      charIndex--
      typedText.value = current.slice(0, charIndex)
      if (charIndex <= 0) {
        isDeleting = false
        textIndex = (textIndex + 1) % texts.length
        typingTimer = setTimeout(tick, typedOpts.value.startDelay)
        return
      }
      typingTimer = setTimeout(tick, typedOpts.value.backSpeed)
    }
  }

  typingTimer = setTimeout(tick, typedOpts.value.startDelay)
}

function stopTyping() {
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null }
  isTyping.value = false
  typedText.value = ''
}

async function initTypedSubtitle() {
  let texts: string[] = []
  if (props.subTitleSource === 'hitokoto') {
    const hitokoto = await fetchHitokoto()
    if (hitokoto) texts = [hitokoto]
  }
  if (!texts.length && props.subTitle) texts = [props.subTitle]
  if (texts.length) startTyping(texts)
}

// Scroll indicator
const showScrollIndicator = ref(true)
const heroSectionRef = ref<HTMLElement | null>(null)

function scrollToContent() {
  // Scroll to where cards area starts (hero bottom - navbar height)
  // so cards stop at the bottom of the navbar, not at the top of the viewport
  const heroEl = document.querySelector('#home_top')
  if (heroEl) {
    const navbarHeight = 56 // collapsed navbar height
    const targetScroll = heroEl.offsetHeight - navbarHeight
    window.scrollTo({ top: Math.max(targetScroll, 0), behavior: 'smooth' })
  } else {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }
}

onMounted(() => {
  if (isFullScreen.value) {
    initTypedSubtitle()
  }
})

onUnmounted(() => {
  stopTyping()
})

watch(() => props.heroFullScreenEnable, (val) => {
  if (val) { initTypedSubtitle() }
  else { stopTyping(); showScrollIndicator.value = true }
})

watch(() => props.subTitle, () => {
  if (isFullScreen.value && !isTyping.value) initTypedSubtitle()
})
</script>

<template>
  <!-- ===== Fullscreen hero section — transparent, global bg-layer shows through ===== -->
  <section
    v-if="enabled && isFullScreen"
    id="home_top"
    ref="heroSectionRef"
    class="home-top home-top--fullscreen"
  >
    <!-- Subtle dark overlay for text readability (CSS ::before pseudo-element) -->

    <!-- Full-screen text content (absolute centered) -->
    <div class="hero-fullscreen-content">
      <h1 v-if="title" class="hero-title">{{ title }}</h1>
      <p class="hero-subtitle">
        <span v-if="isTyping" class="typed-text">{{ typedText }}<span class="typed-cursor">|</span></span>
        <span v-else>{{ subTitle }}</span>
      </p>
    </div>

    <!-- Scroll-down indicator -->
    <button
      v-if="heroScrollIndicatorEnable && showScrollIndicator"
      class="scroll-down-indicator"
      @click="scrollToContent"
    >
      <i class="anzhiyufont anzhiyu-icon-angle-down scroll-down-arrow" />
    </button>
  </section>

  <!-- ===== Cards area (separate from hero, normal document flow) ===== -->
  <div v-if="enabled && isFullScreen" class="home-top-cards">
    <div class="swiper_container_card">
      <div class="home-top-inner" :class="swiperEnabled ? 'swiper-mode' : 'top-mode'">
        <BlogBannerGroup
          :site-text="siteText"
          :skills="skills"
          :people-canvas="peopleCanvas"
          :top-image="topImage"
          @random-post="toRandomPost"
        >
          <template #categories>
            <BlogCategoryItem
              v-for="cat in (categories || [])"
              :key="cat.name"
              :name="cat.name"
              :path="cat.path"
              :icon="cat.icon"
              :shadow="cat.shadow"
              :bg-color="cat.bgColor"
              :cls="cat.cls"
            />
          </template>
        </BlogBannerGroup>

        <BlogSlider
          v-if="swiperEnabled"
          :swiper-list="swiperList"
          :top-post-list="topPostList"
        />
        <BlogTopGroup
          v-else
          :top-group-list="topGroupList"
          :today-card="todayCard"
        />
      </div>

      <BlogCategoryEntryButtons />
      <BlogTodayPickBanner />
    </div>
  </div>

  <!-- Anchor for scroll-down (after cards) -->
  <div v-if="enabled && isFullScreen" id="home-top-end" />

  <!-- ===== Non-fullscreen mode: everything in one section ===== -->
  <section
    v-if="enabled && !isFullScreen"
    id="home_top"
    ref="heroSectionRef"
    class="home-top"
  >
    <div class="swiper_container_card">
      <div class="home-top-inner" :class="swiperEnabled ? 'swiper-mode' : 'top-mode'">
        <BlogBannerGroup
          :title="title"
          :sub-title="subTitle"
          :site-text="siteText"
          :skills="skills"
          :people-canvas="peopleCanvas"
          :top-image="topImage"
          @random-post="toRandomPost"
        >
          <template #categories>
            <BlogCategoryItem
              v-for="cat in (categories || [])"
              :key="cat.name"
              :name="cat.name"
              :path="cat.path"
              :icon="cat.icon"
              :shadow="cat.shadow"
              :bg-color="cat.bgColor"
              :cls="cat.cls"
            />
          </template>
        </BlogBannerGroup>

        <BlogSlider
          v-if="swiperEnabled"
          :swiper-list="swiperList"
          :top-post-list="topPostList"
        />
        <BlogTopGroup
          v-else
          :top-group-list="topGroupList"
          :today-card="todayCard"
        />
      </div>

      <BlogCategoryEntryButtons />
      <BlogTodayPickBanner />
    </div>
  </section>
</template>

<style scoped>
.home-top {
  width: 100%;
  margin: 0 0 1rem;
  animation: slide-in 0.6s 0.1s backwards;
}

.swiper_container_card {
  width: 100%;
  height: auto;
}

.home-top-inner {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: stretch;
}

.home-top-inner.swiper-mode > :deep(.banner-group) {
  width: calc(100% - 600px - 1rem);
  flex: none;
}

.home-top-inner.swiper-mode > :deep(#swiper_container_blog),
.home-top-inner.swiper-mode > :deep(.swiper-container-blog) {
  width: 600px;
  flex: none;
}

.home-top-inner.top-mode > :deep(.banner-group) {
  width: calc(100% - 600px - 1rem);
  flex: none;
}

.home-top-inner.top-mode > :deep(.top-group-container) {
  width: 600px;
  flex: none;
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

@media (max-width: 1200px) {
  .home-top-inner {
    display: block;
  }
}

/* ===== Full-screen Hero styles — transparent, global bg shows through ===== */
.home-top--fullscreen {
  height: 100svh;
  position: relative;
  margin-bottom: 0;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow: hidden;
  width: 100vw;
  background: transparent;
}

/* Subtle dark overlay for text readability */
.home-top--fullscreen::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 0;
  pointer-events: none;
}

:global(.dark) .home-top--fullscreen::before {
  background: rgba(0, 0, 0, 0.35);
}

.hero-fullscreen-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  z-index: 1;
  text-align: center;
  padding: 2rem;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  font-weight: 400;
  margin: 0;
  min-height: 1.6em;
}

.typed-cursor {
  animation: blink-cursor 0.7s step-end infinite;
  font-weight: 100;
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Cards area wrapper (below hero, in normal document flow) */
.home-top-cards {
  animation: slide-in 0.6s 0.2s backwards;
  width: 100%;
  margin-top: 0;
}

.home-top-cards .swiper_container_card {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

@media (max-width: 768px) {
  .home-top-cards .swiper_container_card {
    padding: 0 20px;
  }
}

/* Scroll-down indicator */
.scroll-down-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 1.5rem;
  animation: scroll-down-effect 1.5s infinite;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
  padding: 0.5rem;
}

.scroll-down-arrow {
  display: block;
}

@keyframes scroll-down-effect {
  0% { opacity: 0.6; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-8px); }
  100% { opacity: 0.6; transform: translateY(0); }
}

@media (max-width: 768px) {
  .home-top--fullscreen {
    height: 100svh;
  }

  .hero-fullscreen-content {
    padding-top: 70px;
    top: 45%;
  }
}
</style>
