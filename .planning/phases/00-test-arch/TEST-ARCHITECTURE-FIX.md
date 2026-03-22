---
phase: 00-test-arch
plan: TEST-ARCH
type: fix
priority: critical
wave: all
depends_on: []
---

# 测试架构系统性整改计划

**创建日期：** 2026-03-21
**优先级：** Critical
**范围：** Phase 1-4 (已完成 + 进行中 + 未开始)

---

## 一、核心原则

> **测试是验证者，不是迁就者**
>
> 当测试失败时，修复的是正式文件的错误，而不是测试文件去迁就错误。

### 1.1 测试与正式文件关系

```
❌ 错误做法 (之前的问题)：
  正式 Schema 有 bug → 测试文件手动同步 bug → 测试"通过" → 生产环境爆雷

✅ 正确做法 (整改后)：
  正式 Schema 有 bug → 测试文件验证失败 → 修复正式 Schema → 测试通过 → 生产正常
```

### 1.2 测试依据

| 测试类型     | 验证依据                      | 不能迁就         |
| ------------ | ----------------------------- | ---------------- |
| Schema 验证  | 业务需求、数据完整性规则      | Schema 定义错误  |
| API 契约测试 | REQUIREMENTS.md 中的 API 规范 | API 响应格式错误 |
| 单元测试     | 函数/类的预期行为             | 实现逻辑错误     |
| 集成测试     | 模块间接口契约                | 接口不匹配错误   |
| E2E 测试     | 用户故事/验收标准             | 流程错误         |

---

## 二、测试分层架构

采用**四层测试架构**，每层职责清晰：

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: E2E 测试 (Playwright)                               │
│ 验证：完整用户流程                                            │
│ 依据：用户故事、验收标准                                      │
│ 行动：流程失败 → 修复功能代码                                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: 集成测试                                            │
│ 验证：模块间协作 (API + 服务 + 数据库)                         │
│ 依据：接口契约、Schema 定义                                   │
│ 行动：失败 → 修复接口/Schema，不修改测试                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 单元测试                                            │
│ 验证：单一函数/类的行为                                       │
│ 依据：函数预期行为、边界条件                                  │
│ 行动：失败 → 修复实现逻辑                                    │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: 契约验证层 (独立验证)                                │
│ 验证：Schema 完整性、API 响应格式、类型安全                     │
│ 依据：REQUIREMENTS.md、业务规范                               │
│ 行动：失败 → 修复正式定义，绝不修改验证脚本                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、各阶段整改计划

### Phase 1 (Monorepo 脚手架) - 已完成

**当前状态：** 无独立测试，依赖 CI/CD 验证

**整改行动：**

1. 创建 `packages/tsconfig-validator.ts` - 验证 TypeScript 配置继承关系
2. 创建 `tests/workspace-link.test.ts` - 验证 workspace 依赖正确链接
3. 创建 `tests/ci-verification.test.ts` - 验证 CI/CD 配置完整性

**核心原则应用：**

- 如果 workspace 依赖链接失败 → 修复 pnpm-workspace.yaml，不修改测试
- 如果 TypeScript 路径解析失败 → 修复 tsconfig.json，不修改测试

---

### Phase 2 (核心框架) - 已完成

**当前状态：** 单元测试存在，需验证基于规范而非实现

**整改行动：**

1. 审查 `packages/plugin/src/__tests__/*.test.ts`
   - 验证测试依据是插件系统需求，而非当前实现
   - 如果测试失败 → 修复 plugin-manager.ts，不修改测试

2. 审查 `packages/core/theme/__tests__/theme-manager.test.ts`
   - 验证测试依据是主题系统需求
   - 如果测试失败 → 修复 theme-manager.ts，不修改测试

3. 创建集成测试
   - `tests/integration/plugin-hook.test.ts` - 验证插件挂载点协同工作
   - `tests/integration/theme-switch.test.ts` - 验证主题切换流程

---

### Phase 3 (数据库层) - 已完成

**当前状态：** 已有 schema-sync.test.ts 和 verify-schema.ts

**整改行动：**

1. 保持 `schema-sync.test.ts` 不变 (已正确基于正式 Schema 验证)
2. 保持 `verify-schema.ts` 不变 (已正确作为独立验证脚本)
3. 创建 `tests/migration-idempotency.test.ts` - 验证迁移文件幂等性
4. 创建 `tests/schema-backward-compat.test.ts` - 验证 Schema 变更向后兼容

**核心原则应用：**

- Schema 验证失败 → 修复正式 Schema 定义，不修改验证脚本
- 迁移失败 → 修复迁移文件，不修改测试

---

### Phase 4 (API 层) - 进行中

**当前状态：** 7/17 计划完成，部分测试需整改

**已完成计划 (04-00 至 04-07) 整改：**

1. 审查 `tests/server/api/auth.test.ts`
   - 验证测试依据是 API 契约 (REQUIREMENTS.md)
   - 如果测试失败 → 修复 API 路由，不修改测试

