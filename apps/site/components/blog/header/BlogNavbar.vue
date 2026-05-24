<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
import { useScrollDirection } from '@/composables/frontend/useScrollDirection'
import { useNavbarState } from '@/composables/frontend/useNavbarState'
import type { SocialLink } from '@/composables/frontend/site-settings.types'

const { nav, search, settings, social } = useSiteSettings()
const { isDark, toggleDark } = useTheme()
const { direction, isScrolledPastThreshold, scrollPercent } = useScrollDirection(56)
const { isNavbarHidden } = useNavbarState()

const config = useRuntimeConfig()
const route = useRoute()
const { getArticles } = usePublicApi()

const navMenu = computed(() => nav.value.menu ?? [])
const searchEnabled = computed(() => {
  const p = search.value.provider
  return !p || ['local', 'algolia', 'docsearch'].includes(p)
})
const siteName = computed(() => String(settings.value.siteTitle || config.public.siteName || 'My Blog'))
const homeAccessKey = computed(() => {
  const raw = (settings.value.accesskey as Record<string, unknown> | undefined) ?? {}
  return raw.enable === false ? undefined : 'h'
})
const useImageIcon = (icon: string) => /^(https?:)?\/\//.test(icon) || icon.startsWith('/')
const primaryLinks = computed(() => {
  const defaults = [
    { label: '首页', to: '/' },
    { label: '归档', to: '/archive' },
    { label: '关于', to: '/about' },
  ]

  if (!navMenu.value.length) {
    return defaults
  }

  const flattened = navMenu.value
    .flatMap(group => group.item ?? [])
    .filter(item => item?.link && item?.name)
    .slice(0, 4)
    .map(item => ({
      label: item.name,
      to: item.link,
    }))

  return flattened.length ? flattened : defaults
})

const mobileMenuOpen = ref(false)
const backMenuOpen = ref(false)
const searchOpen = ref(false)
const allArticles = ref<Array<{ id: number, publishedAt?: string | null, createdAt?: string | null }>>([])
const clockTime = ref('')
const consoleChecked = ref(false)
const darkModeAnimating = ref(false)

let clockTimer: ReturnType<typeof setInterval> | null = null
let removeSiteActionListeners: (() => void) | null = null

const isFixed = computed(() => isScrolledPastThreshold.value)
const isShrink = computed(() => isScrolledPastThreshold.value)

function toggleBackMenu() {
  backMenuOpen.value = !backMenuOpen.value
}

