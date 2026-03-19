import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Workspace root config - delegates to individual packages
    // See packages/*/vitest.config.ts for package-specific configs
  },
})
