<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
import { useScrollDirection } from '@/composables/frontend/useScrollDirection'

const { nav, search, settings, social } = useSiteSettings()
const { isDark, toggleDark } = useTheme()
const { direction, isScrolledPastThreshold, scrollPercent } = useScrollDirection(26)

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
const searchOpen = ref(false)
const allArticles = ref<Array<{ id: number, publishedAt?: string | null, createdAt?: string | null }>>([])
const clockTime = ref('')
const darkModeAnimating = ref(false)

let clockTimer: ReturnType<typeof setInterval> | null = null
let removeSiteActionListeners: (() => void) | null = null

const isFixed = computed(() => isScrolledPastThreshold.value)
// AnZhiYu: nav-visible when scrolled past threshold AND scrolling up
const isVisible = computed(() => isScrolledPastThreshold.value && direction.value === 'up')

// AnZhiYu page type class for #page-header
// Currently no banner/cover image support, so all pages use 'not-top-img'
// When banner support is added, home = 'full_page', article = 'post-bg'
const headerPageClass = computed(() => {
  const path = route.path
  // Article detail pages with cover: /articles/YYYY/MM/id
  if (/^\/articles\/\d{4}\/\d{2}\/\d+/.test(path)) return 'post-bg'
  // All other pages (no banner) — including home until banner is implemented
  return 'not-top-img'
})

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
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  removeSiteActionListeners?.()
})
</script>

<template>
  <header
    id="page-header"
    :class="[headerPageClass, {
      'nav-fixed': isFixed,
      'nav-visible': isVisible,
    }]"
  >
    <nav id="nav">
      <div id="nav-group">
        <!-- Left: blog name area (z-index above menus) -->
        <span id="blog_name">
          <div v-if="navMenu.length > 0" class="back-home-button">
            <i class="anzhiyufont anzhiyu-icon-grip-vertical" />
            <div class="back-menu-list-groups">
              <div v-for="group in navMenu" :key="group.title" class="back-menu-list-group">
                <div class="back-menu-list-title">{{ group.title }}</div>
                <div class="back-menu-list">
                  <a
                    v-for="item in group.item"
                    :key="item.name"
                    class="back-menu-item"
                    :href="item.link"
                    :title="item.name"
                  >
                    <img v-if="useImageIcon(item.icon)" :src="item.icon" :alt="item.name" class="back-menu-item-icon" />
                    <i v-else :class="item.icon" class="back-menu-item-icon" />
                    <span class="back-menu-item-text">{{ item.name }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <a id="site-name" href="/" :accesskey="homeAccessKey">
            <span class="title">{{ siteName }}</span>
            <i class="anzhiyufont anzhiyu-icon-house-chimney" />
          </a>

          <span v-if="nav.clock && clockTime" class="nav-clock">{{ clockTime }}</span>
        </span>

        <!-- Center: page name overlay (visible on scroll) -->
        <div class="mask-name-container">
          <div id="name-container">
            <NuxtLink id="page-name" :to="route.path">{{ route.meta?.title || '' }}</NuxtLink>
          </div>
        </div>

        <!-- Center: menus (absolute positioned, full width, centered items) -->
        <div id="menus">
          <div class="menus_items">
            <div v-for="link in primaryLinks" :key="link.to" class="menus_item">
              <NuxtLink :to="link.to" class="site-page" active-class="menus_item-active">
                <span>{{ link.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Right: nav buttons (absolute positioned right) -->
        <div id="nav-right">
          <div v-if="nav.travelling" class="nav-button only-home hidden lg:block" title="前往">
            <a class="site-page" href="javascript:void(0);" rel="external nofollow" @click.prevent>
              <i class="anzhiyufont anzhiyu-icon-train" />
            </a>
          </div>

          <div class="nav-button" id="randomPost_button">
            <a class="site-page" title="随机文章" href="javascript:void(0);" @click="toRandomPost">
              <i class="anzhiyufont anzhiyu-icon-dice" />
            </a>
          </div>

          <div v-if="searchEnabled" class="nav-button hidden md:block" id="search-button">
            <a class="site-page" title="搜索" href="javascript:void(0);" @click="openSearch">
              <i class="anzhiyufont anzhiyu-icon-magnifying-glass" />
            </a>
          </div>

          <div class="nav-button">
            <a
              class="site-page"
              :class="{ 'dark-mode-animating': darkModeAnimating }"
              title="切换深色模式"
              href="javascript:void(0);"
              @click.prevent="toggleDarkWithAnimation"
            >
              <i v-if="isDark" class="anzhiyufont anzhiyu-icon-moon" />
              <i v-else class="anzhiyufont anzhiyu-icon-sun" />
            </a>
          </div>

          <div id="nav-totop" class="nav-button hidden md:flex" :class="{ 'totop-hidden': !isScrolledPastThreshold }">
            <a class="totopbtn" href="javascript:void(0);" @click="scrollToTop">
              <i class="anzhiyufont anzhiyu-icon-arrow-up" />
              <span id="percent">{{ scrollPercent }}</span>
            </a>
          </div>

          <div id="toggle-menu" class="md:hidden">
            <a class="site-page" title="切换菜单" href="javascript:void(0);" @click="mobileMenuOpen = !mobileMenuOpen">
              <i class="anzhiyufont anzhiyu-icon-bars" />
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
        <a class="site-page" href="javascript:void(0);" @click="closeMobileMenu">
          <i class="anzhiyufont anzhiyu-icon-xmark" />
        </a>
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
/* ===== Page header (anzhiyu: position relative, no padding) ===== */
#page-header {
  position: relative;
  width: 100%;
  transition: all 0.5s ease;
}

/* AnZhiYu: full_page (home with banner) — currently unused until banner is implemented */
/* #page-header.full_page { height: 100vh; } */

/* AnZhiYu: post-bg (article detail with cover) — currently unused until cover images are implemented */
/* #page-header.post-bg { height: 31.25rem; transition: 0.6s; overflow: hidden; } */

/* AnZhiYu: not-top-img (pages without banner) — nav links use font-color instead of light-grey */
#page-header.not-top-img {
  margin-bottom: 10px;
  height: 60px;
  background: transparent;
}

#page-header.not-top-img #nav #blog_name,
#page-header.not-top-img #nav .mask-name-container,
#page-header.not-top-img #nav #menus,
#page-header.not-top-img #nav #nav-right .nav-button,
#page-header.not-top-img #nav #nav-right #toggle-menu {
  color: var(--font-color);
}

