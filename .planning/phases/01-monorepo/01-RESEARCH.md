# Phase 1: Monorepo 脚手架 - Research

**Researched:** 2026-03-17
**Domain:** Monorepo architecture, pnpm workspace, TypeScript, ESLint v9, Husky, CI/CD
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational Monorepo infrastructure for the blog system. This includes pnpm workspace configuration, TypeScript setup with moderate strictness, ESLint v9 flat config for TypeScript and Vue 3, Prettier for formatting, Husky v9 for Git hooks with lint-staged, and GitHub Actions CI/CD pipeline.

The research confirms modern best practices: pnpm workspace uses `pnpm-workspace.yaml` with wildcard patterns, ESLint v9 requires flat config format (`eslint.config.js` or `.mjs`), Husky v9 uses the `prepare` script for automatic installation, and GitHub Actions has native pnpm support.

**Primary recommendation:** Use pnpm workspace with `apps/*` and `packages/*` patterns, ESLint v9 flat config with eslint-plugin-vue, Husky v9 with lint-staged for pre-commit checks, and GitHub Actions with pnpm/action-setup for CI/CD.

<user_constraints>

## User Constraints (from 01-CONTEXT.md)

### Locked Decisions

- 目录结构：标准分离式
  - `apps/` - 应用 (site, admin)
  - `packages/` - 共享包 (core, database, utils, types, cli)
  - `themes/` - 主题文件夹（独立）
  - `docs/` - 文档
- 初始包：完整结构（core, database, utils, types, cli 五个包）
- Workspace 配置：通配符自动发现 (`apps/*`, `packages/*`, `themes/*`)
- 包命名：使用 scoped 包名 `@my-blog/*`
- TypeScript 配置方式：基础 + extends 模式
  - 根目录 `tsconfig.json` 定义基础配置
  - 每个包 `tsconfig.json` extends 根配置并可覆盖
- TypeScript 严格模式：适度严格
  - 开启 `noImplicitAny: true`
  - 开启 `strictNullChecks: true`
  - 开启 `noUnusedLocals: true`
  - 不开启完整 `strict: true`
- TypeScript 路径别名：混合式
  - `@/*` 指向当前包的 `src/*`
  - `@my-blog/*` 用于跨包引用
- 每个包使用 `src/` 目录（标准 npm 包结构）
- ESLint 版本：Flat config (ESLint v9) - `eslint.config.js`
- ESLint 规则集：
  - `@typescript-eslint/recommended` - TypeScript 基础规则
  - `eslint-plugin-vue` - Vue 3 项目规则
- Prettier 集成：分离方案
  - 使用 `eslint-config-prettier` 禁用冲突规则
  - ESLint 负责代码质量，Prettier 负责格式化
- Prettier 规则：现代风格
  - 2 空格缩进
  - 单引号
  - 行宽 100
  - 无分号 (`semi: false`)
- Git Hooks 预提交检查：lint-staged 基础方案
  - 仅检查暂存文件的 lint
  - 不运行类型检查和格式化（保持快速）
- Commit 规范：推荐规范（不强制）
  - 不启用 commitlint 强制验证
  - 推荐使用约定式提交格式 (feat/fix/docs 等)
- Husky 位置：`.husky/` 目录（标准方案）
- CI 平台：GitHub Actions
- CI 触发时机：所有 push（任意分支）
- CI 检查内容：
  1. checkout 代码
  2. 安装依赖 (pnpm install)
  3. 运行 lint 检查 (pnpm lint)
  4. 运行类型检查 (pnpm type-check)
  5. 尝试构建 (pnpm build)

### Claude's Discretion

- None identified — all major decisions locked by user

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                           | Research Support                                                      |
| ------- | ------------------------------------- | --------------------------------------------------------------------- |
| CORE-01 | Monorepo 脚手架搭建（pnpm workspace） | pnpm-workspace.yaml format, workspace: protocol, shared lockfile      |
| CORE-02 | TypeScript 配置和类型定义             | Base + extends pattern, moderate strictness, path aliases             |
| CORE-03 | ESLint + Prettier 代码规范            | ESLint v9 flat config, eslint-plugin-vue, eslint-config-prettier      |
| CORE-04 | Git Hooks 配置（Husky）               | Husky v9 prepare script, lint-staged integration                      |
| CORE-05 | CI/CD 基础配置                        | GitHub Actions with pnpm/action-setup, lint/type-check/build pipeline |

