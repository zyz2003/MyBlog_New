<script setup lang="ts">
const config = useRuntimeConfig()
// Theme CSS is now loaded via <link rel="stylesheet" href="/api/themes/active.css"> in useHead

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${config.public.siteName}` : config.public.siteName
  },
  link: [
    {
      rel: 'stylesheet',
      href: '/api/themes/active.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap',
    },
  ],
})

// Navbar, dark mode, nav links — all handled by BlogNavbar component internally
</script>

<template>
  <!-- Preloader: fullscreen loading overlay on initial page load -->
  <BlogPreloader />

  <div class="min-h-screen flex flex-col bg-background transition-colors duration-300">
    <!-- Navbar: replaced by BlogNavbar component (AnZhiYu nav.pug replication) -->
    <BlogNavbar />

    <!-- Main content -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Plugin mount point: body-end -->
    <MountPointsMountPointBodyEnd />

    <!-- Footer: replaced by BlogFooter component (AnZhiYu footer.pug replication) -->
    <BlogFooter />
  </div>

  <!-- Rightside action buttons (fixed position) -->
  <BlogRightsideButtons />

  <!-- Custom right-click context menu -->
  <BlogRightClickMenu />
</template>
