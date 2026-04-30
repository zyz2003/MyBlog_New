<script setup lang="ts">
/**
 * Default theme layout
 * Provides header, main content, sidebar, and footer sections
 */

const { activeThemeName } = useTheme()

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Articles', to: '/articles' },
  { label: 'About', to: '/about' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-text font-body">
    <!-- Header -->
    <header
      v-if="activeThemeName"
      class="border-b border-gray-200 bg-white"
    >
      <div class="mx-auto flex max-w-[var(--container-max)] items-center justify-between px-[var(--content-padding)] py-4">
        <!-- Site name -->
        <NuxtLink to="/" class="text-xl font-bold font-heading text-text">
          My Blog
        </NuxtLink>

        <!-- Navigation -->
        <nav class="flex gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-text-muted transition-colors hover:text-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main content area -->
    <div class="mx-auto flex w-full max-w-[var(--container-max)] flex-1 gap-8 px-[var(--content-padding)] py-8">
      <!-- Content -->
      <main class="min-w-0 flex-1">
        <slot />
      </main>

      <!-- Sidebar -->
      <aside
        v-if="$slots.sidebar"
        class="hidden w-64 shrink-0 lg:block"
      >
        <slot name="sidebar" />
      </aside>
    </div>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-surface">
      <div class="mx-auto max-w-[var(--container-max)] px-[var(--content-padding)] py-6">
        <div class="flex items-center justify-between text-sm text-text-muted">
          <p>&copy; {{ new Date().getFullYear() }} My Blog. All rights reserved.</p>
          <p>Powered by Nuxt 3</p>
        </div>
      </div>
    </footer>
  </div>
</template>