</phase_requirements>

## Standard Stack

### Core

| Library     | Version | Purpose                     | Why Standard                                                                                                    |
| ----------- | ------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| pnpm        | 10.x    | Package manager & workspace | Superior monorepo support, disk space efficiency via content-addressable storage, automatic workspace discovery |
| TypeScript  | 5.7.x   | Type system                 | Nuxt 3 ecosystem standard, excellent IDE support, type-safe across packages                                     |
| ESLint      | 9.x     | Linting                     | Flat config format (v9), modern plugin architecture, Vue 3 support via eslint-plugin-vue                        |
| Prettier    | 3.x     | Formatting                  | Opinionated defaults, eliminates style debates, works alongside ESLint                                          |
| Husky       | 9.x     | Git hooks                   | Zero-config setup via prepare script, industry standard for Git hooks                                           |
| lint-staged | 15.x    | Staged file linting         | Fast pre-commit checks on modified files only                                                                   |

### Supporting

| Library                   | Version | Purpose                     | When to Use                                       |
| ------------------------- | ------- | --------------------------- | ------------------------------------------------- |
| eslint-plugin-vue         | 9.x+    | Vue 3 linting rules         | Required for .vue file linting in Nuxt projects   |
| eslint-config-prettier    | 9.x     | Prettier integration        | Disables ESLint rules that conflict with Prettier |
| typescript-eslint         | 8.x     | TypeScript ESLint parser    | Required for linting TypeScript code              |
| globals                   | 15.x    | Global variable definitions | For ESLint flat config browser/node environments  |
| @typescript-eslint/parser | 8.x     | TS parser for ESLint        | Needed when not using tseslint configs            |

### Alternatives Considered

| Instead of            | Could Use          | Tradeoff                                                                |
| --------------------- | ------------------ | ----------------------------------------------------------------------- |
| pnpm workspace        | npm workspaces     | pnpm saves ~50% disk space, faster installs, better workspace isolation |
| pnpm workspace        | yarn workspaces    | yarn has larger lockfile, slower installs, less efficient hoisting      |
| ESLint v9 flat config | ESLint v8 eslintrc | v9 is current standard, v8 config format deprecated but still works     |
| Husky                 | simple-git-hooks   | Husky has better documentation and wider adoption                       |
| GitHub Actions        | GitLab CI          | Project is on GitHub, native integration preferred                      |

**Installation:**

```bash
# Core workspace setup
pnpm init

# Dev tools (root)
pnpm add -D typescript eslint prettier husky lint-staged

# ESLint plugins
pnpm add -D eslint-plugin-vue eslint-config-prettier @typescript-eslint/parser typescript-eslint

# Environment globals
pnpm add -D globals
```

## Architecture Patterns

### Recommended Project Structure

```
my-blog/
├── apps/
│   └── site/              # Main Nuxt 3 application
│       ├── components/
│       ├── composables/
│       ├── pages/
│       ├── server/        # Nitro API routes
│       ├── stores/
│       ├── nuxt.config.ts
│       ├── package.json
│       ├── src/index.ts   # Package entry (if needed)
│       └── tsconfig.json
├── packages/
│   ├── core/              # Core framework (plugins, themes, hooks)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── plugin.ts
│   │   │   └── theme.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── database/          # Database layer (Drizzle ORM + SQLite)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── schema/
│   │   │   └── migrations/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/             # Shared utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── formatDate.ts
│   │   │   └── slugify.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── types/             # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── article.ts
│   │   │   └── user.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── cli/               # CLI tools (optional, for scaffolding)
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── themes/                # Theme packages (standalone)
│   ├── minimal/
│   │   ├── package.json
│   │   ├── theme.json
│   │   └── styles/
│   └── classic/
├── docs/                  # Documentation
│   ├── plugin-dev-guide.md
│   └── theme-dev-guide.md
├── .husky/                # Git hooks
│   └── pre-commit
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .prettierrc
├── eslint.config.js       # ESLint v9 flat config
├── pnpm-workspace.yaml    # Workspace definition
├── pnpm-lock.yaml         # Shared lockfile (workspace)
├── tsconfig.json          # Base TypeScript config
├── tsconfig.base.json     # Shared TypeScript settings
└── package.json           # Root package.json
```

