# Phase 1: Monorepo 脚手架 - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

创建可运行的 Monorepo 基础架构，包括 pnpm workspace、TypeScript 配置、ESLint + Prettier 代码规范、Git Hooks (Husky) 和 GitHub Actions CI/CD 配置。

**交付物:**

- 可运行的空项目
- pnpm workspace 配置
- 5 个初始包：@my-blog/core, @my-blog/database, @my-blog/utils, @my-blog/types, @my-blog/cli
- 完整的代码规范和 CI/CD 流程

</domain>

<decisions>
## Implementation Decisions

### Monorepo 结构设计

- 目录结构：标准分离式
  - `apps/` - 应用 (site, admin)
  - `packages/` - 共享包 (core, database, utils, types, cli)
  - `themes/` - 主题文件夹（独立）
  - `docs/` - 文档
- 初始包：完整结构（core, database, utils, types, cli 五个包）
- Workspace 配置：通配符自动发现 (`apps/*`, `packages/*`, `themes/*`)
- 包命名：使用 scoped 包名 `@my-blog/*`

### TypeScript 配置策略

- 配置方式：基础 + extends 模式
  - 根目录 `tsconfig.json` 定义基础配置
  - 每个包 `tsconfig.json` extends 根配置并可覆盖
- 严格模式：适度严格
  - 开启 `noImplicitAny: true`
  - 开启 `strictNullChecks: true`
  - 开启 `noUnusedLocals: true`
  - 不开启完整 `strict: true`
- 路径别名：混合式
  - `@/*` 指向当前包的 `src/*`
  - `@my-blog/*` 用于跨包引用
- 源码位置：每个包使用 `src/` 目录（标准 npm 包结构）

### 代码规范工具配置

- ESLint 版本：Flat config (ESLint v9) - `eslint.config.js`
- 规则集：
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

### Git Hooks 设计

- 预提交检查：lint-staged 基础方案
  - 仅检查暂存文件的 lint
  - 不运行类型检查和格式化（保持快速）
- Commit 规范：推荐规范（不强制）
  - 不启用 commitlint 强制验证
  - 推荐使用约定式提交格式 (feat/fix/docs 等)
- Husky 位置：`.husky/` 目录（标准方案）

### CI/CD 基础配置

- CI 平台：GitHub Actions
- 触发时机：所有 push（任意分支）
- 检查内容：
  1. checkout 代码
  2. 安装依赖 (pnpm install)
  3. 运行 lint 检查 (pnpm lint)
  4. 运行类型检查 (pnpm type-check)
  5. 尝试构建 (pnpm build)

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- 无 - Phase 1 是项目初始化，没有现有代码可复用

### Established Patterns

- 无 - Phase 1 是项目初始化，没有现有模式

### Integration Points

- 无 - Phase 1 是项目初始化，没有现有系统需要集成

</code_context>

<specifics>
## Specific Ideas

- 使用 `@my-blog/*` scoped 包名，更专业且避免命名冲突
- ESLint 使用最新的 v9 flat config 格式
- Prettier 规则采用现代 JS 风格（无分号、单引号）
- CI/CD 在每次 push 时触发，尽早发现问题

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-monorepo_
_Context gathered: 2026-03-17_
