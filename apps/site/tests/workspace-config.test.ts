import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..', '..', '..')

describe('Workspace Configuration', () => {
  describe('pnpm-workspace.yaml', () => {
    let workspaceConfig: { packages: string[]; settings?: Record<string, unknown> }

    beforeAll(() => {
      const workspacePath = join(rootDir, 'pnpm-workspace.yaml')
      const content = readFileSync(workspacePath, 'utf-8')
      // Simple YAML parsing for the expected structure
      const packagesMatch = content.match(/packages:\s*\n((?:\s+-[^\n]+\n)*)/)
      const packages = packagesMatch
        ? packagesMatch[1]
            .match(/-\s*['"]?([^'"\n]+)['"]?/g)
            ?.map((s) => s.replace(/-\s*['"]?([^'"\n]+)['"]?/, '$1'))
        : []
      workspaceConfig = { packages: packages || [] }
    })

    it('should include apps/* in workspace packages', () => {
      expect(workspaceConfig.packages).toContain('apps/*')
    })

    it('should include packages/* in workspace packages', () => {
      expect(workspaceConfig.packages).toContain('packages/*')
    })

    it('should include themes/* in workspace packages', () => {
      expect(workspaceConfig.packages).toContain('themes/*')
    })
  })

  describe('@my-blog/core package import', () => {
    it('should be able to import @my-blog/core', () => {
      // Test that the package can be resolved
      const corePackagePath = join(rootDir, 'packages', 'core', 'package.json')
      expect(existsSync(corePackagePath)).toBe(true)

      const corePackage = JSON.parse(readFileSync(corePackagePath, 'utf-8'))
      expect(corePackage.name).toBe('@my-blog/core')
      expect(corePackage.exports).toBeDefined()
      expect(corePackage.exports['.']).toBeDefined()
    })

    it('should have correct exports in @my-blog/core', () => {
      const corePackagePath = join(rootDir, 'packages', 'core', 'package.json')
      const corePackage = JSON.parse(readFileSync(corePackagePath, 'utf-8'))

      expect(corePackage.exports['.'].types).toBe('./dist/index.d.ts')
      expect(corePackage.exports['.'].import).toBe('./dist/index.mjs')
      expect(corePackage.exports['.'].require).toBe('./dist/index.js')
    })
  })

  describe('Workspace dependencies linking', () => {
    it('should have @my-blog/core as workspace dependency in @my-blog/site', () => {
      const sitePackagePath = join(rootDir, 'apps', 'site', 'package.json')
      const sitePackage = JSON.parse(readFileSync(sitePackagePath, 'utf-8'))

      expect(sitePackage.dependencies).toBeDefined()
      expect(sitePackage.dependencies['@my-blog/core']).toBe('workspace:*')
    })

    it('should have @my-blog/database as workspace dependency in @my-blog/site', () => {
      const sitePackagePath = join(rootDir, 'apps', 'site', 'package.json')
      const sitePackage = JSON.parse(readFileSync(sitePackagePath, 'utf-8'))

      expect(sitePackage.dependencies).toBeDefined()
      expect(sitePackage.dependencies['@my-blog/database']).toBe('workspace:*')
    })

    it('should have @my-blog/types as workspace dependency in @my-blog/site', () => {
      const sitePackagePath = join(rootDir, 'apps', 'site', 'package.json')
      const sitePackage = JSON.parse(readFileSync(sitePackagePath, 'utf-8'))

      expect(sitePackage.dependencies).toBeDefined()
      expect(sitePackage.dependencies['@my-blog/types']).toBe('workspace:*')
    })

    it('should have @my-blog/utils as workspace dependency in @my-blog/site', () => {
      const sitePackagePath = join(rootDir, 'apps', 'site', 'package.json')
      const sitePackage = JSON.parse(readFileSync(sitePackagePath, 'utf-8'))

      expect(sitePackage.dependencies).toBeDefined()
      expect(sitePackage.dependencies['@my-blog/utils']).toBe('workspace:*')
    })
  })

  describe('peerDependencies configuration', () => {
    it('should have @my-blog/core depend on @my-blog/types', () => {
      const corePackagePath = join(rootDir, 'packages', 'core', 'package.json')
      const corePackage = JSON.parse(readFileSync(corePackagePath, 'utf-8'))

      expect(corePackage.dependencies).toBeDefined()
      expect(corePackage.dependencies['@my-blog/types']).toBe('workspace:*')
    })

    it('should have @my-blog/core depend on @my-blog/utils', () => {
      const corePackagePath = join(rootDir, 'packages', 'core', 'package.json')
      const corePackage = JSON.parse(readFileSync(corePackagePath, 'utf-8'))

      expect(corePackage.dependencies).toBeDefined()
      expect(corePackage.dependencies['@my-blog/utils']).toBe('workspace:*')
    })

    it('should have workspace:* protocol for all internal dependencies', () => {
      const packages = ['core', 'database', 'types', 'utils']
      const workspaceProtocol = 'workspace:*'

      for (const pkg of packages) {
        const pkgPath = join(rootDir, 'packages', pkg, 'package.json')
        if (existsSync(pkgPath)) {
          const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
          const allDeps = {
            ...(pkgJson.dependencies || {}),
            ...(pkgJson.devDependencies || {}),
          }

          for (const [dep, version] of Object.entries(allDeps)) {
            if (dep.startsWith('@my-blog/')) {
              expect(version).toBe(workspaceProtocol)
            }
          }
        }
      }
    })
  })
})