#page-header.not-top-img #nav #blog_name a,
#page-header.not-top-img #nav .mask-name-container a,
#page-header.not-top-img #nav #menus a,
#page-header.not-top-img #nav #nav-right .nav-button a,
#page-header.not-top-img #nav #nav-right #toggle-menu a {
  color: var(--font-color);
  text-shadow: none;
}

#page-header.not-top-img #nav #blog_name .back-home-button:hover,
#page-header.not-top-img #nav #blog_name #site-name:hover,
#page-header.not-top-img #nav #nav-right .nav-button a:hover,
#page-header.not-top-img #nav #nav-right #toggle-menu:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  box-shadow: var(--anzhiyu-shadow-main);
}

#page-header.not-top-img #nav #menus .menus_item:hover > a {
  background: var(--anzhiyu-main);
}

/* ===== Default nav: transparent, no background, no blur, no border ===== */
#nav {
  position: fixed;
  top: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  padding: 0 calc((100% - 1400px + 3rem) / 2);
  width: 100%;
  height: 60px;
  opacity: 1;
  justify-content: space-between;
  transition: 0.3s;
  box-shadow: none;
  outline: 1px solid var(--anzhiyu-none);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 75%, transparent);
  border-bottom: none;
}

/* AnZhiYu: post-bg nav keeps glass effect */
#page-header.post-bg #nav {
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 75%, transparent);
  border-bottom: none;
}

@media screen and (max-width: 1390px) {
  #nav {
    padding: 0 1.5rem;
  }
}

/* Fixed state: stronger glass effect for readability */
#page-header.nav-fixed #nav {
  position: fixed;
  z-index: 91;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 85%, transparent);
  outline: 1px solid var(--anzhiyu-card-border);
  transform: translateZ(0);
  top: 0;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

/* AnZhiYu: when nav-fixed, menus slide up; when nav-visible, menus slide back */
#page-header.nav-fixed #nav #menus {
  z-index: 100;
}

#page-header.nav-fixed #nav #menus .menus_items {
  transition: 0.3s;
  height: 40px;
  margin: auto 0;
  transform: translateY(-60px);
  will-change: transform;
}

#page-header.nav-fixed.nav-visible #nav #menus .menus_items {
  opacity: 1;
  transition: 0.3s;
  transform: translateY(0px);
  will-change: transform;
}

