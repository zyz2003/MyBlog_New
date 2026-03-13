// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  // SSR 配置
  ssr: true,

  // 运行时配置
  runtimeConfig: {
    public: {
      siteName: 'My Blog',
      siteDescription: '个人博客系统',
    }
  },

  // 路由配置
  router: {
    options: {
      strict: true,
    },
  },

  // Nitro 配置
  nitro: {
    storage: {
      data: {
        driver: 'fs',
        base: './data',
      },
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