### Pattern 1: pnpm Workspace Discovery

**What:** Automatic workspace package discovery using glob patterns
**When to use:** Standard monorepo setup with apps/, packages/, themes/ directories
**Example:**

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'themes/*'
```

### Pattern 2: Workspace Protocol for Local Dependencies

**What:** Using `workspace:` protocol to reference local packages
**When to use:** Cross-package dependencies within monorepo
**Example:**

```json
{
  "name": "@my-blog/site",
  "dependencies": {
    "@my-blog/core": "workspace:*",
    "@my-blog/database": "workspace:*",
    "@my-blog/utils": "workspace:*",
    "@my-blog/types": "workspace:*"
  }
}
```

Source: [pnpm.io workspace protocol](https://pnpm.io/workspaces)

### Pattern 3: TypeScript Base + Extends Configuration

**What:** Root tsconfig defines base settings, packages extend and override
**When to use:** Consistent TypeScript settings across monorepo
**Example:**

```json
// tsconfig.base.json (shared settings)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": false,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

// tsconfig.json (root - project references)
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/database" },
    { "path": "packages/utils" },
    { "path": "packages/types" },
    { "path": "apps/site" }
  ]
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@my-blog/*": ["../*/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Pattern 4: ESLint v9 Flat Config with Vue 3

**What:** New flat config format for ESLint v9 with Vue 3 and TypeScript support
**When to use:** All new projects, especially Nuxt 3 + Vue 3
**Example:**

```javascript
// eslint.config.js
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  {
    name: 'globals',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    name: 'typescript',
    ...tslint.configs.recommended,
    files: ['**/*.{ts,mts,cts}'],
  },
  {
    name: 'vue',
    ...pluginVue.configs['flat/recommended'],
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    name: 'prettier',
    ...eslintConfigPrettier,
  },
]
```

