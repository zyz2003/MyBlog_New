import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@my-blog/plugin',
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/__tests__/**']
    }
  }
})