function openSearch() {
  if (!searchEnabled.value) {
    return
  }
  searchOpen.value = true
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toRandomPost() {
  if (allArticles.value.length === 0) return
  const randomArticle = allArticles.value[Math.floor(Math.random() * allArticles.value.length)]
  const date = new Date(randomArticle.publishedAt || randomArticle.createdAt || Date.now())
  navigateTo(`/articles/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${randomArticle.id}`)
}

function toggleDarkWithAnimation() {
  darkModeAnimating.value = true
  toggleDark()
  setTimeout(() => {
    darkModeAnimating.value = false
  }, 500)
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

watch(mobileMenuOpen, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

onMounted(() => {
  if (nav.value.clock) {
    clockTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    clockTimer = setInterval(() => {
      clockTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }, 1000)
  }

  const onOpenSearch = () => openSearch()
  const onToggleDark = () => toggleDark()
  const onRandomPost = () => toRandomPost()
  window.addEventListener('site:open-search', onOpenSearch)
  window.addEventListener('site:toggle-dark', onToggleDark)
  window.addEventListener('site:random-post', onRandomPost)
  removeSiteActionListeners = () => {
    window.removeEventListener('site:open-search', onOpenSearch)
    window.removeEventListener('site:toggle-dark', onToggleDark)
    window.removeEventListener('site:random-post', onRandomPost)
  }
})

onMounted(async () => {
  try {
    const response = await getArticles({ page: 1, pageSize: 100 })
    allArticles.value = response?.data?.items ?? []
  }
  catch {
    allArticles.value = []
  }
})

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
  backMenuOpen.value = false
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  removeSiteActionListeners?.()
})
</script>

<template>
  <header
    id="page-header"
    :class="{
      'nav-fixed': isFixed,
      'nav-visible': isFixed && direction === 'up',
      'nav-hide': isNavbarHidden,
      'nav-shrink': isShrink,
    }"
  >
    <nav id="nav">
      <div id="nav-group" class="flex items-center w-full relative gap-2">
        <div v-if="navMenu.length > 0" class="back-home-button relative mr-2">
          <button class="site-page nav-icon-btn" title="导航菜单" @click="toggleBackMenu">
            <i class="anzhiyufont anzhiyu-icon-grip-vertical text-lg" />
          </button>
          <Teleport to="body">
            <div v-if="backMenuOpen" class="back-menu-mask" @click="backMenuOpen = false">
              <div class="back-menu-content" @click.stop>
                <div v-for="group in navMenu" :key="group.title" class="back-menu-group">
                  <div class="back-menu-group-title">{{ group.title }}</div>
                  <div class="back-menu-group-items">
                    <a
                      v-for="item in group.item"
                      :key="item.name"
                      :href="item.link"
                      class="back-menu-item"
                    >
                      <img v-if="useImageIcon(item.icon)" :src="item.icon" :alt="item.name" class="back-menu-item-icon" />
                      <i v-else :class="item.icon" class="back-menu-item-icon" />
                      <span class="back-menu-item-name">{{ item.name }}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <a id="site-name" href="/" :accesskey="homeAccessKey" class="blog-name">
          <span class="site-name-text">{{ siteName }}</span>
        </a>

        <span v-if="nav.clock && clockTime" class="nav-clock">{{ clockTime }}</span>

        <div class="flex-1" />

        <div v-if="isFixed && route.path !== '/'" class="name-container hidden xl:block">
          <NuxtLink id="page-name" :to="route.path">{{ route.meta?.title || '' }}</NuxtLink>
        </div>

        <div id="menus" class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in primaryLinks"
            :key="link.to"
            :to="link.to"
            class="menu-item"
            active-class="menu-item-active"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Social icons (desktop only) -->
        <div v-if="social.length > 0" id="nav-social" class="hidden md:flex items-center gap-2">
          <a
            v-for="link in social"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener"
            :title="link.name"
            class="nav-social-icon"
          >
            <i v-if="link.icon" class="anzhiyufont" :class="link.icon" />
          </a>
        </div>

        <div id="nav-right" class="flex items-center gap-1">
          <div v-if="nav.travelling" class="nav-button only-home hidden lg:block">
            <a class="site-page nav-icon-btn" title="前往" href="javascript:void(0);" rel="external nofollow">
              <i class="anzhiyufont anzhiyu-icon-train text-lg" />
            </a>
          </div>

          <div id="randomPost_button" class="nav-button">
            <a class="site-page nav-icon-btn" title="随机文章" href="javascript:void(0);" @click="toRandomPost">
              <i class="anzhiyufont anzhiyu-icon-dice text-lg" />
            </a>
          </div>

          <div id="search-button" class="nav-button hidden md:block">
            <a class="site-page nav-icon-btn" title="搜索" href="javascript:void(0);" @click="openSearch">
              <i class="anzhiyufont anzhiyu-icon-magnifying-glass text-lg" />
            </a>
          </div>

          <div class="nav-button">
            <button
              class="site-page nav-icon-btn"
              :class="{ 'dark-mode-animating': darkModeAnimating }"
              title="切换深色模式"
              @click="toggleDarkWithAnimation"
            >
              <i v-if="isDark" class="anzhiyufont anzhiyu-icon-moon text-lg" />
              <i v-else class="anzhiyufont anzhiyu-icon-sun text-lg" />
            </button>
          </div>

          <div v-if="nav.console" class="nav-button">
            <input id="center-console" v-model="consoleChecked" type="checkbox" class="hidden">
            <label for="center-console" class="site-page nav-icon-btn console-btn" title="中控台">
              <i class="left" style="--icon-size: 2px" />
              <i class="widget center" style="--icon-size: 3px" />
              <i class="right" style="--icon-size: 2px" />
            </label>
          </div>

          <div id="nav-totop" class="nav-button hidden md:flex items-center" :class="{ 'totop-hidden': !isScrolledPastThreshold }">
            <a class="totopbtn" href="javascript:void(0);" @click="scrollToTop">
              <i class="anzhiyufont anzhiyu-icon-arrow-up" />
              <span id="percent">{{ scrollPercent }}</span>
            </a>
          </div>

          <div id="toggle-menu" class="md:hidden nav-button">
            <a class="site-page nav-icon-btn" title="切换菜单" href="javascript:void(0);" @click="mobileMenuOpen = !mobileMenuOpen">
              <i class="anzhiyufont anzhiyu-icon-bars text-xl" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- Mobile drawer -->
  <Teleport to="body">
    <div
      v-if="mobileMenuOpen"
      class="mobile-drawer-overlay"
      @click="closeMobileMenu"
    />
    <div
      class="mobile-drawer"
      :class="{ 'mobile-drawer-open': mobileMenuOpen }"
    >
      <div class="mobile-drawer-header">
        <span class="mobile-drawer-title">导航菜单</span>
        <button class="site-page nav-icon-btn" @click="closeMobileMenu">
          <i class="anzhiyufont anzhiyu-icon-xmark text-lg" />
        </button>
      </div>
      <div class="mobile-drawer-content">
        <div v-for="group in navMenu" :key="group.title" class="mb-4">
          <div class="mobile-drawer-group-title">{{ group.title }}</div>
          <div class="flex flex-col gap-1">
            <NuxtLink
              v-for="item in group.item"
              :key="item.name"
              :to="item.link"
              class="mobile-drawer-link"
              @click="closeMobileMenu"
            >
              <img v-if="useImageIcon(item.icon)" :src="item.icon" :alt="item.name" class="w-5 h-5 object-contain" />
              <i v-else :class="item.icon" class="w-5 h-5 text-base flex items-center justify-center" />
              <span class="text-sm">{{ item.name }}</span>
            </NuxtLink>
          </div>
        </div>
        <div v-if="navMenu.length === 0" class="flex flex-col gap-1">
          <NuxtLink
            v-for="link in primaryLinks"
            :key="link.to"
            :to="link.to"
            class="mobile-drawer-link"
            @click="closeMobileMenu"
          >
            <span class="text-sm">{{ link.label }}</span>
          </NuxtLink>
        </div>
      </div>
      <div class="mobile-drawer-footer">
        <button
          class="mobile-drawer-dark-btn"
          @click="toggleDarkWithAnimation"
        >
          <i v-if="isDark" class="anzhiyufont anzhiyu-icon-moon" />
          <i v-else class="anzhiyufont anzhiyu-icon-sun" />
          <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
        </button>
      </div>
    </div>
  </Teleport>

  <BlogSearchWidget v-if="searchOpen" @close="searchOpen = false" />
