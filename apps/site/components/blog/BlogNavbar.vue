<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
import { useScrollDirection } from '@/composables/frontend/useScrollDirection'
import { useTheme } from '@/composables/useTheme'
import type { SocialLink } from '@/composables/frontend/site-settings.types'

const { nav, search, settings, social } = useSiteSettings()
const { isDark, toggleDark } = useTheme()
const { direction, isScrolledPastThreshold, scrollPercent, scrollY } = useScrollDirection(56)

const config = useRuntimeConfig()
const route = useRoute()
const { getArticles } = usePublicApi()

const navMenu = computed(() => nav.value.menu ?? [])
const searchEnabled = computed(() => ['local', 'algolia', 'docsearch'].includes(search.value.provider))
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

// Scroll-driven navbar classes
const navHideClass = computed(() => {
  if (!isScrolledPastThreshold.value) return false
  return direction.value === 'down'
})
const navVisibleClass = computed(() => {
  if (!isScrolledPastThreshold.value) return false
  return direction.value === 'up'
})
const navFixedClass = computed(() => isScrolledPastThreshold.value)
const navShrinkClass = computed(() => isScrolledPastThreshold.value)

// Social icons from useSiteSettings
const socialLinks = computed<SocialLink[]>(() => social.value ?? [])

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

// Lock body scroll when mobile drawer is open
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
    class="sticky top-0 z-50 transition-all duration-300 px-3 sm:px-4 pt-3"
    :class="{
      'nav-hide': navHideClass,
      'nav-visible': navVisibleClass,
    }"
  >
    <nav
      id="nav"
      class="mx-auto max-w-[1400px] flex items-center rounded-[26px] border transition-all duration-300 px-3 sm:px-4"
      :class="[
        navFixedClass ? 'nav-surface nav-fixed shadow-[0_16px_50px_rgba(15,23,42,0.10)]' : 'nav-surface shadow-[0_10px_30px_rgba(15,23,42,0.06)]',
        navShrinkClass ? 'h-[50px]' : 'h-[64px]',
      ]"
    >
      <div id="nav-group" class="flex items-center w-full relative gap-2">
        <div v-if="navMenu.length > 0" class="back-home-button relative mr-2">
          <button class="nav-icon-btn" title="导航菜单" @click="toggleBackMenu">
            <i class="anzhiyufont anzhiyu-icon-grip-vertical text-lg" />
          </button>
          <Teleport to="body">
            <div v-if="backMenuOpen" class="fixed inset-0 z-[100]" @click="backMenuOpen = false">
              <div
                class="absolute top-[72px] left-3 sm:left-4 bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] rounded-[24px] shadow-[0_18px_40px_rgba(15,23,42,0.14)] p-4 min-w-[300px] max-h-[60vh] overflow-y-auto"
                @click.stop
              >
                <div v-for="group in navMenu" :key="group.title" class="mb-4 last:mb-0">
                  <div class="text-xs font-bold text-[var(--anzhiyu-secondtext)] uppercase mb-2 px-1">{{ group.title }}</div>
                  <div class="flex flex-wrap gap-2">
                    <a
                      v-for="item in group.item"
                      :key="item.name"
                      :href="item.link"
                      class="back-menu-item flex flex-col items-center p-2 rounded-xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] w-[7rem] h-[4.2rem] justify-between hover:text-[var(--anzhiyu-main)] hover:border-[var(--anzhiyu-main)] transition-colors text-sm no-underline"
                    >
                      <img v-if="useImageIcon(item.icon)" :src="item.icon" :alt="item.name" class="w-6 h-6 object-contain" />
                      <i v-else :class="item.icon" class="w-6 h-6 text-lg flex items-center justify-center" />
                      <span class="text-xs truncate max-w-full">{{ item.name }}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <a id="site-name" href="/" :accesskey="homeAccessKey" class="brand-chip flex items-center gap-2 no-underline transition-colors">
          <span class="brand-icon">
            <i class="anzhiyufont anzhiyu-icon-house-chimney text-base" />
          </span>
          <span class="flex flex-col leading-none">
            <span class="title text-[15px] sm:text-base font-bold text-[var(--anzhiyu-fontcolor)]">{{ siteName }}</span>
            <span class="hidden sm:block text-[11px] text-[var(--anzhiyu-secondtext)] tracking-[0.24em] uppercase">Anzhiyu Shell</span>
          </span>
        </a>

        <span v-if="nav.clock && clockTime" class="hidden lg:flex ml-2 px-3 py-1 rounded-full text-xs text-[var(--anzhiyu-secondtext)] font-mono bg-[color-mix(in_srgb,var(--anzhiyu-main)_8%,white)] border border-[color-mix(in_srgb,var(--anzhiyu-main)_14%,transparent)]">{{ clockTime }}</span>

        <div class="flex-1" />

        <div v-if="navFixedClass" class="mask-name-container hidden xl:block mr-3">
          <div id="name-container" class="px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--anzhiyu-main)_6%,white)] border border-[color-mix(in_srgb,var(--anzhiyu-main)_12%,transparent)]">
            <a id="page-name" href="javascript:void(0)" class="text-xs text-[var(--anzhiyu-secondtext)] no-underline">{{ route.meta?.title || '首页' }}</a>
          </div>
        </div>

        <div id="menus" class="hidden md:flex items-center gap-1 mr-3 nav-links-shell">
          <NuxtLink
            v-for="link in primaryLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link-item"
            active-class="nav-link-active"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Social icons row (desktop only) -->
        <div v-if="socialLinks.length > 0" id="nav-social" class="hidden md:flex items-center gap-2 mr-3">
          <a
            v-for="link in socialLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener"
            :title="link.name"
            class="social-icon"
          >
            <i v-if="link.icon" :class="link.icon" />
          </a>
        </div>

        <div id="nav-right" class="flex items-center gap-1">
          <div v-if="nav.travelling" class="nav-button only-home hidden lg:block">
            <a class="nav-icon-btn" title="前往" href="javascript:void(0);" rel="external nofollow">
              <i class="anzhiyufont anzhiyu-icon-train text-lg" />
            </a>
          </div>

          <div id="randomPost_button" class="nav-button">
            <a class="nav-icon-btn" title="随机文章" href="javascript:void(0);" @click="toRandomPost">
              <i class="anzhiyufont anzhiyu-icon-dice text-lg" />
            </a>
          </div>

          <div id="search-button" class="nav-button hidden md:block">
            <a class="nav-icon-btn" title="搜索" href="javascript:void(0);" @click="openSearch">
              <i class="anzhiyufont anzhiyu-icon-magnifying-glass text-lg" />
            </a>
          </div>

          <div class="nav-button">
            <button
              class="nav-icon-btn border-none bg-transparent"
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
            <label for="center-console" class="widget nav-icon-btn !w-8 !h-8" title="中控台">
              <i class="left w-[var(--icon-size)] h-[var(--icon-size)] bg-[var(--anzhiyu-fontcolor)] rounded-full transition-all" style="--icon-size: 2px" />
              <i class="widget center w-[var(--icon-size)] h-[var(--icon-size)] bg-[var(--anzhiyu-fontcolor)] rounded-full mx-[2px] transition-all" style="--icon-size: 3px" />
              <i class="widget right w-[var(--icon-size)] h-[var(--icon-size)] bg-[var(--anzhiyu-fontcolor)] rounded-full transition-all" style="--icon-size: 2px" />
            </label>
          </div>

          <div id="nav-totop" class="nav-button hidden md:flex items-center" :class="{ 'totop-hidden': !isScrolledPastThreshold }">
            <a
              class="totopbtn flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-main)] bg-[color-mix(in_srgb,var(--anzhiyu-main)_6%,white)] border border-[color-mix(in_srgb,var(--anzhiyu-main)_12%,transparent)] no-underline cursor-pointer transition-colors"
              href="javascript:void(0);"
              @click="scrollToTop"
            >
              <i class="anzhiyufont anzhiyu-icon-arrow-up" />
              <span id="percent">{{ scrollPercent }}</span>
            </a>
          </div>

          <div id="toggle-menu" class="md:hidden nav-button">
            <a class="nav-icon-btn" title="切换菜单" href="javascript:void(0);" @click="mobileMenuOpen = !mobileMenuOpen">
              <i class="anzhiyufont anzhiyu-icon-bars text-xl" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- Mobile drawer overlay -->
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
        <span class="text-base font-bold text-[var(--anzhiyu-fontcolor)]">导航菜单</span>
        <button class="nav-icon-btn" @click="closeMobileMenu">
          <i class="anzhiyufont anzhiyu-icon-xmark text-lg" />
        </button>
      </div>
      <div class="mobile-drawer-content">
        <div v-for="group in navMenu" :key="group.title" class="mb-4">
          <div class="text-xs font-bold text-[var(--anzhiyu-secondtext)] uppercase mb-2 px-1">{{ group.title }}</div>
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
        <!-- Fallback links when no nav groups -->
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
          class="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-main)] hover:bg-[color-mix(in_srgb,var(--anzhiyu-main)_8%,white)] transition-colors"
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
.nav-surface {
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 88%, white 12%);
  border-color: color-mix(in srgb, var(--style-border-always) 28%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
}

