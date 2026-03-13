// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  // SPA 模式 (后台不需要 SSR)
  ssr: false,

  // 运行时配置
  runtimeConfig: {
    public: {
      apiBaseUrl: '/api',
    }
  },

  // 路由配置
  router: {
    options: {
      strict: true,
    },
  },

  // 类型检查
  typescript: {
    strict: true,
  },

  // 性能优化
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },
})
