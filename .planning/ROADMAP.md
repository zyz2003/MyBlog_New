# Roadmap: My Blog System

**Created:** 2026-03-16
**Total Phases:** 12 (including Phase 00-TEST-ARCH)
**Requirements Mapped:** 58

## Milestones

### Milestone 0: 测试架构整改 (Phase 00)

**Goal:** 建立可靠的测试架构，确保测试验证的是正式代码而非迁就错误

### Milestone 1: 基础框架 (Phase 1-4)

**Goal:** 搭建可运行的基础架构

### Milestone 2: 核心功能 (Phase 5-7)

**Goal:** 实现博客核心功能（后台管理 + 前台展示 + 主题）

### Milestone 3: 扩展功能 (Phase 8-11)

**Goal:** 插件系统、编辑器、测试优化和部署

---

## Phases

### Phase 00: 测试架构系统性整改

**Goal:** 建立四层测试架构，确保测试是验证者而非迁就者

**核心原则:**

> 当测试失败时，修复的是正式文件的错误，而不是测试文件去迁就错误。

**整改范围:**

- Phase 1 (Monorepo): 创建配置验证测试
- Phase 2 (核心框架): 审查单元测试基于规范
- Phase 3 (数据库层): 增强迁移和向后兼容测试
- Phase 4 (API 层): 创建 API 契约测试，审查服务层测试
- Phase 5-11: 建立前置测试要求

**Success Criteria:**

1. 四层测试架构建立 (契约验证→单元测试→集成测试→E2E)
2. 所有测试基于规范/契约，而非实现细节
3. CI/CD 包含完整验证流程
4. 无"测试通过但功能有 bug"的情况

**Wave:** 0 (优先于所有阶段)

**Plans:** 6/6 plans complete

- [x] 00-test-arch/TEST-ARCHITECTURE-FIX.md — 全局测试架构整改计划
- [x] 00-test-arch/TEST-ARCH-EXECUTION.md — 详细执行清单
- [x] 00-01-PLAN.md — Wave 1: Phase 1 配置验证测试创建
- [x] 00-02-PLAN.md — Wave 2: Phase 2 核心框架测试审查
- [x] 00-03-PLAN.md — Wave 3: Phase 3 数据库层测试增强
- [x] 00-04-PLAN.md — Wave 4: Phase 4 API 层已完成计划审查
- [x] 00-05-PLAN.md — Wave 5: API 契约测试框架创建
- [x] 00-06-PLAN.md — Wave 6: 测试架构约束与后续阶段规范

---

### Phase 1: Monorepo 脚手架

**Goal:** 创建可运行的空项目和 CI/CD 配置

**Requirements:**

- CORE-01: Monorepo 脚手架搭建（pnpm workspace）
- CORE-02: TypeScript 配置和类型定义
- CORE-03: ESLint + Prettier 代码规范
- CORE-04: Git Hooks 配置（Husky）
- CORE-05: CI/CD 基础配置

**Success Criteria:**

1. pnpm workspace 正常运行
2. TypeScript 类型检查通过
3. 代码规范检查通过
4. Git Hooks 正常拦截提交
5. CI/CD 流水线执行成功

**Wave:** 1

**Plans:** 2/2 plans executed

Plans:

- [x] 01-monorepo-01-PLAN.md — pnpm workspace + TypeScript 配置 + 5 个初始包骨架
- [x] 01-monorepo-02-PLAN.md — ESLint + Prettier + Husky + GitHub Actions CI

---

### Phase 2: 核心框架

**Goal:** 实现插件系统、主题系统、钩子系统核心架构

**Requirements:**

- PLUGIN-01: 插件系统核心架构
- PLUGIN-02: 16 个插件挂载点实现
- PLUGIN-03: 插件生命周期管理
- THEME-01: 主题系统核心架构
- THEME-02: CSS Variables 主题变量
- THEME-03: JSON 主题配置文件

**Success Criteria:**

1. 插件可以被加载和卸载
2. 16 个挂载点可以正常 hook
3. 主题配置可以动态切换
4. CSS Variables 主题生效

**Wave:** 1

**Plans:** 2/2 plans complete

Plans:

- [x] 02-01-PLAN.md — 插件系统核心架构（PluginManager, HookRegistry, LifecycleEmitter）
- [x] 02-02-PLAN.md — 主题系统核心架构（ThemeManager, CSS Variables, 示例主题）

---

### Phase 3: 数据库层

**Goal:** 完成数据库 Schema 设计和迁移脚本

**Requirements:**

- DB-01 ~ DB-10: 完整数据库层实现

**Success Criteria:**

1. SQLite 数据库正常连接（WAL 模式）
2. Drizzle ORM 正常运作
3. 所有 Schema 定义完成
4. 迁移脚本可以执行
5. 种子数据可以插入

**Wave:** 1

**Plans:** 5/5 plans executed ✅

Plans:

- [x] 03-01-PLAN.md — Database Package Setup and Connection
- [x] 03-02-PLAN.md — User and Category Schema
- [x] 03-03-PLAN.md — Posts and Tags Schema
- [x] 03-04-PLAN.md — Media Schema and Seed Data
- [x] 03-05-PLAN.md — Database Migration and Testing (including plugins/themes)

