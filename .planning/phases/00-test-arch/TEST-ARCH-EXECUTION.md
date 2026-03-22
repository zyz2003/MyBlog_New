---
phase: 00-test-arch
plan: TEST-ARCH
subplan: EXECUTION
priority: critical
created: 2026-03-21
---

# 测试架构系统性整改 - 详细执行清单

## 核心原则 (不可违背)

```
❌ 错误做法：
  正式代码有 bug → 修改测试文件让它"通过" → 掩盖问题

✅ 正确做法：
  测试失败 → 定位问题 → 修复正式代码 → 测试通过 → 问题真正解决
```

---

## Phase 1 (Monorepo 脚手架) - 已完成代码的测试补充

### 1.1 pnpm workspace 配置验证

**创建文件：** `tests/workspace-config.test.ts`

**测试内容：**

```typescript
describe('Workspace Configuration', () => {
  it('workspace dependencies are correctly linked', () => {
    // 验证 @my-blog/core 可以被正确导入
    expect(() => import('@my-blog/core')).not.toThrow()
  })

  it('workspace packages have correct peer dependencies', () => {
    // 验证所有 packages 的 peerDependencies 配置正确
  })
})
```

**验收标准：**

- 如果测试失败 → 修复 `pnpm-workspace.yaml` 或 `package.json`
- 不修改测试文件来"通过"测试

### 1.2 TypeScript 配置验证

**创建文件：** `tests/tsconfig-heritage.test.ts`

**测试内容：**

```typescript
describe('TypeScript Configuration', () => {
  it('all packages extend base config correctly', () => {
    // 验证每个 tsconfig.json 正确继承 tsconfig.base.json
  })

  it('path aliases resolve correctly', () => {
    // 验证 @/_ 路径解析正确
  })
})
```

### 1.3 CI/CD 配置验证

**创建文件：** `tests/ci-config-verification.test.ts`

**测试内容：**

```typescript
describe('CI/CD Configuration', () => {
  it('CI workflow contains required steps', () => {
    // 验证 .github/workflows/ci.yml 包含 lint, type-check, build, test
  })

  it('Husky pre-commit hook runs correctly', () => {
    // 验证 .husky/pre-commit 配置正确
  })
})
```

---

## Phase 2 (核心框架) - 已完成代码的测试审查

### 2.1 插件系统测试审查

**审查文件：** `packages/plugin/src/__tests__/*.test.ts`

**审查要点：**

1. 测试是否基于插件系统需求 (REQUIREMENTS.md)？
2. 如果测试失败，是否修复 plugin-manager.ts 而非测试文件？
3. 16 个挂载点是否都有对应测试？

**可能需要创建：**

- `tests/integration/plugin-lifecycle.test.ts` - 插件生命周期集成测试
- `tests/integration/plugin-hook-integration.test.ts` - 插件挂载点协同测试

### 2.2 主题系统测试审查

**审查文件：** `packages/core/theme/__tests__/theme-manager.test.ts`

**审查要点：**

1. 测试是否基于主题系统需求？
2. CSS Variables 切换是否有测试验证？
3. 主题配置文件解析是否有测试？

**可能需要创建：**

- `tests/integration/theme-switch-e2e.test.ts` - 主题切换端到端测试
- `tests/contract/theme-css-variables.test.ts` - CSS 变量契约验证

---

## Phase 3 (数据库层) - 已完成代码的测试增强

### 3.1 Schema 验证 (已完整)

**已有文件：**

- `apps/site/tests/schema-sync.test.ts` ✅
- `scripts/verify-schema.ts` ✅

**无需额外工作**

### 3.2 迁移验证

**创建文件：** `tests/migration-validation.test.ts`

**测试内容：**

```typescript
describe('Database Migrations', () => {
  it('migration files are idempotent', async () => {
    // 验证迁移文件可以重复执行
    await runMigrations()
    await runMigrations() // 第二次不应失败
  })

  it('migration rollback strategy exists', () => {
    // 验证每个迁移文件都有对应的回滚策略
  })
})
```

### 3.3 Schema 向后兼容性验证

**创建文件：** `tests/schema-backward-compat.test.ts`

**测试内容：**

```typescript
describe('Schema Backward Compatibility', () => {
  it('schema changes do not break existing queries', () => {
    // 验证 Schema 变更不会破坏现有查询
  })

  it('new fields have default values', () => {
    // 验证新增字段有默认值，不影响旧数据
  })
})
```

---

## Phase 4 (API 层) - 进行中代码的测试规范

### 4.1 已完成计划 (04-00 至 04-07) 审查

**审查清单：**

| 计划  | 测试文件                                  | 审查状态  | 行动                   |
| ----- | ----------------------------------------- | --------- | ---------------------- |
| 04-00 | `tests/db.test.ts`                        | ⚠️ 需审查 | 确保基于正式 Schema    |
| 04-01 | `tests/server/utils/response.test.ts`     | ✅ 已审查 | 单元测试，无依赖问题   |
| 04-02 | `tests/server/schemas/validation.test.ts` | ✅ 已审查 | Zod 验证，基于 schemas |
| 04-03 | `tests/server/middleware/auth.test.ts`    | ✅ 已审查 | JWT 中间件测试         |
| 04-04 | `tests/server/middleware/*.test.ts`       | ✅ 已审查 | 中间件测试             |
| 04-05 | Swagger 文档                              | N/A       | 无测试需求             |
| 04-06 | `tests/server/api/auth.test.ts`           | ⚠️ 需审查 | API 契约测试           |
| 04-07 | `tests/server/api/auth.test.ts`           | ⚠️ 需审查 | API 契约测试           |

