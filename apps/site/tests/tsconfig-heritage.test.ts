import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..', '..', '..')

interface TsConfig {
  extends?: string
  compilerOptions?: {
    outDir?: string
    rootDir?: string
    baseUrl?: string
    paths?: Record<string, string[]>
    [key: string]: unknown
  }
  include?: string[]
  exclude?: string[]
}

function readTsConfig(path: string): TsConfig {
  const fullPath = join(rootDir, path)
  expect(existsSync(fullPath)).toBe(true)
  return JSON.parse(readFileSync(fullPath, 'utf-8'))
}

describe('TypeScript Configuration Heritage', () => {
  describe('Base tsconfig.base.json', () => {
    let baseConfig: TsConfig

    beforeAll(() => {
      baseConfig = readTsConfig('tsconfig.base.json')
    })

    it('should exist and be valid', () => {
      expect(baseConfig).toBeDefined()
      expect(baseConfig.compilerOptions).toBeDefined()
    })

    it('should have target ES2022', () => {
      expect(baseConfig.compilerOptions?.target).toBe('ES2022')
    })

    it('should have module ESNext', () => {
      expect(baseConfig.compilerOptions?.module).toBe('ESNext')
    })

    it('should have strict null checks enabled', () => {
      expect(baseConfig.compilerOptions?.strictNullChecks).toBe(true)
    })

    it('should have noImplicitAny enabled', () => {
      expect(baseConfig.compilerOptions?.noImplicitAny).toBe(true)
    })

    it('should have noUnusedLocals enabled', () => {
      expect(baseConfig.compilerOptions?.noUnusedLocals).toBe(true)
    })

    it('should have skipLibCheck enabled', () => {
      expect(baseConfig.compilerOptions?.skipLibCheck).toBe(true)
    })
  })

  describe('Root tsconfig.json', () => {
    let rootConfig: TsConfig

    beforeAll(() => {
      rootConfig = readTsConfig('tsconfig.json')
    })

    it('should extend tsconfig.base.json', () => {
      expect(rootConfig.extends).toBe('./tsconfig.base.json')
    })

    it('should have references to all packages', () => {
      // Read as text to check references
      const content = readFileSync(join(rootDir, 'tsconfig.json'), 'utf-8')
      expect(content).toContain('"path": "packages/core"')
      expect(content).toContain('"path": "packages/database"')
      expect(content).toContain('"path": "packages/utils"')
      expect(content).toContain('"path": "packages/types"')
      expect(content).toContain('"path": "apps/site"')
    })
  })

  describe('apps/site tsconfig.json', () => {
    let siteConfig: TsConfig

    beforeAll(() => {
      siteConfig = readTsConfig('apps/site/tsconfig.json')
    })

    it('should extend base config', () => {
      expect(siteConfig.extends).toBe('../../tsconfig.base.json')
    })

    it('should have correct baseUrl', () => {
      expect(siteConfig.compilerOptions?.baseUrl).toBe('.')
    })

    it('should have @/* path alias', () => {
      expect(siteConfig.compilerOptions?.paths?.['@/*']).toEqual(['src/*'])
    })

    it('should have @my-blog/* path alias for workspace packages', () => {
      expect(siteConfig.compilerOptions?.paths?.['@my-blog/*']).toEqual(['../../packages/*/src'])
    })

    it('should include TypeScript and Vue files', () => {
      expect(siteConfig.include).toEqual(['**/*.ts', '**/*.vue'])
    })

    it('should exclude node_modules, .nuxt, and dist', () => {
      expect(siteConfig.exclude).toContain('node_modules')
      expect(siteConfig.exclude).toContain('.nuxt')
      expect(siteConfig.exclude).toContain('dist')
    })
  })

  describe('packages/core tsconfig.json', () => {
    let coreConfig: TsConfig

    beforeAll(() => {
      coreConfig = readTsConfig('packages/core/tsconfig.json')
    })

    it('should extend base config', () => {
      expect(coreConfig.extends).toBe('../../tsconfig.base.json')
    })

    it('should have correct outDir', () => {
      expect(coreConfig.compilerOptions?.outDir).toBe('./dist')
    })

    it('should have correct rootDir', () => {
      expect(coreConfig.compilerOptions?.rootDir).toBe('./src')
    })

    it('should have @/* path alias', () => {
      expect(coreConfig.compilerOptions?.paths?.['@/*']).toEqual(['src/*'])
    })

    it('should include only src TypeScript files', () => {
      expect(coreConfig.include).toEqual(['src/**/*.ts'])
    })
  })

  describe('packages/database tsconfig.json', () => {
    let dbConfig: TsConfig

    beforeAll(() => {
      dbConfig = readTsConfig('packages/database/tsconfig.json')
    })

    it('should extend base config', () => {
      expect(dbConfig.extends).toBe('../../tsconfig.base.json')
    })

    it('should have correct outDir', () => {
      expect(dbConfig.compilerOptions?.outDir).toBe('./dist')
    })

    it('should have correct rootDir', () => {
      expect(dbConfig.compilerOptions?.rootDir).toBe('./src')
    })

    it('should have @/* path alias', () => {
      expect(dbConfig.compilerOptions?.paths?.['@/*']).toEqual(['src/*'])
    })
  })

  describe('packages/types tsconfig.json', () => {
    let typesConfig: TsConfig

    beforeAll(() => {
      typesConfig = readTsConfig('packages/types/tsconfig.json')
    })

    it('should extend base config', () => {
      expect(typesConfig.extends).toBe('../../tsconfig.base.json')
    })

    it('should have correct outDir', () => {
      expect(typesConfig.compilerOptions?.outDir).toBe('./dist')
    })

    it('should have correct rootDir', () => {
      expect(typesConfig.compilerOptions?.rootDir).toBe('./src')
    })
  })

  describe('packages/utils tsconfig.json', () => {
    let utilsConfig: TsConfig

    beforeAll(() => {
      utilsConfig = readTsConfig('packages/utils/tsconfig.json')
    })

    it('should extend base config', () => {
      expect(utilsConfig.extends).toBe('../../tsconfig.base.json')
    })

    it('should have correct outDir', () => {
      expect(utilsConfig.compilerOptions?.outDir).toBe('./dist')
    })

    it('should have correct rootDir', () => {
      expect(utilsConfig.compilerOptions?.rootDir).toBe('./src')
    })
  })

  describe('Path Alias Resolution', () => {
    it('should have consistent @/* alias across all packages', () => {
      const configs = [
        'apps/site/tsconfig.json',
        'packages/core/tsconfig.json',
        'packages/database/tsconfig.json',
        'packages/types/tsconfig.json',
        'packages/utils/tsconfig.json',
      ]

      for (const configPath of configs) {
        const config = readTsConfig(configPath)
        expect(config.compilerOptions?.paths?.['@/*']).toEqual(['src/*'])
      }
    })

    it('should have @my-blog/* alias in apps/site for workspace packages', () => {
      const siteConfig = readTsConfig('apps/site/tsconfig.json')
      expect(siteConfig.compilerOptions?.paths?.['@my-blog/*']).toEqual(['../../packages/*/src'])
    })
  })
})
