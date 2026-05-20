<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
import { useTheme } from '@/composables/useTheme'

const { nav, search, settings } = useSiteSettings()
const { isDark, toggleDark } = useTheme()

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
const scrollPercent = ref(0)
const isNavFixed = ref(false)
const backMenuOpen = ref(false)
const searchOpen = ref(false)
const allArticles = ref<Array<{ id: number, publishedAt?: string | null, createdAt?: string | null }>>([])
const clockTime = ref('')
const consoleChecked = ref(false)

let clockTimer: ReturnType<typeof setInterval> | null = null
let handleScroll: (() => void) | null = null
let removeSiteActionListeners: (() => void) | null = null

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

onMounted(() => {
  handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    scrollPercent.value = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
    isNavFixed.value = scrollTop > 40
  }

  window.addEventListener('scroll', handleScroll)
  handleScroll()

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
  if (handleScroll) {
    window.removeEventListener('scroll', handleScroll)
  }
  removeSiteActionListeners?.()
})
</script>

<template>
  <header id="page-header" class="sticky top-0 z-50 transition-all duration-300 px-3 sm:px-4 pt-3">
    <nav
      id="nav"
      class="mx-auto max-w-[1400px] h-[64px] flex items-center rounded-[26px] border transition-all duration-300 px-3 sm:px-4"
      :class="isNavFixed ? 'nav-surface nav-fixed shadow-[0_16px_50px_rgba(15,23,42,0.10)]' : 'nav-surface shadow-[0_10px_30px_rgba(15,23,42,0.06)]'"
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

        <div v-if="isNavFixed" class="mask-name-container hidden xl:block mr-3">
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
            <button class="nav-icon-btn border-none bg-transparent" title="切换深色模式" @click="toggleDark">
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

          <div id="nav-totop" class="nav-button hidden md:flex items-center">
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

    <div v-if="mobileMenuOpen" class="mx-auto mt-3 max-w-[1400px] md:hidden">
      <div class="nav-surface rounded-[24px] border px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink
            v-for="link in primaryLinks"
            :key="`mobile-${link.to}`"
            :to="link.to"
            class="nav-link-item justify-center"
            active-class="nav-link-active"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>

  <BlogSearchWidget v-if="searchOpen" @close="searchOpen = false" />
</template>

<style scoped>
.nav-surface {
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 88%, white 12%);
  border-color: color-mix(in srgb, var(--style-border-always) 28%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
}

.brand-chip:hover .brand-icon {
  transform: translateY(-1px) scale(1.02);
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
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
  color: var(--anzhiyu-main);
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, white);
}

.nav-link-active {
  color: var(--anzhiyu-main) !important;
  background: color-mix(in srgb, var(--anzhiyu-main) 12%, white);
  font-weight: 600;
}

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
</style>
