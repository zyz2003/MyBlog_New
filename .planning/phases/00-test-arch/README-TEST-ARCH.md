# 测试架构系统性整改 - README

## 📌 核心原则

> **测试是验证者，不是迁就者**
>
> 当测试失败时，修复的是正式文件的错误，而不是测试文件去迁就错误。

## 🚨 问题根源

在 Phase 1-4 的开发过程中，发现了一个**架构级的严重问题**：

```
❌ 之前的做法：
   正式 Schema 有 bug → 测试文件手动同步 bug → 测试"通过" → 生产环境爆雷

✅ 整改后的做法：
   正式 Schema 有 bug → 测试文件验证失败 → 修复正式 Schema → 测试通过 → 生产正常
```

## 📋 四层测试架构

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 契约验证层 (Contract Verification)                 │
│ 验证：Schema 完整性、API 响应格式、类型安全                    │
│ 依据：REQUIREMENTS.md、业务规范                              │
│ 文件：schema-sync.test.ts, verify-schema.ts                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 单元测试 (Unit Tests)                              │
│ 验证：单一函数/类的行为                                      │
│ 依据：函数预期行为、边界条件                                  │
│ 文件：*.test.ts (纯函数、无外部依赖)                         │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: 集成测试 (Integration Tests)                       │
│ 验证：模块间协作 (API + 服务 + 数据库)                        │
│ 依据：接口契约、Schema 定义                                   │
│ 文件：tests/integration/*.test.ts                           │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: E2E 测试 (End-to-End Tests)                        │
│ 验证：完整用户流程                                           │
│ 依据：用户故事、验收标准                                      │
│ 文件：tests/e2e/*.spec.ts (Playwright)                      │
└─────────────────────────────────────────────────────────────┘
```

## 📁 计划文件

| 文件                                                     | 内容         | 状态      |
| -------------------------------------------------------- | ------------ | --------- |
| `.planning/phases/00-test-arch/TEST-ARCHITECTURE-FIX.md` | 全局整改计划 | ✅ 已创建 |
| `.planning/phases/00-test-arch/TEST-ARCH-EXECUTION.md`   | 详细执行清单 | ✅ 已创建 |
| `.planning/phases/00-test-arch/README-TEST-ARCH.md`      | 本文件       | ✅ 已创建 |

## 🔧 各阶段整改内容

### Phase 1 (Monorepo 脚手架)

**整改内容：** 创建配置验证测试

- `tests/workspace-config.test.ts` - 验证 workspace 依赖链接
- `tests/tsconfig-heritage.test.ts` - 验证 TypeScript 配置继承
- `tests/ci-config-verification.test.ts` - 验证 CI/CD 配置

**核心原则：** 如果测试失败，修复 `pnpm-workspace.yaml` 或 `tsconfig.json`，不修改测试文件

### Phase 2 (核心框架)

**整改内容：** 审查单元测试基于规范

- 审查 `packages/plugin/src/__tests__/*.test.ts` - 基于插件需求
- 审查 `packages/core/theme/__tests__/theme-manager.test.ts` - 基于主题需求

**核心原则：** 如果测试失败，修复 `plugin-manager.ts` 或 `theme-manager.ts`，不修改测试文件

### Phase 3 (数据库层)

**整改内容：** 增强迁移和向后兼容测试

- `apps/site/tests/schema-sync.test.ts` - Schema 同步验证 (✅ 已创建)
- `scripts/verify-schema.ts` - Schema 验证脚本 (✅ 已创建)
- `tests/migration-validation.test.ts` - 迁移幂等性验证 (待创建)
- `tests/schema-backward-compat.test.ts` - 向后兼容验证 (待创建)

**核心原则：** 如果测试失败，修复正式 Schema 定义，不修改验证脚本

### Phase 4 (API 层)

**整改内容：** 创建 API 契约测试，审查服务层测试

- 审查已完成计划 (04-00 至 04-07) 的测试
- 为未完成计划 (04-08 至 04-16) 创建 API 契约测试模板
- 修复 `post.service.ts` 中的 `updatePost` bug

**核心原则：** 如果 API 测试失败，修复 API 路由或服务层，不修改测试文件

### Phase 5-11 (未来阶段)

**前置要求：**

1. 理解四层测试架构
2. 所有测试必须基于规范/契约
3. 测试失败时修复正式代码，不修改测试文件

## 🔄 CI/CD 验证流程

```
CI/CD Pipeline:
├─> Layer 1: Contract Verification (最快，最早失败)
│   ├─> pnpm type-check
│   ├─> npx tsx scripts/verify-schema.ts
│   └─> pnpm lint
│
├─> Layer 2: Unit Tests (快速，无外部依赖)
│   └─> pnpm test -- --testPathPattern="unit"
│
├─> Layer 3: Integration Tests (较慢，需要数据库)
│   └─> pnpm test -- --testPathPattern="integration"
│
└─> Layer 4: E2E Tests (最慢，需要完整环境)
    └─> pnpm test:e2e
```

## ✅ 已完成的工作

| 日期       | 工作                                                        | 状态                      |
| ---------- | ----------------------------------------------------------- | ------------------------- |
| 2026-03-21 | 创建 `scripts/verify-schema.ts`                             | ✅ 完成                   |
| 2026-03-21 | 创建 `apps/site/tests/schema-sync.test.ts`                  | ✅ 完成 (43/43 通过)      |
| 2026-03-21 | 修复 `apps/site/tests/db.ts`                                | ✅ 完成 (匹配正式 Schema) |
| 2026-03-21 | 修复 `apps/site/tests/server/services/post.service.test.ts` | ✅ 完成 (改用 db.ts 工具) |
| 2026-03-21 | 修复 `apps/site/server/services/post.service.ts`            | ✅ 完成 (添加 ID 生成)    |
| 2026-03-21 | 创建全局整改计划文件                                        | ✅ 完成                   |
| 2026-03-21 | 更新 STATE.md 和 ROADMAP.md                                 | ✅ 完成                   |

## 📊 测试结果

**整改前：**

- 测试通过率：120/120 (但缺少 post.service 测试)
- 问题：测试"通过"但功能有 bug

**整改后：**

- 测试通过率：227/228 (99.6%)
- Schema-sync 测试：43/43 通过
- 剩余问题：1 个 `updatePost` 测试失败 (原有代码 bug，待修复)

## 📋 待执行任务

| Wave   | 内容              | 预计时间 | 状态      |
| ------ | ----------------- | -------- | --------- |
| Wave 1 | Phase 1 测试创建  | 2-3 小时 | ⏳ 待执行 |
| Wave 2 | Phase 2 测试审查  | 2-3 小时 | ⏳ 待执行 |
| Wave 3 | Phase 3 测试增强  | 1-2 小时 | ⏳ 待执行 |
| Wave 4 | Phase 4 测试规范  | 4-6 小时 | ⏳ 待执行 |
| Wave 5 | CI/CD 流程更新    | 1-2 小时 | ⏳ 待执行 |
| Wave 6 | Phase 5+ 模板准备 | 2-3 小时 | ⏳ 待执行 |

## 🎯 验收标准

- [ ] 所有测试文件基于规范/契约，而非实现细节
- [ ] 测试失败时，修复的是正式代码，不是测试文件
- [ ] 四层测试架构清晰，职责明确
- [ ] CI/CD 包含完整验证流程
- [ ] 无"测试通过但功能有 bug"的情况

## 📞 联系方式

如有疑问，请参考：

- `.planning/phases/00-global/TEST-ARCHITECTURE-FIX.md` - 全局计划
- `.planning/phases/00-global/TEST-ARCH-EXECUTION.md` - 执行清单

---

**创建日期：** 2026-03-21
**最后更新：** 2026-03-21
**状态：** 计划已批准，待执行
