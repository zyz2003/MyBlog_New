// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 3 SSR is enabled by default
  // Hybrid rendering via routeRules (per A004)

  app: {
    head: {
      meta: [
        { name: 'description', content: '个人博客系统' },
        { property: 'og:site_name', content: process.env.NUXT_PUBLIC_SITE_NAME || 'My Blog' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },

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
    '@nuxtjs/sitemap',
  ],

  css: [
    '@unocss/reset/tailwind-compat.css',
  ],

  // TypeScript strict mode
  typescript: {
    strict: true,
  },

  // Disable appManifest (causes #app-manifest resolve error in dev mode)
  experimental: {
    appManifest: false,
  },

  // Dev server config
  devtools: { enabled: true },

  // Nitro configuration
  nitro: {
    // Custom error handler for unified { code, message } response format
    errorHandler: '~/server/utils/error-handler',
  },

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

  sitemap: {
    hostname: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    exclude: ['/admin/**', '/api/**'],
  } as any,

  // Compatibility
  compatibilityDate: '2025-01-01',
})