2. 审查 `tests/server/services/post.service.test.ts`
   - 已修复使用共享 db.ts 工具
   - 剩余 updatePost bug → 修复 post.service.ts，不修改测试

3. 审查中间件测试
   - 验证测试依据是中间件预期行为
   - 如果测试失败 → 修复中间件实现

**未完成计划 (04-08 至 04-16) 要求：**

1. 每个 API 计划必须包含 API 契约测试
2. 每个服务计划必须包含单元测试 (Mock 数据库)
3. 集成测试必须基于正式 Schema 自动生成数据库

---

### Phase 5-11 (未来阶段) - 未开始

**前置要求：**

1. 所有新测试必须遵循四层架构
2. 所有测试必须基于规范/契约，而非实现细节
3. 测试失败时，修复的是正式代码，不是测试文件

---

## 四、执行策略

### Wave 1: 建立独立验证层 (立即执行)

1. 保持并增强 `schema-sync.test.ts`
2. 保持并增强 `verify-schema.ts`
3. 创建 API 契约验证脚本

### Wave 2: Phase 1-3 测试审查 (短期)

1. 审查 Phase 1 配置，创建验证测试
2. 审查 Phase 2 单元测试，确保基于规范
3. 审查 Phase 3 数据库测试，确保完整性

### Wave 3: Phase 4 剩余计划验证 (中期)

1. 每个 API 计划必须通过 API 契约测试
2. 每个服务计划必须有独立单元测试
3. 集成测试使用正式 Schema 自动生成数据库

### Wave 4: Phase 5+ 前置要求 (长期)

1. 建立 E2E 测试框架 (Playwright)
2. 建立 CI/CD 完整验证流程
3. 建立测试覆盖率要求

---

## 五、违反处理流程

```
当发现"测试通过但功能有 bug"时：

1. 定位问题根源
   - 是测试依据错误？→ 修复测试依据 (基于规范)
   - 是正式代码错误？→ 修复正式代码

2. 记录问题
   - 记录到 .planning/phases/XXX/ISSUES.md
   - 标记为"测试架构违规"

3. 修复验证
   - 确保修复后测试真正验证功能，而非"凑合通过"
```

---

## 六、验收标准

### 阶段验收

| 阶段    | 验收标准                 | 验证方式               |
| ------- | ------------------------ | ---------------------- |
| Phase 1 | 配置验证测试通过         | workspace-link.test.ts |
| Phase 2 | 核心框架测试基于规范     | 审查测试依据           |
| Phase 3 | Schema 验证 100% 通过    | schema-sync.test.ts    |
| Phase 4 | API 契约测试覆盖所有端点 | API 契约验证脚本       |

### 整体验收

- [ ] 所有测试文件基于规范/契约，而非实现细节
- [ ] 测试失败时，修复的是正式代码，不是测试文件
- [ ] 四层测试架构清晰，职责明确
- [ ] CI/CD 包含完整验证流程
- [ ] 无"测试通过但功能有 bug"的情况

---

## 七、文件清单

### 新增文件

| 文件                                                  | 用途               | 优先级    |
| ----------------------------------------------------- | ------------------ | --------- |
| `.planning/phases/00-global/TEST-ARCHITECTURE-FIX.md` | 整改计划 (本文件)  | 高        |
| `scripts/verify-schema.ts`                            | Schema 验证脚本    | ✅ 已创建 |
| `apps/site/tests/schema-sync.test.ts`                 | Schema 同步测试    | ✅ 已创建 |
| `tests/workspace-link.test.ts`                        | Workspace 依赖验证 | 中        |
| `tests/integration/plugin-hook.test.ts`               | 插件集成测试       | 中        |
| `tests/integration/theme-switch.test.ts`              | 主题集成测试       | 中        |
| `tests/api-contract.test.ts`                          | API 契约测试       | 高        |

### 修改文件

| 文件                                                   | 修改内容                 | 优先级 |
| ------------------------------------------------------ | ------------------------ | ------ |
| `apps/site/tests/db.ts`                                | ✅ 已修复匹配正式 Schema | 高     |
| `apps/site/tests/server/services/post.service.test.ts` | ✅ 已改用 db.ts 工具     | 高     |
| `apps/site/server/services/post.service.ts`            | ✅ 已修复 ID 生成        | 高     |
| `packages/database/src/schema/*.ts`                    | 如有错误需修复           | 高     |

---

## 八、执行时间估算

| Wave   | 内容                 | 预计时间   |
| ------ | -------------------- | ---------- |
| Wave 1 | 建立独立验证层       | 2-3 小时   |
| Wave 2 | Phase 1-3 测试审查   | 4-6 小时   |
| Wave 3 | Phase 4 剩余计划验证 | 8-12 小时  |
| Wave 4 | Phase 5+ 前置要求    | 16-24 小时 |

**总计：** 30-45 小时

---

**创建者：** Claude Code (测试架构整改)
**审核状态：** 待用户批准
**执行状态：** 待执行
