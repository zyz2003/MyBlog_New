<script setup lang="ts">
/**
 * Blog layout — wraps default theme structure
 * Provides header with nav, main content area, sidebar, and footer
 * Uses CSS Variables from theme system with fallback defaults
 */
const config = useRuntimeConfig()

const navLinks = [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: '关于', to: '/about' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--theme-background, #fff); color: var(--theme-text, #0F172A);">
    <!-- Header -->
    <header class="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        <NuxtLink to="/" class="text-xl font-bold" style="color: var(--theme-text, #0F172A);">
          {{ config.public.siteName }}
        </NuxtLink>
        <nav class="hidden sm:flex gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="transition-colors hover:opacity-80"
            style="color: var(--theme-text-muted, #64748B);"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <!-- Mobile menu button -->
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
      <aside class="hidden w-64 shrink-0 lg:block">
        <BlogCategoryNav />
        <BlogTagCloud class="mt-6" />
      </aside>
    </div>

    <!-- Footer -->
    <footer class="border-t border-gray-200" style="background: var(--theme-surface, #F8FAFC);">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm" style="color: var(--theme-text-muted, #64748B);">
          <p>&copy; {{ new Date().getFullYear() }} {{ config.public.siteName }}. All rights reserved.</p>
          <p>Powered by Nuxt 3</p>
        </div>
      </div>
    </footer>
  </div>
</template>