/* Default nav links: light-grey color (on banner) */
#nav #blog_name,
#nav .mask-name-container,
#nav #menus,
#nav #nav-right .nav-button,
#nav #nav-right #toggle-menu {
  color: var(--light-grey);
}

#nav #blog_name a,
#nav .mask-name-container a,
#nav #menus a,
#nav #nav-right .nav-button a,
#nav #nav-right #toggle-menu a {
  color: var(--light-grey);
  text-shadow: none;
  transition: background 0.3s ease-in-out, color 0s ease-in-out;
}

/* Fixed state nav links: normal font color */
#page-header.nav-fixed #nav #blog_name,
#page-header.nav-fixed #nav .mask-name-container,
#page-header.nav-fixed #nav #menus,
#page-header.nav-fixed #nav #nav-right .nav-button,
#page-header.nav-fixed #nav #nav-right #toggle-menu {
  color: var(--anzhiyu-fontcolor);
}

#page-header.nav-fixed #nav #blog_name a,
#page-header.nav-fixed #nav .mask-name-container a,
#page-header.nav-fixed #nav #menus a,
#page-header.nav-fixed #nav #nav-right .nav-button a,
#page-header.nav-fixed #nav #nav-right #toggle-menu a {
  color: var(--anzhiyu-fontcolor);
  text-shadow: none;
  transition: background 0.3s ease-in-out, color 0s ease-in-out;
}

/* Hover on nav links: white + main background */
#nav #blog_name a:hover,
#nav .mask-name-container a:hover,
#nav #menus a:hover,
#nav #nav-right .nav-button a:hover,
#nav #nav-right #toggle-menu a:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  transition: 0.3s;
  box-shadow: var(--anzhiyu-shadow-main);
}

/* ===== Nav group (flex container, max-width 1400px) ===== */
#nav-group {
  max-width: 1400px;
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
}

/* ===== Blog name (left, z-index above menus) ===== */
#blog_name {
  flex-wrap: nowrap;
  height: 60px;
  display: flex;
  align-items: center;
  transition: 0.3s;
  z-index: 102;
}

#site-name {
  padding: 0 2px;
  height: 35px;
  line-height: 35px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}

#site-name .title {
  transition: 0.3s;
  letter-spacing: normal;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 0 5px;
  line-height: 2rem;
  color: var(--light-grey);
}

#page-header.nav-fixed #site-name .title {
  color: var(--anzhiyu-fontcolor);
}

#page-header.not-top-img #site-name .title {
  color: var(--font-color);
}

#site-name i {
  position: absolute;
  transition: 0.3s;
  font-size: 1rem;
  opacity: 0;
  color: var(--anzhiyu-white);
}

#site-name:hover .title {
  opacity: 0;
}

#site-name:hover i {
  opacity: 1;
}

#site-name:hover {
  background: var(--anzhiyu-main);
  box-shadow: var(--anzhiyu-shadow-main);
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

/* ===== Mask name container (page name overlay, absolute positioned) ===== */
.mask-name-container {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  left: 0;
}

@media screen and (max-width: 768px) {
  .mask-name-container {
    display: none;
  }
}

#name-container {
  align-items: center;
  display: flex;
  border-radius: 12px;
  height: 40px;
  position: absolute;
  top: 62px;
  left: 0;
  right: 0;
  margin: auto;
  justify-content: center;
  animation-timing-function: ease-out;
  -webkit-animation-timing-function: ease-out;
}

#page-header.nav-fixed.nav-visible #name-container {
  z-index: 100;
  top: 60px;
  transition: 0.3s;
}

#page-name {
  display: inline;
  font-weight: bold;
  padding: 4px 8px;
  opacity: 0;
  transition: 0.1s;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  text-align: center;
  cursor: pointer;
  top: 0;
  font-size: 1.1rem;
  animation-timing-function: ease-in;
  -webkit-animation-timing-function: ease-in;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
}

#page-header.nav-fixed #name-container {
  z-index: 101;
  transition: 0.3s;
  top: 10px;
}

#page-header.nav-fixed #page-name {
  display: inline;
  opacity: 1;
  transition: 0.3s;
  line-height: 2;
  max-width: 15.5rem;
  background: none;
  text-shadow: none;
  box-shadow: none;
  font-weight: bold;
  border-radius: 100px;
  min-width: 100px;
}

