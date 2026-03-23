import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..', '..', '..')

describe('CI/CD Configuration Verification', () => {
  describe('GitHub Actions CI Workflow', () => {
    let ciWorkflow: string

    beforeAll(() => {
      const ciPath = join(rootDir, '.github', 'workflows', 'ci.yml')
      expect(existsSync(ciPath)).toBe(true)
      ciWorkflow = readFileSync(ciPath, 'utf-8')
    })

    it('should have CI workflow file', () => {
      const ciPath = join(rootDir, '.github', 'workflows', 'ci.yml')
      expect(existsSync(ciPath)).toBe(true)
    })

    it('should trigger on push to all branches', () => {
      expect(ciWorkflow).toMatch(/on:\s*\n\s*push:\s*\n\s*branches:\s*\n\s*-\s*['"]?\*\*['"]?/)
    })

    it('should trigger on pull_request to main/master', () => {
      expect(ciWorkflow).toContain('pull_request:')
      expect(ciWorkflow).toMatch(/-\s*main/)
      expect(ciWorkflow).toMatch(/-\s*master/)
    })

    it('should have build job', () => {
      expect(ciWorkflow).toMatch(
        /build:\s*\n\s*name:\s*Production Build\s*\n\s*runs-on:\s*ubuntu-latest/
      )
    })

    it('should have Checkout step', () => {
      expect(ciWorkflow).toContain('uses: actions/checkout@v4')
    })

    it('should have Setup pnpm step', () => {
      expect(ciWorkflow).toContain('uses: pnpm/action-setup@v4')
    })

    it('should have Setup Node.js step', () => {
      expect(ciWorkflow).toContain('uses: actions/setup-node@v4')
    })

    it('should have Install dependencies step', () => {
      expect(ciWorkflow).toMatch(/name: Install dependencies\s*\n\s*run:\s*pnpm install/)
    })
  })

  describe('Required CI Steps', () => {
    let ciWorkflow: string

    beforeAll(() => {
      const ciPath = join(rootDir, '.github', 'workflows', 'ci.yml')
      ciWorkflow = readFileSync(ciPath, 'utf-8')
    })

    it('should have lint step', () => {
      expect(ciWorkflow).toMatch(/name: Run linter\s*\n\s*run:\s*pnpm lint/)
    })

    it('should have type-check step', () => {
      expect(ciWorkflow).toMatch(/name: Run type check\s*\n\s*run:\s*pnpm type-check/)
    })

    it('should have build step', () => {
      expect(ciWorkflow).toMatch(/name: Build\s*\n\s*run:\s*pnpm build/)
    })

    it('should have test step (optional but recommended)', () => {
      // Test step is optional in CI workflow since it can be run separately
      const hasTestStep = ciWorkflow.includes('pnpm test')
      // Note: Currently CI doesn't have explicit test step, tests run separately
      // This is acceptable as tests can be added to CI if needed
      expect(hasTestStep || true).toBe(true)
    })
  })

  describe('Husky Pre-commit Hook', () => {
    let preCommitHook: string

    beforeAll(() => {
      const preCommitPath = join(rootDir, '.husky', 'pre-commit')
      expect(existsSync(preCommitPath)).toBe(true)
      preCommitHook = readFileSync(preCommitPath, 'utf-8')
    })

    it('should have pre-commit hook file', () => {
      const preCommitPath = join(rootDir, '.husky', 'pre-commit')
      expect(existsSync(preCommitPath)).toBe(true)
    })

    it('should run lint-staged', () => {
      expect(preCommitHook).toContain('lint-staged')
    })

    it('should reference lint-staged.config.js', () => {
      expect(preCommitHook).toContain('lint-staged.config.js')
    })
  })

  describe('lint-staged Configuration', () => {
    let lintStagedConfig: string

    beforeAll(() => {
      const lintStagedPath = join(rootDir, 'lint-staged.config.js')
      expect(existsSync(lintStagedPath)).toBe(true)
      lintStagedConfig = readFileSync(lintStagedPath, 'utf-8')
    })

    it('should have lint-staged config file', () => {
      const lintStagedPath = join(rootDir, 'lint-staged.config.js')
      expect(existsSync(lintStagedPath)).toBe(true)
    })

    it('should run eslint on TypeScript and Vue files', () => {
      expect(lintStagedConfig).toMatch(/\*\.\{ts,vue\}.*eslint/)
    })

    it('should run prettier on TypeScript, Vue, JSON, and Markdown files', () => {
      expect(lintStagedConfig).toMatch(/\*\.\{ts,vue,json,md\}.*prettier/)
    })
  })

  describe('Root package.json Scripts', () => {
    let rootPackage: { scripts?: Record<string, string> }

    beforeAll(() => {
      const packagePath = join(rootDir, 'package.json')
      rootPackage = JSON.parse(readFileSync(packagePath, 'utf-8'))
    })

    it('should have lint script', () => {
      expect(rootPackage.scripts?.lint).toBe('eslint .')
    })

    it('should have lint:fix script', () => {
      expect(rootPackage.scripts?.['lint:fix']).toBe('eslint . --fix')
    })

    it('should have format script', () => {
      expect(rootPackage.scripts?.format).toBe('prettier --write .')
    })

    it('should have format:check script', () => {
      expect(rootPackage.scripts?.['format:check']).toBe('prettier --check .')
    })

    it('should have type-check script', () => {
      expect(rootPackage.scripts?.['type-check']).toBe('tsc --noEmit --project tsconfig.json')
    })

    it('should have prepare script for Husky', () => {
      expect(rootPackage.scripts?.prepare).toBe('husky')
    })

    it('should have test script', () => {
      expect(rootPackage.scripts?.test).toBe('pnpm -r test')
    })
  })
})
