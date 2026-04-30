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
    '@pinia/nuxt',
  ],

  css: [
    '@unocss/reset/tailwind-compat.css',
  ],

  // TypeScript strict mode
  typescript: {
    strict: true,
  },

  // Custom error handler for unified { code, message } response format
  nitro: {
    errorHandler: '~/server/utils/error-handler',
  },

  // Dev server config
  devtools: { enabled: true },

  // Per FOUND-05: Environment variable management
  runtimeConfig: {
    // Server-only (not exposed to client)
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    databaseUrl: process.env.DATABASE_URL || './database/blog.sqlite',

    // Public (exposed to client via useRuntimeConfig)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'My Blog',
    },
  },

  // Compatibility
  compatibilityDate: '2025-01-01',
})