@media screen and (min-width: 900px) {
  #page-header.nav-fixed #page-name {
    max-width: 25.5rem;
  }
}

@media screen and (min-width: 1200px) {
  #page-header.nav-fixed #page-name {
    max-width: 35.5rem;
  }
}

@media screen and (min-width: 2000px) {
  #page-header.nav-fixed #page-name {
    max-width: 45.5rem;
  }
}

#page-header.nav-fixed #page-name:hover {
  color: var(--anzhiyu-main);
  background: var(--anzhiyu-main);
}

@media screen and (min-width: 900px) {
  #page-header.nav-fixed #page-name::after {
    opacity: 0;
    transform: scale(1);
    content: "回到顶部";
    transition: 0.2s;
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    margin: auto;
    color: var(--anzhiyu-white) !important;
    font-weight: 700;
    line-height: 2;
  }
}

@media screen and (min-width: 1200px) {
  #page-header.nav-fixed #page-name:hover::after {
    opacity: 1;
  }
}

/* ===== Menus (absolute positioned, full width, centered) ===== */
#menus {
  padding: 0 calc((100% - 1400px + 3rem) / 2);
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;
  height: 60px;
  left: 0;
  margin: 0;
  transform: translateZ(0);
  will-change: auto;
}

@media screen and (max-width: 1390px) {
  #menus {
    padding: 0 1.5rem;
  }
}

.menus_items {
  position: relative;
  width: fit-content;
  text-align: center;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.menus_item {
  display: flex;
  align-items: center;
  height: 100%;
}

.menus_item a.site-page {
  display: flex;
  align-items: center;
  letter-spacing: 0.3rem;
  font-weight: 700;
  padding: 0 0.8em 0 1em;
  height: 35px;
  line-height: 35px;
  border-radius: 50px;
  color: var(--light-grey);
  text-decoration: none;
  transition: color 0s, background 0.3s;
}

#page-header.nav-fixed .menus_item a.site-page {
  color: var(--anzhiyu-fontcolor);
}

.menus_item a.site-page:hover {
  color: var(--anzhiyu-white) !important;
  background: var(--anzhiyu-main);
  box-shadow: var(--anzhiyu-shadow-main);
  transition: 0.3s;
}

.menus_item-active {
  color: var(--anzhiyu-main) !important;
}

/* ===== Nav right (absolute positioned right, z-index above menus) ===== */
#nav-right {
  z-index: 102;
  position: absolute;
  right: 0;
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
}

#nav-right > div {
  margin-left: 1rem;
  padding: 0;
}

.nav-button {
  cursor: pointer;
}

/* Nav button links (35px circle style) */
#nav .nav-button a.site-page,
#nav #toggle-menu a.site-page {
  height: 35px;
  width: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  color: var(--light-grey);
  text-decoration: none;
  transition: background 0.3s ease-in-out, color 0s ease-in-out;
}

#page-header.nav-fixed #nav .nav-button a.site-page,
#page-header.nav-fixed #nav #toggle-menu a.site-page {
  color: var(--anzhiyu-fontcolor);
}

#nav .nav-button a.site-page:hover,
#nav #toggle-menu a.site-page:hover {
  color: var(--anzhiyu-white) !important;
  background: var(--anzhiyu-main);
  transition: 0.3s;
}

/* Dark mode animation */
.dark-mode-animating {
  transform: rotate(360deg);
  transition: transform 0.5s ease;
}

/* ===== Back-home-button (hover dropdown, anzhiyu style) ===== */
.back-home-button {
  display: flex;
  width: 35px;
  height: 35px;
  padding: 0 !important;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  transition: 0.3s;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  color: var(--light-grey);
}

#page-header.nav-fixed:not(.not-top-img) .back-home-button {
  color: var(--font-color);
}

#page-header.not-top-img .back-home-button {
  color: var(--font-color);
}

.back-home-button:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white) !important;
  box-shadow: var(--anzhiyu-shadow-main);
}

.back-home-button:hover .back-menu-list-groups {
  display: flex;
  opacity: 1;
  transition: 0.3s;
  top: 55px;
  pointer-events: auto;
  left: 0;
  transform: scale(1);
}

