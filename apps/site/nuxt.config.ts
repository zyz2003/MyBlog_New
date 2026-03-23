// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtConfig } from 'nuxt/schema'

const config: NuxtConfig = {
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: {
    strict: false,
  },
  modules: ['shadcn-nuxt', '@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  // Workspace package aliases
  alias: {
    '@my-blog/core': '../../packages/core/src/index.ts',
    '@my-blog/database': '../../packages/database/src/index.ts',
    '@my-blog/utils': '../../packages/utils/src/index.ts',
    '@my-blog/types': '../../packages/types/src/index.ts',
  },
  // Nitro server configuration - use ES2022 for top-level await support
  nitro: {
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
    // Experimental top-level await support
    experimental: {
      asyncContext: true,
    },
    // TypeScript resolution for server files
    typescript: {
      resolveJson: true,
    },
    // Add .ts extension resolution for server imports
    extendRouteRules: {
      '/**': {
        experimental: {
          asyncContext: true,
        },
      },
    },
  },
}

export default config