Source: [eslint-plugin-vue user guide](https://eslint.vuejs.org/user-guide/)

### Pattern 5: Husky v9 with lint-staged

**What:** Pre-commit Git hooks that lint only staged files
**When to use:** Fast pre-commit checks without full type-check or format
**Example:**

```json
// package.json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix"],
    "*.{ts,vue,json,md}": ["prettier --write"]
  }
}
```

```javascript
// .husky/pre-commit (created by npx husky init)
#!/usr/bin/env sh
npx lint-staged
```

Source: [Husky get started](https://typicode.github.io/husky/get-started.html)

### Pattern 6: GitHub Actions CI/CD for pnpm Monorepo

**What:** CI pipeline that runs on every push, checking lint, types, and build
**When to use:** All monorepo projects for quality gates
**Example:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Build
        run: pnpm build
```

Source: [pnpm/action-setup](https://github.com/pnpm/action-setup)

### Anti-Patterns to Avoid

- **Hoisting all dependencies to root:** Keep package-specific deps in each package.json
- **Using relative paths for cross-package imports:** Always use workspace: protocol and @my-blog/\* aliases
- **Running full type-check in pre-commit:** Too slow, let CI handle it
- **Enabling commitlint strictly:** Adds friction early on, recommend but don't enforce
- **Not using sharedWorkspaceLockfile:** Causes duplicate lockfiles and inconsistent versions

## Don't Hand-Roll

| Problem                         | Don't Build                  | Use Instead                           | Why                                                              |
| ------------------------------- | ---------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Workspace dependency resolution | Custom symlink scripts       | pnpm workspace: protocol              | Handles version matching, peer deps, circular deps correctly     |
| TypeScript project references   | Manual tsconfig management   | TypeScript solution style             | Built-in incremental compilation, IDE support                    |
| Git hook management             | Shell scripts in .git/hooks/ | Husky v9                              | Cross-platform, versioned with project, auto-install via prepare |
| ESLint config for Vue/TS        | Custom parser configs        | eslint-plugin-vue + typescript-eslint | Maintained by framework teams, updated with new syntax           |
| CI/CD pipeline                  | Custom scripts               | GitHub Actions + pnpm/action-setup    | Native pnpm caching, parallel jobs, matrix testing               |

**Key insight:** Monorepo tooling is mature. Building custom solutions leads to edge cases (peer dependency resolution, circular references, incremental builds) that standard tools already solve.

## Common Pitfalls

### Pitfall 1: Workspace Protocol Misuse

**What goes wrong:** Using `*` instead of `workspace:*` for local packages
**Why it happens:** Habit from npm package management
**How to avoid:** Always use `workspace:*` for @my-blog/\* packages, ensures local resolution
**Warning signs:** pnpm warns about missing versions, imports resolve to npm instead of local

### Pitfall 2: ESLint v9 Flat Config Migration

**What goes wrong:** Using old eslintrc format in ESLint v9
**Why it happens:** Most online examples still use eslintrc format
**How to avoid:** Use `.js` or `.mjs` config file with `export default []` array format
**Warning signs:** "ESLint configuration error", "Invalid config format"

### Pitfall 3: TypeScript Path Aliases Not Resolving

**What goes wrong:** `@my-blog/*` imports work in IDE but fail at runtime/build
**Why it happens:** TypeScript paths need bundler configuration (Nuxt/Vite) to resolve
**How to avoid:** Configure both tsconfig.json AND bundler (nuxt.config.ts vite.resolve.alias)
**Warning signs:** IDE shows no errors but build fails with "module not found"

### Pitfall 4: Husky Not Installing on Clone

**What goes wrong:** Git hooks don't run after `git clone`
**Why it happens:** prepare script not run, or .husky/ directory not tracked
**How to avoid:** Ensure `prepare: husky` in package.json, verify .husky/ is in git
**Warning signs:** git commit skips pre-commit hook, no lint-staged execution

### Pitfall 5: CI/CD Cache Misses

**What goes wrong:** Every CI run reinstalls all dependencies
**Why it happens:** pnpm cache key not configured correctly
**How to avoid:** Use `cache: 'pnpm'` in actions/setup-node, or explicit cache step
**Warning signs:** CI takes 5+ minutes on install step

### Pitfall 6: Shared Lockfile Conflicts

**What goes wrong:** Multiple developers have different pnpm-lock.yaml versions
**Why it happens:** workspace packages added without committing lockfile
**How to avoid:** Always commit pnpm-lock.yaml after package changes
**Warning signs:** merge conflicts in lockfile, "version mismatch" warnings

## Code Examples

Verified patterns from official sources:

### pnpm-workspace.yaml Setup

```yaml
# Source: https://pnpm.io/workspaces
packages:
  - 'apps/*'
  - 'packages/*'
  - 'themes/*'

settings:
  # Enable shared lockfile for workspace
  sharedWorkspaceLockfile: true

  # Link local packages instead of copying
  linkWorkspacePackages: true
```

### Root package.json with Scripts

```json
{
  "name": "my-blog",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix"],
    "*.{ts,vue,json,md}": ["prettier --write"]
  },
  "devDependencies": {
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-vue": "^9.20.0",
    "globals": "^15.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.2.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=10.0.0"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Husky Pre-commit Hook

```bash
#!/usr/bin/env sh
# .husky/pre-commit
npx lint-staged
```

## State of the Art

| Old Approach                    | Current Approach                      | When Changed     | Impact                                 |
| ------------------------------- | ------------------------------------- | ---------------- | -------------------------------------- |
| ESLint v8 eslintrc (JSON/YAML)  | ESLint v9 flat config (JS/TS modules) | ESLint v9 (2024) | Config is code, supports dynamic rules |
| Husky v4-8 (separate install)   | Husky v9 (prepare script)             | Husky v9 (2024)  | Zero-config, auto-installs on clone    |
| npm/yarn workspaces             | pnpm workspaces                       | Ongoing          | 50% disk savings, faster installs      |
| GitHub Actions setup-node cache | pnpm/action-setup                     | 2024             | Native pnpm caching, simpler config    |
| TypeScript strict: true         | Moderate strictness                   | Best practice    | Faster dev, catches real errors        |

**Deprecated/outdated:**

- ESLint v8 eslintrc format: Still works but deprecated, migrate to flat config
- Husky v8 and earlier: prepare script not automatic, requires manual setup
- yarn.lock for monorepo: pnpm-lock.yaml more efficient for workspaces

## Open Questions

1. **Nuxt 3.14+ compatibility with pnpm workspace**
   - What we know: Nuxt 3 fully supports monorepo setups
   - What's unclear: Specific vite resolver config for @my-blog/\* aliases in apps/site
   - Recommendation: Test workspace imports in apps/site after setup, configure vite.resolve.alias if needed

2. **eslint-plugin-vue flat config presets**
   - What we know: flat/recommended exists
   - What's unclear: Whether flat/vue3-recommended or flat/essential is better for Nuxt
   - Recommendation: Start with flat/recommended, adjust rules as needed

3. **Database package SQLite binary handling**
   - What we know: libsql better-sqlite3 need native bindings
   - What's unclear: How pnpm handles native deps in workspace packages
   - Recommendation: Use pnpm rebuilds script if native modules fail

## Validation Architecture

> Workflow nyquist_validation is enabled in .planning/config.json

### Test Framework

| Property           | Value                                     |
| ------------------ | ----------------------------------------- |
| Framework          | Vitest (Nuxt 3 default)                   |
| Config file        | apps/site/vitest.config.ts (Wave 0 setup) |
| Quick run command  | `pnpm -r test:unit --run -x`              |
| Full suite command | `pnpm -r test --run`                      |

### Phase Requirements → Test Map

| Req ID  | Behavior                               | Test Type   | Automated Command      | File Exists? |
| ------- | -------------------------------------- | ----------- | ---------------------- | ------------ |
| CORE-01 | pnpm workspace resolves local packages | unit        | `pnpm test:workspace`  | ❌ Wave 0    |
| CORE-02 | TypeScript compiles without errors     | type-check  | `pnpm type-check`      | ❌ Wave 0    |
| CORE-03 | ESLint passes on all TS/Vue files      | lint        | `pnpm lint`            | ❌ Wave 0    |
| CORE-04 | Pre-commit hook runs on staged files   | integration | `npx lint-staged`      | ❌ Wave 0    |
| CORE-05 | CI pipeline runs on push               | e2e         | GitHub Actions trigger | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `pnpm lint && pnpm type-check`
- **Per wave merge:** `pnpm -r test --run`
- **Phase gate:** CI green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/site/vitest.config.ts` — Vitest config for Nuxt
- [ ] `packages/*/src/index.test.ts` — Basic unit tests per package
- [ ] `.github/workflows/ci.yml` — CI pipeline (CORE-05)
- [ ] `pnpm test:workspace` script — Workspace resolution test
- [ ] Framework install: `pnpm add -D vitest @nuxt/test-utils` — Not detected

## Sources

### Primary (HIGH confidence)

- [pnpm.io workspaces](https://pnpm.io/workspaces) - Workspace configuration, workspace: protocol
- [ESLint v9 flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) - Flat config format
- [eslint-plugin-vue](https://eslint.vuejs.org/user-guide/) - Vue 3 flat config setup
- [Husky v9](https://typicode.github.io/husky/get-started.html) - prepare script, pre-commit setup
- [pnpm/action-setup](https://github.com/pnpm/action-setup) - GitHub Actions pnpm setup
- [Prettier configuration](https://prettier.io/docs/en/configuration.html) - Options and format

### Secondary (MEDIUM confidence)

- WebSearch for pnpm workspace best practices 2025 - Community patterns
- WebSearch for ESLint v9 Vue 3 setup - Modern config examples
- WebSearch for Husky v9 lint-staged integration - Setup patterns

### Tertiary (LOW confidence)

- WebSearch for Drizzle ORM monorepo setup - Not verified with official docs
- Specific version numbers for 2025 - May need verification at implementation time

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Verified with official documentation (pnpm.io, eslint.org, typicode.github.io/husky)
- Architecture: HIGH - Standard monorepo patterns, user decisions locked
- Pitfalls: MEDIUM - Based on common monorepo issues, some not personally verified

**Research date:** 2026-03-17
**Valid until:** 2026-06-17 (90 days - stable tooling with low churn)