/* Scroll hide/show transitions */
.nav-hide {
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.5s ease 0.1s;
}

.nav-visible {
  transform: translateY(0);
  opacity: 1;
  transition: all 0.5s ease 0.1s;
}

/* Brand chip hover animation */
.brand-chip:hover .brand-icon {
  transform: translateY(-1px) scale(1.02);
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

.brand-chip:hover .title {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, white);
  color: var(--anzhiyu-main);
  transition: all 0.25s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* Nav links shell */
.nav-links-shell {
  padding: 0.25rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 5%, white);
  border: 1px solid color-mix(in srgb, var(--anzhiyu-main) 10%, transparent);
}

.nav-link-item {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.nav-link-item:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  box-shadow: var(--anzhiyu-shadow-main, 0 4px 12px rgba(15, 23, 42, 0.1));
  letter-spacing: 0.3rem;
  font-weight: 700;
}

.nav-link-active {
  color: var(--anzhiyu-main) !important;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, white);
  font-weight: 600;
}

/* Social icons */
.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: var(--anzhiyu-fontcolor);
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-icon:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
}

/* Nav icon buttons */
.nav-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  cursor: pointer;
  color: var(--anzhiyu-fontcolor);
  transition: all 0.2s ease;
}

.nav-icon-btn:hover {
  color: var(--anzhiyu-white);
  background: var(--anzhiyu-main);
  transform: translateY(-1px);
}

/* Dark mode toggle animation */
.dark-mode-animating {
  transform: rotate(360deg);
  transition: transform 0.5s ease;
}

/* Back-to-top visibility */
.totop-hidden {
  transform: scale(0);
  transition: transform 0.3s ease;
}

#nav-totop:not(.totop-hidden) {
  transform: scale(1);
  transition: transform 0.3s ease;
}

.totopbtn:hover #percent {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.totopbtn:hover .anzhiyufont {
  transform: scale(1.2);
  transition: transform 0.3s ease;
}

/* Mobile drawer */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 102;
  background: var(--anzhiyu-maskbg, rgba(0, 0, 0, 0.5));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  opacity: 1;
  visibility: visible;
  transition: all 0.5s ease;
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

.mobile-drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.mobile-drawer-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--style-border-always) 28%, transparent);
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
</style>