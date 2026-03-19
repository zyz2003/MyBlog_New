import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@my-blog/site',
    environment: 'node',
    root: '.',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'dist'],
    setupFiles: ['tests/setup.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.{ts,vue}', 'composables/**/*.{ts,vue}', 'utils/**/*.{ts,vue}'],
      exclude: [
        'node_modules',
        '.nuxt',
        '.output',
        'dist',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
    },
  },
})
