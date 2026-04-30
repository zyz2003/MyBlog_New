// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 3 SSR is enabled by default
  // Hybrid rendering via routeRules (per A004)

  routeRules: {
    // 前台博客 — SSR with SWR caching
    '/': { prerender: true },
    '/articles/**': { swr: 3600 },
    '/categories/**': { swr: 3600 },
    '/tags/**': { swr: 3600 },
    '/pages/**': { swr: 3600 },
    '/about': { prerender: true },
    '/search': { ssr: true },

    // 后台管理 — SPA (no SSR) (per A004)
    '/admin/**': { ssr: false },
  },

  modules: [
    '@unocss/nuxt',
  ],

  css: [
    '@unocss/reset/tailwind-compat.css',
  ],

  // TypeScript strict mode
  typescript: {
    strict: true,
  },

  // Dev server config
  devtools: { enabled: true },

  // Compatibility
  compatibilityDate: '2025-01-01',
})