</template>

<style scoped>
/* ===== AnZhiYu nav structure ===== */
#page-header {
  position: sticky;
  top: 0;
  z-index: 90;
  width: 100%;
  transition: all 0.5s ease;
  padding: 0.5rem 0.75rem;
}

@media (min-width: 640px) {
  #page-header {
    padding: 0.5rem 1rem;
  }
}

#nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 1.25rem;
  transition: all 0.3s ease;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 92%, white 8%);
  border-bottom: 1px solid color-mix(in srgb, var(--style-border-always) 38%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

/* Fixed state: stronger shadow */
#page-header.nav-fixed #nav {
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}

/* Shrink state: shorter nav */
#page-header.nav-shrink #nav {
  height: 50px;
}

/* Hide on scroll down */
#page-header.nav-hide {
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.5s ease 0.1s;
}

/* Show on scroll up */
#page-header.nav-visible {
  transform: translateY(0);
  opacity: 1;
}

/* ===== Site name (anzhiyu #blog_name style) ===== */
.blog-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: color 0.3s;
}

.site-name-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
  letter-spacing: 0.02em;
}

/* ===== Nav clock ===== */
.nav-clock {
  display: none;
  margin-left: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--anzhiyu-secondtext);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 14%, transparent);
}

@media (min-width: 1024px) {
  .nav-clock {
    display: inline-flex;
  }
}