**CI/CD Verified:** GitHub Actions passed 2026-03-19 ✅

---

### Phase 4: API 层

**Goal:** 实现 Nitro API 路由、中间件、服务层

**Requirements:**

- API-01 ~ API-09: 完整 API 层实现

**Success Criteria:**

1. Nitro Server 正常启动
2. 文章 CRUD API 可用
3. 认证 API 可用（JWT）
4. 中间件正常运作
5. API 验证通过
6. Swagger 文档可用

**Wave:** 1

**Plans:** 18 plans (Wave 1: 00-07, Wave 2: 08-16)

Plans: 13/18 complete

- [x] 04-00-PLAN.md — Test infrastructure (Vitest, helpers, test DB) ✅
- [x] 04-01-PLAN.md — Unified response format + error utilities ✅
- [x] 04-02-PLAN.md — Zod validation utilities + schemas ✅
- [x] 04-03-PLAN.md — JWT authentication middleware ✅
- [x] 04-04-PLAN.md — Error handler + logger + rate-limit middleware ✅
- [x] 04-05-PLAN.md — Swagger/OpenAPI documentation ✅
- [x] 04-06-PLAN.md — Auth API: login, logout ✅
- [x] 04-07-PLAN.md — Auth API: me, register ✅
- [x] 04-08-PLAN.md — Post service + slug/markdown utilities ✅
- [x] 04-09-PLAN.md — Posts API: list, get ✅
- [x] 04-10-PLAN.md — Posts API: create, update, delete, bulk delete ✅
- [x] 04-11-PLAN.md — Categories API: service + list, create ✅
- [x] 04-12-PLAN.md — Categories API: get, update, delete ✅
- [x] 04-13-PLAN.md — Tags API: full CRUD ✅
- [ ] 04-14-PLAN.md — Storage + Media services
- [ ] 04-15-PLAN.md — Media API: upload, list, get, delete
- [ ] 04-16-PLAN.md — Plugin and Theme management API

---

### Phase 5: 后台管理

**Goal:** 实现后台管理 UI 和核心功能

**Requirements:**

- ADMIN-01 ~ ADMIN-08: 后台管理页面

**Success Criteria:**

1. 后台布局正常渲染
2. 文章列表可以展示和分页
3. 文章编辑页面可用
4. 媒体库可以上传和管理
5. 设置页面可用

**Wave:** 1

---

### Phase 6: 前台博客

**Goal:** 实现前台博客页面

**Requirements:**

- BLOG-01 ~ BLOG-08: 前台博客页面

**Success Criteria:**

1. 首页正常渲染
2. 文章列表分页正常
3. 文章详情页 SSR 正常
4. 分类/标签筛选可用
5. SEO 元词正常生成
6. RSS Feed 可用

**Wave:** 1

---

### Phase 7: 主题系统

**Goal:** 完整主题功能和默认主题

**Requirements:**

- THEME-04 ~ THEME-07: 主题预览、切换、默认主题

**Success Criteria:**

1. 主题预览功能可用
2. 主题切换 API 正常
3. Minimal 默认主题可用
4. Classic 示例主题可用

**Wave:** 1

---

### Phase 8: 插件系统

**Goal:** 完整插件功能和官方插件

**Requirements:**

- PLUGIN-04: 插件配置 UI
- PLUGIN-05: 官方插件：SEO 优化

**Success Criteria:**

1. 插件配置 UI 可用
2. SEO 插件正常运作

**Wave:** 1

---

### Phase 9: 双编辑器

**Goal:** TipTap + Vditor 编辑器集成

**Requirements:**

- EDITOR-01 ~ EDITOR-06: 完整编辑器功能

**Success Criteria:**

1. TipTap 可视化编辑器可用
2. Vditor Markdown 编辑器可用
3. 编辑器切换正常
4. 图片上传可用
5. 代码高亮可用
6. 自动保存可用

**Wave:** 1

---

### Phase 10: 测试优化

**Goal:** 单元测试、性能优化、Bug 修复

**Requirements:**

- 单元测试覆盖核心功能
- 性能优化达到目标
- 已知 Bug 修复

**Success Criteria:**

1. 单元测试覆盖率 > 80%
2. 首屏加载 < 2s
3. 无严重 Bug

**Wave:** 1

---

### Phase 11: 部署文档

**Goal:** Docker 配置、部署文档、用户文档

**Requirements:**

- Docker Compose 配置
- 部署文档完成
- 用户文档完成

**Success Criteria:**

1. Docker 一键部署可用
2. 部署文档清晰完整
3. 用户文档清晰完整

**Wave:** 1

---

## Requirement Coverage

| Category  | Total  | Mapped |
| --------- | ------ | ------ |
| CORE      | 5      | 5      |
| DB        | 10     | 10     |
| API       | 9      | 9      |
| ADMIN     | 8      | 8      |
| BLOG      | 8      | 8      |
| PLUGIN    | 5      | 5      |
| THEME     | 7      | 7      |
| EDITOR    | 6      | 6      |
| **Total** | **58** | **58** |

**Coverage:** 100% ✓

---

_Roadmap created: 2026-03-16_
_Last updated: 2026-03-19 - Phase 3 complete (CI/CD verified)_
