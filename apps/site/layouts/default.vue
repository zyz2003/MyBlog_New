<script setup lang="ts">
/**
 * Default theme layout
 * Per architecture doc: theme = layout.vue + styles.css + config.json
 * Everything is driven by themeConfig — navLinks, sidebar, footer, styles
 */
const config = useRuntimeConfig()
const { themeConfig } = useTheme()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${config.public.siteName}` : config.public.siteName
  },
})

// All layout config from theme — with sensible defaults
const navLinks = computed(() => themeConfig.value?.layout?.navLinks ?? [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: '关于', to: '/about' },
])

const headerPosition = computed(() => themeConfig.value?.layout?.headerPosition ?? 'sticky')
const sidebarPosition = computed(() => themeConfig.value?.layout?.sidebarPosition ?? 'right')
const showSidebar = computed(() => themeConfig.value?.layout?.showSidebar !== false && sidebarPosition.value !== 'none')
const sidebarComponents = computed(() => themeConfig.value?.layout?.sidebarComponents ?? ['category-nav', 'tag-cloud'])
const footerStyle = computed(() => themeConfig.value?.layout?.footerStyle ?? 'simple')

// Theme style bindings
const rootStyle = computed(() => ({
  background: 'var(--color-background, #fff)',
  color: 'var(--color-text, #0F172A)',
  fontFamily: 'var(--font-body, system-ui, sans-serif)',
}))

const headerStyle = computed(() => ({
  background: 'var(--color-surface, #fff)',
  borderBottom: '1px solid var(--color-primary, #3B82F6)15',
}))

const sidebarStyle = computed(() => ({
  width: themeConfig.value?.components?.sidebar?.width ?? '256px',
}))

// Load enabled plugins
const { data: pluginsData } = await useFetch<{ code: number; data: Array<{ name: string; mountPoints: string[]; config: Record<string, unknown>; scriptUrl: string }> }>('/api/plugins/enabled')

const bodyEndPlugins = computed(() => {
  return (pluginsData.value?.data ?? []).filter(p => p.mountPoints.includes('body-end'))
})

useHead({
  script: bodyEndPlugins.value.map(p => ({
    src: p.scriptUrl,
    defer: true,
  })),
})

// Load dynamic nav pages
const { data: navPagesData } = await useFetch<{ code: number; data: Array<{ slug: string; navLabel: string; navOrder: number }> }>('/api/pages/nav')

const dynamicNavLinks = computed(() => {
  return (navPagesData.value?.data ?? [])
    .slice()
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
    .map(p => ({
      label: p.navLabel || p.slug,
      to: `/${p.slug}`,
    }))
})

const allNavLinks = computed(() => {
  const staticLinks = themeConfig.value?.layout?.navLinks ?? [
    { label: '首页', to: '/' },
    { label: '文章', to: '/articles' },
    { label: '关于', to: '/about' },
  ]
  return [...staticLinks, ...dynamicNavLinks.value]
})
</script>

<template>
  <div class="min-h-screen flex flex-col" :style="rootStyle">
    <!-- Header -->
    <header
      :class="{
        'sticky top-0 z-50': headerPosition === 'sticky',
        'fixed top-0 w-full z-50': headerPosition === 'top',
      }"
      :style="headerStyle"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        <NuxtLink to="/" class="text-xl font-bold" :style="{ color: 'var(--color-text, #0F172A)', fontFamily: 'var(--font-heading, system-ui)', transition: 'opacity var(--transition-fast, 0.15s ease)' }">
          {{ config.public.siteName }}
        </NuxtLink>
        <nav class="hidden sm:flex gap-6">
          <NuxtLink
            v-for="link in allNavLinks"
            :key="link.to"
            :to="link.to"
            class="transition-colors"
            :style="{ color: 'var(--color-text-muted, #64748B)', transition: 'color var(--transition-fast, 0.15s ease)' }"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <button class="sm:hidden p-2">
          <span class="i-heroicons-bars-3 text-xl" />
        </button>
      </div>
    </header>

    <!-- Main content -->
    <div class="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 sm:px-6 py-8">
      <main class="min-w-0 flex-1">
        <slot />
      </main>
      <aside v-if="showSidebar" class="hidden shrink-0 lg:block" :style="sidebarStyle">
        <BlogCategoryNav v-if="sidebarComponents.includes('category-nav')" />
        <BlogTagCloud v-if="sidebarComponents.includes('tag-cloud')" class="mt-6" />
      </aside>
    </div>

    <!-- Footer -->
    <footer class="border-t" :style="{ background: 'var(--color-surface, #F8FAFC)', borderColor: 'var(--color-primary, #3B82F6)15' }">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm" :style="{ color: 'var(--color-text-muted, #64748B)' }">
          <p>&copy; {{ new Date().getFullYear() }} {{ config.public.siteName }}. All rights reserved.</p>
          <template v-if="footerStyle === 'detailed'">
            <p>Powered by Nuxt 3 | Theme: {{ themeConfig?.layout?.headerPosition ?? 'default' }}</p>
          </template>
          <template v-else-if="footerStyle === 'minimal'">
            <p>Nuxt 3</p>
          </template>
          <template v-else>
            <p>Powered by Nuxt 3</p>
          </template>
        </div>
      </div>
    </footer>

    <!-- Plugin: body end -->
    <template v-for="plugin in bodyEndPlugins" :key="plugin.name">
      <div :id="`plugin-${plugin.name}`" />
    </template>
  </div>
</template>
