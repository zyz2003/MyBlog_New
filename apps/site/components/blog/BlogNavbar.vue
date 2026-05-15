<script setup lang="ts">
/**
 * BlogNavbar — AnZhiYu nav.pug 1:1 replication
 * Features: menu groups dropdown, clock, random post, search, center console, scroll progress
 */
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'
import { useTheme } from '@/composables/useTheme'

const { settings } = useSiteSettings()
const { isDark, toggleDark } = useTheme()

const config = useRuntimeConfig()
const route = useRoute()
const { getArticles } = usePublicApi()

// Nav config from settings
const navConfig = computed(() => settings.value?.nav ?? { enable: false, travelling: false, clock: false, menu: [] })
const navMenu = computed(() => navConfig.value.menu ?? [])

// Mobile menu state
const mobileMenuOpen = ref(false)
function closeMobileMenu() { mobileMenuOpen.value = false }

// Scroll progress
const scrollPercent = ref(0)
const isNavFixed = ref(false)
onMounted(() => {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    scrollPercent.value = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
    isNavFixed.value = scrollTop > 50
  })
})

// Back-home button menu groups
const backMenuOpen = ref(false)
function toggleBackMenu() { backMenuOpen.value = !backMenuOpen.value }

// Search (placeholder — Phase 4 will implement)
function openSearch() { /* Phase 4: search modal */ }

// Random post
const allArticles = ref<any[]>([])
onMounted(async () => {
  try {
    const { data } = await getArticles({ page: 1, pageSize: 100 })
    allArticles.value = (data.value as any)?.data?.items ?? []
  } catch { /* silently fail */ }
})
function toRandomPost() {
  if (allArticles.value.length === 0) return
  const randomArticle = allArticles.value[Math.floor(Math.random() * allArticles.value.length)]
  const date = new Date(randomArticle.publishedAt || randomArticle.createdAt)
  navigateTo(`/articles/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${randomArticle.id}`)
}

// Clock display
const clockTime = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if (navConfig.value.clock) {
    clockTimer = setInterval(() => {
      clockTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }, 1000)
  }
})
onUnmounted(() => { if (clockTimer) clearInterval(clockTimer) })

// Center console toggle (checkbox hack from nav.pug)
const consoleChecked = ref(false)
</script>

