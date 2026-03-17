// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtConfig } from 'nuxt/schema'

const config: NuxtConfig = {
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: {
    strict: false,
  },
  // Workspace package aliases
  alias: {
    '@my-blog/core': '../../packages/core/src/index.ts',
    '@my-blog/database': '../../packages/database/src/index.ts',
    '@my-blog/utils': '../../packages/utils/src/index.ts',
    '@my-blog/types': '../../packages/types/src/index.ts',
  },
}

export default config
