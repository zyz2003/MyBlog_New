import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
      '~~': path.resolve(__dirname, './'),
    },
  },
  test: {
    name: '@my-blog/site',
    environment: 'happy-dom',
    root: __dirname,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'dist'],
    setupFiles: ['tests/setup.ts'],
    reporters: ['verbose'],
  },
})