/* ===== Page name (anzhiyu #page-name in nav-visible) ===== */
.name-container {
  margin-right: 0.75rem;
}

#page-name {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--anzhiyu-secondtext);
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  text-decoration: none;
  transition: color 0.3s;
}

#page-name:hover {
  color: var(--anzhiyu-main);
}

/* ===== Menu items (anzhiyu #menus .menus_item) ===== */
.menu-item {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.menu-item:hover {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

.menu-item-active {
  color: var(--anzhiyu-main) !important;
  font-weight: 700;
}

/* ===== Social icons ===== */
.nav-social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-social-icon:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  transform: translateY(-2px);
}

/* ===== Nav icon buttons (anzhiyu site-page style) ===== */
.nav-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  cursor: pointer;
  color: var(--anzhiyu-fontcolor);
  background: transparent;
  border: none;
  transition: all 0.3s ease;
}

.nav-icon-btn:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  transform: translateY(-2px);
}

/* Dark mode animation */
.dark-mode-animating {
  transform: rotate(360deg);
  transition: transform 0.5s ease;
}

/* Console button dots */
.console-btn i {
  display: block;
  width: var(--icon-size);
  height: var(--icon-size);
  background: var(--anzhiyu-fontcolor);
  border-radius: 50%;
  transition: all 0.3s;
}

.console-btn .center {
  margin: 0 2px;
}

/* ===== Back to top (anzhiyu #nav-totop) ===== */
.totop-hidden {
  transform: scale(0);
  transition: transform 0.3s ease;
}

#nav-totop:not(.totop-hidden) {
  transform: scale(1);
  transition: transform 0.3s ease;
}

.totopbtn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--anzhiyu-fontcolor);
  background: color-mix(in srgb, var(--anzhiyu-main) 6%, white);
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 12%, transparent);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.totopbtn:hover {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, white);
}

.totopbtn:hover #percent {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.totopbtn:hover .anzhiyufont {
  transform: scale(1.2);
  transition: transform 0.3s ease;
}

/* ===== Back menu overlay (anzhiyu style) ===== */
.back-menu-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: mask-in 0.3s ease;
}

@keyframes mask-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.back-menu-content {
  position: absolute;
  top: 70px;
  left: 0.75rem;
  background: var(--anzhiyu-card-bg);
  border: 1px solid var(--style-border-always);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  padding: 1rem;
  min-width: 300px;
  max-height: 60vh;
  overflow-y: auto;
  animation: slide-down 0.3s ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-menu-group {
  margin-bottom: 1rem;
}

.back-menu-group:last-child {
  margin-bottom: 0;
}

.back-menu-group-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--anzhiyu-secondtext);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
}

.back-menu-group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.back-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--style-border-always);
  background: var(--anzhiyu-card-bg);
  color: var(--anzhiyu-fontcolor);
  width: 7rem;
  height: 4.2rem;
  font-size: 0.8rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-menu-item:hover {
  color: var(--anzhiyu-main);
  border-color: var(--anzhiyu-main);
}

.back-menu-item-icon {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: contain;
}

.back-menu-item-name {
  font-size: 0.7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* ===== Mobile drawer ===== */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 102;
  background: var(--anzhiyu-maskbg, rgba(0, 0, 0, 0.5));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: mask-in 0.3s ease;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  z-index: 103;
  background: var(--anzhiyu-card-bg);
  transform: translateX(100%);
  transition: transform 0.5s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.1);
}

.mobile-drawer-open {
  transform: translateX(0);
}

.mobile-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--style-border-always) 28%, transparent);
}

.mobile-drawer-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--anzhiyu-fontcolor);
}

.mobile-drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.mobile-drawer-group-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--anzhiyu-secondtext);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
}

.mobile-drawer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  transition: all 0.2s ease;
}

.mobile-drawer-link:hover {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

.mobile-drawer-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--style-border-always) 28%, transparent);
}

.mobile-drawer-dark-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--anzhiyu-fontcolor);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-drawer-dark-btn:hover {
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  #nav {
    padding: 0 0.75rem;
  }
}
</style>