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
      apiBaseUrl: '/api',
    },
    databasePath: process.env.DATABASE_PATH || './data/blog.db',
    // JWT 密钥 - 生产环境必须设置 JWT_SECRET 环境变量
    jwtSecret: process.env.JWT_SECRET,
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
    // 外部和内部依赖配置（用于 server 端）
    externals: {
      inherit: true,
    },
    // 添加 server 目录的别名
    alias: {
      '#db': './server/db.ts',
    },
  },

  // 别名配置（server 端使用）
  alias: {
    '@': '.',
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