.back-menu-list-groups {
  position: absolute;
  top: 45px;
  transform: scale(0.8);
  transform-origin: top left;
  left: 0;
  background-color: var(--anzhiyu-maskbgdeep);
  border-radius: 12px;
  border: var(--style-border);
  flex-direction: column;
  font-size: 12px;
  color: var(--anzhiyu-secondtext);
  box-shadow: var(--anzhiyu-shadow-border);
  transition: 0.1s;
  opacity: 0;
  pointer-events: none;
  backdrop-filter: blur(20px);
  z-index: 100;
}

.back-menu-list-groups:hover {
  border: var(--style-border-hover);
}

.back-menu-list-group {
  display: flex;
  flex-direction: column;
}

.back-menu-list-group .back-menu-list-title {
  margin: 8px 0 0 16px;
  transition: 0.3s;
  font-size: 12px;
  font-weight: 700;
  color: var(--anzhiyu-secondtext);
}

.back-menu-list-group:hover .back-menu-list-title {
  color: var(--anzhiyu-main);
}

.back-menu-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 340px;
  justify-content: space-between;
}

.back-menu-list::before {
  position: absolute;
  top: -24px;
  left: 0;
  width: 100%;
  height: 25px;
  content: "";
}

.back-menu-list-group:last-child .back-menu-list {
  margin: 0 0 8px;
}

.back-menu-list .back-menu-item {
  display: flex;
  align-items: center;
  margin: 4px 8px;
  padding: 4px 8px !important;
  transition: 0.2s;
  width: 150px;
  border-radius: 8px !important;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
}

.back-menu-list .back-menu-item:hover {
  background: var(--anzhiyu-main);
}

.back-menu-list .back-menu-item:hover .back-menu-item-text {
  color: var(--anzhiyu-white);
}

.back-menu-item-icon {
  width: 24px;
  height: 24px;
  border-radius: 24px;
  background: var(--anzhiyu-secondbg);
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: contain;
  font-size: 1rem;
}

.back-menu-item-icon.loading img {
  width: 25px;
}

.back-menu-item-text {
  font-size: var(--global-font-size, 16px);
  margin-left: 0.5rem;
  color: var(--anzhiyu-fontcolor);
  white-space: nowrap;
}

@media screen and (max-width: 768px) {
  .back-menu-item-text {
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

/* ===== Back to top (anzhiyu #nav-totop) ===== */
#nav-totop {
  width: 35px;
  height: 35px;
  transition: 0.3s;
  display: flex;
  border-radius: 50px;
  align-items: center;
  justify-content: space-around;
  transition: all 0.3s ease-in-out;
}

#page-header:not(.nav-fixed) #nav-totop {
  width: 0;
  transform: scale(0);
  transition: 0.3s;
  margin-left: 0 !important;
  overflow: hidden;
}

#nav-totop:not(.totop-hidden) {
  transform: scale(1);
}

.totop-hidden {
  transform: scale(0);
  transition: transform 0.3s ease;
}

#nav-right .nav-button a.totopbtn {
  width: 25px;
  height: 25px;
  border-radius: 40px;
  background: var(--anzhiyu-fontcolor);
  color: var(--anzhiyu-card-bg);
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  position: relative;
}

#page-header.nav-fixed #nav-right .nav-button a.totopbtn {
  background: var(--anzhiyu-fontcolor);
}

#nav-right .nav-button:not(.long):hover a.totopbtn {
  width: 35px;
  height: 35px;
  background: var(--anzhiyu-main);
}

.nav-fixed #nav-totop #percent {
  font-size: 13px;
  border-radius: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  color: var(--anzhiyu-card-bg);
  width: 25px;
  height: 25px;
  font-weight: 700;
}

#nav-totop .totopbtn i {
  position: absolute;
  display: flex;
  opacity: 0;
  color: var(--anzhiyu-white);
  transition: 0.3s;
}

#nav-totop:hover .totopbtn i {
  opacity: 1;
}

#nav-totop:hover #percent {
  opacity: 0;
  transform: scale(1.5);
  font-weight: 700;
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

@keyframes mask-in {
  from { opacity: 0; }
  to { opacity: 1; }
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

.mobile-drawer-header .site-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50px;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
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
@media screen and (max-width: 768px) {
  #nav {
    padding: 20px;
  }

  #nav-right > div {
    margin-left: 0.5rem;
  }

  .mask-name-container {
    display: none;
  }

  #page-header.not-top-img {
    margin-bottom: 10px;
  }

  #page-header.not-top-img #nav {
    border-bottom: none;
    background: var(--anzhiyu-background);
  }
}
</style>