<template>
  <header
    id="page-header"
    class="sticky top-0 z-50 transition-all duration-300"
    :class="isNavFixed ? 'nav-fixed' : ''"
    :style="{
      background: isNavFixed ? 'var(--anzhiyu-card-bg)' : 'transparent',
      backdropFilter: isNavFixed ? 'blur(20px) saturate(180%)' : 'none',
    }"
  >
    <nav id="nav" class="max-w-[1400px] mx-auto px-4 h-[60px] flex items-center">
      <div id="nav-group" class="flex items-center w-full relative">
        <!-- Left: back-home button with menu groups -->
        <div v-if="navMenu.length > 0" class="back-home-button relative mr-2">
          <button
            class="flex items-center justify-center w-8 h-8 cursor-pointer text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-main)] transition-colors"
            title="导航菜单"
            @click="toggleBackMenu"
          >
            <i class="anzhiyufont anzhiyu-icon-grip-vertical text-lg" />
          </button>
          <!-- Dropdown menu groups -->
          <Teleport to="body">
            <div
              v-if="backMenuOpen"
              class="fixed inset-0 z-[100]"
              @click="backMenuOpen = false"
            >
              <div
                class="absolute top-[60px] left-4 bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] rounded-2xl shadow-lg p-4 min-w-[280px] max-h-[60vh] overflow-y-auto"
                @click.stop
              >
                <div v-for="group in navMenu" :key="group.title" class="mb-4 last:mb-0">
                  <div class="text-xs font-bold text-[var(--anzhiyu-secondtext)] uppercase mb-2 px-1">
                    {{ group.title }}
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <a
                      v-for="item in group.item"
                      :key="item.name"
                      :href="item.link"
                      class="back-menu-item flex flex-col items-center p-2 rounded-xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] w-[7rem] h-[4.2rem] justify-between hover:text-[var(--anzhiyu-main)] hover:border-[var(--anzhiyu-main)] transition-colors text-sm no-underline"
                      :title="item.name"
                    >
                      <img :src="item.icon" :alt="item.name" class="w-6 h-6 object-contain" />
                      <span class="text-xs truncate max-w-full">{{ item.name }}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <!-- Center: Site name -->
        <a
          id="site-name"
          href="/"
          accesskey="h"
          class="flex items-center gap-1 text-xl font-bold text-[var(--anzhiyu-fontcolor)] no-underline hover:text-[var(--anzhiyu-main)] transition-colors"
        >
          <span class="title">{{ config.public.siteName }}</span>
          <i class="anzhiyufont anzhiyu-icon-house-chimney text-base" />
        </a>

        <!-- Clock (optional) -->
        <span v-if="navConfig.clock && clockTime" class="ml-3 text-sm text-[var(--anzhiyu-secondtext)] font-mono">
          {{ clockTime }}
        </span>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Mask name container (page name on scroll) -->
        <div v-if="isNavFixed" class="mask-name-container hidden md:block mr-4">
          <div id="name-container">
            <a id="page-name" href="javascript:void(0)" class="text-sm text-[var(--anzhiyu-secondtext)] no-underline">
              {{ route.meta?.title || '' }}
            </a>
          </div>
        </div>

        <!-- Desktop nav links -->
        <div id="menus" class="hidden md:flex items-center gap-1 mr-4">
          <NuxtLink
            v-for="link in [{ label: '首页', to: '/' }, { label: '归档', to: '/archive' }]"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1 text-sm text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-main)] rounded-lg transition-colors no-underline"
            active-class="!text-[var(--anzhiyu-main)] font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Right actions -->
        <div id="nav-right" class="flex items-center gap-1">
          <!-- Travelling button (optional) -->
          <div v-if="navConfig.travelling" class="nav-button only-home">
            <a class="site-page social-icon" title="开往" href="javascript:void(0);" rel="external nofollow">
              <i class="anzhiyufont anzhiyu-icon-train text-lg" />
            </a>
          </div>

          <!-- Random post -->
          <div id="randomPost_button" class="nav-button">
            <a
              class="site-page social-icon flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] transition-colors"
              title="随机文章"
              href="javascript:void(0);"
              @click="toRandomPost"
            >
              <i class="anzhiyufont anzhiyu-icon-dice text-lg" />
            </a>
          </div>

          <!-- Search button -->
          <div id="search-button" class="nav-button hidden md:block">
            <a
              class="site-page social-icon search flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] transition-colors"
              title="搜索"
              href="javascript:void(0);"
              @click="openSearch"
            >
              <i class="anzhiyufont anzhiyu-icon-magnifying-glass text-lg" />
            </a>
          </div>

          <!-- Dark mode toggle -->
          <div class="nav-button">
            <button
              class="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] transition-colors border-none bg-transparent"
              title="切换深色模式"
              @click="toggleDark"
            >
              <i v-if="isDark" class="anzhiyufont anzhiyu-icon-moon text-lg" />
              <i v-else class="anzhiyufont anzhiyu-icon-sun text-lg" />
            </button>
          </div>

          <!-- Center Console toggle (checkbox hack) -->
          <div v-if="navConfig.console" class="nav-button">
            <input id="center-console" v-model="consoleChecked" type="checkbox" class="hidden" />
            <label
              for="center-console"
              class="widget flex items-center justify-center w-8 h-8 cursor-pointer"
              title="中控台"
            >
              <i class="left w-[var(--icon-size)] h-[var(--icon-size)] bg-[var(--anzhiyu-fontcolor)] rounded-full transition-all" style="--icon-size: 2px" />
              <i class="widget center w-[var(--icon-size)] h-[var(--icon-size)] bg-[var(--anzhiyu-fontcolor)] rounded-full mx-[2px] transition-all" style="--icon-size: 3px" />
              <i class="widget right w-[var(--icon-size)] h-[var(--icon-size)] bg-[var(--anzhiyu-fontcolor)] rounded-full transition-all" style="--icon-size: 2px" />
            </label>
          </div>

          <!-- Back to top with scroll percentage -->
          <div id="nav-totop" class="nav-button hidden md:flex items-center">
            <a
              class="totopbtn flex items-center gap-1 text-sm text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-main)] no-underline cursor-pointer transition-colors"
              href="javascript:void(0);"
              @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
            >
              <i class="anzhiyufont anzhiyu-icon-arrow-up" />
              <span id="percent">{{ scrollPercent }}</span>
            </a>
          </div>

          <!-- Mobile hamburger -->
          <div id="toggle-menu" class="md:hidden nav-button">
            <a
              class="site-page flex items-center justify-center w-8 h-8 rounded-lg text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-main)] no-underline cursor-pointer transition-colors"
              title="切换菜单"
              href="javascript:void(0);"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <i class="anzhiyufont anzhiyu-icon-bars text-xl" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