**重点修复：**

- `updatePost` bug → 修复 `post.service.ts`，不修改测试

### 4.2 未完成计划 (04-08 至 04-16) 要求

**每个 API 计划必须包含：**

```
1. API 契约测试 (验证响应格式符合 REQUIREMENTS.md)
2. 参数验证测试 (验证 Zod schemas)
3. 错误处理测试 (验证 HTTPError 处理)
4. 集成测试 (验证服务层 + 数据库层协作)
```

**测试模板：**

```typescript
// API 契约测试示例
describe('Posts API Contract', () => {
  describe('GET /api/posts', () => {
    it('returns posts in standard response format', async () => {
      // 验证响应格式符合 API-08 要求
      const response = await $fetch('/api/posts')

      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('data')
      expect(response.data).toHaveProperty('items')
      expect(response.data).toHaveProperty('total')
      expect(response.data).toHaveProperty('limit')
      expect(response.data).toHaveProperty('offset')
    })

    it('returns 400 for invalid query params', async () => {
      // 验证参数验证生效
      await expect($fetch('/api/posts?limit=invalid')).rejects.toThrow('Bad Request')
    })

    it('filters posts by status correctly', async () => {
      // 验证过滤功能符合需求
    })
  })
})
```

---

## Phase 5-11 (未来阶段) - 前置测试要求

### 前置要求清单

在开始每个新 Phase 之前，必须满足：

1. **测试架构理解**
   - [ ] 理解四层测试架构
   - [ ] 理解"测试是验证者，不是迁就者"原则
   - [ ] 理解测试依据是规范而非实现

2. **测试环境准备**
   - [ ] Vitest 配置正确
   - [ ] 测试数据库工具可用
   - [ ] Mock 工具可用

3. **测试模板准备**
   - [ ] 单元测试模板
   - [ ] 集成测试模板
   - [ ] API 契约测试模板
   - [ ] E2E 测试模板 (Phase 5+)

### Phase 5 (后台管理) 特定要求

```
1. 组件单元测试 (Vitest + Vue Test Utils)
2. 页面集成测试
3. API 集成测试 (验证前端 + 后端协作)
4. E2E 测试 (Playwright - 验证完整管理流程)
```

### Phase 6 (前台博客) 特定要求

```
1. SSR 组件测试
2. SEO 元词验证测试
3. 性能测试 (首屏加载时间)
4. E2E 测试 (用户浏览流程)
```

---

## CI/CD 完整验证流程

### 更新 `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  # Layer 1: Contract Verification (最快，最早失败)
  contract-verification:
    name: Contract Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: pnpm install

      - name: Type Check
        run: pnpm type-check

      - name: Schema Verification
        run: npx tsx scripts/verify-schema.ts

      - name: Lint
        run: pnpm lint

  # Layer 2: Unit Tests (快速，无外部依赖)
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: contract-verification
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: pnpm install

      - name: Run Unit Tests
        run: pnpm test -- --testPathPattern="unit"

  # Layer 3: Integration Tests (较慢，需要数据库)
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: pnpm install

      - name: Run Integration Tests
        run: pnpm test -- --testPathPattern="integration"

  # Layer 4: E2E Tests (最慢，需要完整环境)
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: pnpm install

      - name: Build
        run: pnpm build

      - name: Run E2E Tests
        run: pnpm test:e2e

  # Build Verification
  build:
    name: Build Verification
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: pnpm install
      - run: pnpm build
```

---

## 执行时间表

| Wave   | 内容              | 预计时间 | 负责人   |
| ------ | ----------------- | -------- | -------- |
| Wave 1 | Phase 1 测试创建  | 2-3 小时 | AI Agent |
| Wave 2 | Phase 2 测试审查  | 2-3 小时 | AI Agent |
| Wave 3 | Phase 3 测试增强  | 1-2 小时 | AI Agent |
| Wave 4 | Phase 4 测试规范  | 4-6 小时 | AI Agent |
| Wave 5 | CI/CD 流程更新    | 1-2 小时 | AI Agent |
| Wave 6 | Phase 5+ 模板准备 | 2-3 小时 | AI Agent |

**总计：** 12-19 小时

---

## 验收标准

### Wave 1 验收 (Phase 1)

- [ ] `tests/workspace-config.test.ts` 创建并执行
- [ ] `tests/tsconfig-heritage.test.ts` 创建并执行
- [ ] `tests/ci-config-verification.test.ts` 创建并执行
- [ ] 如果测试失败，修复的是配置文件，不是测试文件

### Wave 2 验收 (Phase 2)

- [ ] 插件系统测试审查完成
- [ ] 主题系统测试审查完成
- [ ] 集成测试创建 (如需要)
- [ ] 测试基于需求规范，而非实现细节

### Wave 3 验收 (Phase 3)

- [ ] 迁移验证测试创建
- [ ] Schema 向后兼容测试创建
- [ ] Schema 同步测试保持完整

### Wave 4 验收 (Phase 4)

- [ ] 已完成计划审查完成
- [ ] 未完成计划测试模板准备
- [ ] `updatePost` bug 修复
- [ ] API 契约测试框架创建

### Wave 5 验收 (CI/CD)

- [ ] CI/CD 流程包含四层验证
- [ ] Schema 验证集成到 CI
- [ ] 测试报告生成配置

### Wave 6 验收 (Phase 5+)

- [ ] Phase 5 测试模板准备
- [ ] E2E 测试框架配置 (Playwright)
- [ ] 测试覆盖率要求定义

---

**创建日期：** 2026-03-21
**最后更新：** 2026-03-21
**状态：** 待执行
