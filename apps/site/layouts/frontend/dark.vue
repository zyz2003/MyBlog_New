<script setup lang="ts">
const config = useRuntimeConfig()
const { initTheme } = useTheme()

// Initialize theme on client
await initTheme()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${config.public.siteName}` : config.public.siteName
  },
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
    },
  ],
})

// Layout config
const navLinks = computed(() => [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: '关于', to: '/about' },
])

// Dark mode is always on for this layout
const isDark = ref(true)

onMounted(() => {
  document.documentElement.classList.add('dark')
})

// Load dynamic nav pages
const { data: navPagesData } = await useFetch<{ code: number; data: Array<{ slug: string; title: string; navLabel: string | null; navOrder: number }> }>('/api/pages/nav')

const dynamicNavLinks = computed(() => {
  return (navPagesData.value?.data ?? [])
    .slice()
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
    .map(p => ({
      label: p.navLabel || p.title || p.slug,
      to: `/${p.slug}`,
    }))
})

const allNavLinks = computed(() => {
  return [...(navLinks.value ?? []), ...dynamicNavLinks.value]
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-primary">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink
            to="/"
            class="text-xl font-bold text-primary hover:text-accent transition-colors"
          >
            {{ config.public.siteName }}
          </NuxtLink>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="link in allNavLinks"
              :key="link.to"
              :to="link.to"
              class="px-4 py-2 text-sm font-medium text-secondary hover:text-accent rounded-lg hover:bg-surface-2 transition-colors"
              active-class="!text-accent !bg-surface-2"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <button class="md:hidden p-2 rounded-lg text-muted hover:bg-surface-2 transition-colors cursor-pointer">
            <span class="i-heroicons-bars-3 w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Plugin mount point: body-end -->
    <MountPointsMountPointBodyEnd />

    <!-- Footer -->
    <footer class="border-t border-border bg-surface">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-muted">
            &copy; {{ new Date().getFullYear() }} {{ config.public.siteName }}. All rights reserved.
          </div>
          <div class="flex items-center gap-4">
            <a href="/rss.xml" class="text-muted hover:text-accent transition-colors" aria-label="RSS Feed">
              <span class="i-heroicons-rss w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener" class="text-muted hover:text-secondary transition-colors" aria-label="GitHub">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
