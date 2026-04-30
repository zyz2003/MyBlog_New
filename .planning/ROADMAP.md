# Roadmap: 个人博客系统

**Created:** 2026-04-30
**Granularity:** Fine (8-12 phases)
**Mode:** YOLO

## Milestone 1: 基础框架

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Monorepo 脚手架 | 可运行的 Nuxt 3 项目 | FOUND-01~05 | pnpm dev 可启动，UnoCSS 可用 |
| 2 | 数据库层 | SQLite + Drizzle ORM 可用 | DB-01~05 | Schema 定义完成，迁移可执行 |
| 3 | 认证系统 | JWT 登录/登出 | AUTH-01~05 | 管理员可登录，API 受保护 |
| 4 | 插件系统 | 插件适配器 + 挂载点 | CORE-01~04 | 插件可注册/启用/渲染 |
| 5 | 主题系统 | 主题热切换 + CSS Variables | CORE-05~08 | 主题可切换，样式实时生效 |
| 6 | API 层 | RESTful 路由 + 中间件 | API-01~12, CACHE-01 | 所有 CRUD API 可用 |

## Milestone 2: 核心功能

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 7 | 后台布局 + 文章管理 | 后台可写文章 | ADMIN-01~05, STOR-01~03 | 后台可创建/编辑/发布文章 |
| 8 | 后台完整管理 | 所有管理功能 | ADMIN-06~12 | 分类/标签/媒体/主题/插件/设置可用 |
| 9 | 前台博客 | 博客前台可访问 | FE-01~05, FE-10 | 首页/列表/详情/分类/标签可用 |
| 10 | 前台扩展 | 搜索/RSS/SEO | FE-06~09 | 搜索/RSS/SEO 全部可用 |

## Milestone 3: 扩展功能

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 11 | 集成测试 + 优化 | 稳定可用版本 | (全部 v1) | 端到端流程畅通，无阻断 bug |

---

## Phase Details

### Phase 1: Monorepo 脚手架

**Goal:** 可运行的 Nuxt 3 项目，`pnpm dev` 一键启动

**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Monorepo root configuration (pnpm-workspace, root package.json, root tsconfig.json)
- [x] 01-02-PLAN.md — Nuxt 3 app core (dependencies, nuxt.config.ts, UnoCSS, app.vue, test page)
- [x] 01-03-PLAN.md — Environment variables + verification checkpoint

**Requirements:**
- FOUND-01: 项目可通过 pnpm dev 一键启动
- FOUND-02: pnpm workspace Monorepo 结构可用
- FOUND-03: TypeScript 严格模式
- FOUND-04: UnoCSS 原子化 CSS 可用
- FOUND-05: 环境变量管理

**Success Criteria:**
1. `pnpm dev` 启动成功，浏览器可访问
2. UnoCSS 原子化样式生效
3. TypeScript 类型检查通过
4. .env 文件加载正常
5. Monorepo 结构符合架构文档

**Deliverables:**
- `apps/site/nuxt.config.ts` — Nuxt 3 配置 (SSR+SPA 混合)
- `apps/site/package.json` — 应用依赖
- `pnpm-workspace.yaml` — workspace 配置
- `tsconfig.json` — TypeScript 配置
- `.env.example` — 环境变量模板

---

### Phase 2: 数据库层

**Goal:** SQLite + Drizzle ORM 可用，Schema 定义完成

**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Dependencies + schema definitions (drizzle-orm, 11 tables, relations)
- [x] 02-02-PLAN.md — Database connection (WAL mode) + migration scripts
- [x] 02-03-PLAN.md — End-to-end verification checkpoint

**Requirements:**
- DB-01: Drizzle ORM + SQLite 连接可用
- DB-02: 11 张核心表 Schema
- DB-03: 迁移脚本自动生成
- DB-04: 软删除模式
- DB-05: 统一主键和时间戳

**Success Criteria:**
1. 数据库连接成功
2. 11 张表创建成功
3. `pnpm db:generate` 和 `pnpm db:push` 可用
4. 软删除字段存在

**Deliverables:**
- `apps/site/server/db/schema/` — Schema 文件
- `apps/site/server/db/connection.ts` — 数据库连接
- `apps/site/server/db/migrate.ts` — 迁移脚本

---

### Phase 3: 认证系统

**Goal:** JWT 登录/登出，API 路由受保护

**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Dependencies + auth service + seed script (jose, bcryptjs, JWT/password functions, admin user)
- [x] 03-02-PLAN.md — Auth API routes + middleware (login, logout, refresh, /api/admin/** protection)
- [x] 03-03-PLAN.md — End-to-end auth flow verification checkpoint

**Requirements:**
- AUTH-01: 管理员可通过用户名/密码登录
- AUTH-02: JWT token 生成和验证 (7 天有效期)
- AUTH-03: Token 自动续期 (剩余 < 1 天时刷新)
- AUTH-04: 登出功能 (清除客户端 token)
- AUTH-05: Auth 中间件保护后台 API 路由

**Success Criteria:**
1. POST /api/auth/login 返回 token
2. 带 token 访问受保护 API 成功
3. 无 token 访问返回 401
4. Token 自动续期

**Deliverables:**
- `apps/site/server/services/auth.ts` — Auth 服务 (JWT + 密码)
- `apps/site/server/utils/response.ts` — 统一 API 响应格式
- `apps/site/server/api/auth/login.post.ts` — 登录接口
- `apps/site/server/api/auth/logout.post.ts` — 登出接口
- `apps/site/server/api/auth/refresh.post.ts` — Token 刷新接口
- `apps/site/server/middleware/auth.ts` — Auth 中间件
- `scripts/seed.ts` — 管理员种子脚本

---

### Phase 4: 插件系统

**Goal:** 插件适配器模式可用，6 个挂载点实现

**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md — Plugin types + PluginManager (server-side core: PluginAdapter interface, manager with register/enable/disable)
- [ ] 04-02-PLAN.md — Mount point components + PluginRenderer (8 Vue components for plugin rendering at 6 mount points)
- [ ] 04-03-PLAN.md — Plugin API routes + store + composable + verification checkpoint

**Requirements:**
- CORE-01: 插件适配器接口 (PluginAdapter: meta, configSchema, mountPoints, component, onMount)
- CORE-02: 插件管理器 (注册、启用、禁用、配置)
- CORE-03: 6 个挂载点实现 (head-end, header-end, sidebar, post-end, footer-start, body-end)
- CORE-04: 插件 SSR 兼容 (Vue 组件方式 + 脚本注入方式)

**Success Criteria:**
1. PluginAdapter 接口定义完成
2. 插件可注册/启用/禁用
3. 6 个挂载点可渲染插件组件
4. Vue 组件方式 SSR 兼容

**Deliverables:**
- `apps/site/server/core/plugin/types.ts` — PluginAdapter TypeScript 接口
- `apps/site/server/core/plugin/manager.ts` — PluginManager 类
- `apps/site/server/core/plugin/index.ts` — Barrel export
- `apps/site/components/plugins/PluginMount.vue` — 单插件渲染组件
- `apps/site/components/plugins/PluginRenderer.vue` — 挂载点渲染器
- `apps/site/components/plugins/MountPoint*.vue` — 6 个挂载点组件
- `apps/site/server/api/plugins/` — 插件 API 路由
- `apps/site/stores/plugin.ts` — Pinia 插件状态
- `apps/site/composables/usePlugin.ts` — usePlugin composable

---

### Phase 5: 主题系统

**Goal:** 主题热切换，CSS Variables 动态主题

**Requirements:**
- CORE-05~08

**Success Criteria:**
1. 主题可加载/切换
2. CSS Variables 实时生效
3. Layout 动态切换
4. 钩子系统可用

**Deliverables:**
- `apps/site/server/core/theme/` — 主题系统
- `apps/site/server/core/hooks/` — 钩子系统
- `themes/` — 默认主题

---

### Phase 6: API 层

**Goal:** 所有 CRUD API 可用

**Requirements:**
- API-01~12, STOR-01~03, CACHE-01

**Success Criteria:**
1. 统一响应格式
2. 所有 CRUD 路由可用
3. 中间件链正常
4. 文件上传可用
5. 缓存服务可用

**Deliverables:**
- `apps/site/server/api/` — 所有 API 路由
- `apps/site/server/services/` — 业务服务层
- `apps/site/server/storage/` — 存储适配层

---

### Phase 7: 后台布局 + 文章管理

**Goal:** 后台可写文章

**Requirements:**
- ADMIN-01~05, STOR-01~03

**Success Criteria:**
1. 后台布局可用 (侧边栏+导航)
2. 文章列表页可用
3. Vditor 编辑器集成
4. 文章可创建/编辑/删除/发布

**Deliverables:**
- `apps/site/pages/admin/` — 后台页面
- `apps/site/components/admin/` — 后台组件

---

### Phase 8: 后台完整管理

**Goal:** 所有管理功能可用

**Requirements:**
- ADMIN-06~12

**Success Criteria:**
1. 分类管理 (树形 CRUD)
2. 标签管理 (CRUD)
3. 媒体库 (上传/浏览/删除)
4. 主题管理 (列表/启用/配置)
5. 插件管理 (列表/启用/配置)
6. 系统设置

---

### Phase 9: 前台博客

**Goal:** 博客前台可访问

**Requirements:**
- FE-01~05, FE-10

**Success Criteria:**
1. 首页展示最新文章
2. 文章列表分页
3. 文章详情 Markdown 渲染
4. 分类/标签筛选
5. 移动端响应式

---

### Phase 10: 前台扩展

**Goal:** 搜索/RSS/SEO 全部可用

**Requirements:**
- FE-06~09

**Success Criteria:**
1. 搜索功能可用
2. RSS Feed 生成
3. SEO meta tags
4. Sitemap 生成

---

### Phase 11: 集成测试 + 优化

**Goal:** 稳定可用版本

**Requirements:** 全部 v1

**Success Criteria:**
1. 端到端流程畅通
2. 无阻断 bug
3. 性能可接受
4. Docker 部署配置

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | 1 | Verified |
| FOUND-02 | 1 | Verified |
| FOUND-03 | 1 | Verified |
| FOUND-04 | 1 | Verified |
| FOUND-05 | 1 | Verified |
| DB-01 | 2 | Verified |
| DB-02 | 2 | Verified |
| DB-03 | 2 | Verified |
| DB-04 | 2 | Verified |
| DB-05 | 2 | Verified |
| AUTH-01 | 3 | Verified |
| AUTH-02 | 3 | Verified |
| AUTH-03 | 3 | Verified |
| AUTH-04 | 3 | Verified |
| AUTH-05 | 3 | Verified |
| CORE-01 | 4 | Pending |
| CORE-02 | 4 | Pending |
| CORE-03 | 4 | Pending |
| CORE-04 | 4 | Pending |
| CORE-05 | 5 | Pending |
| CORE-06 | 5 | Pending |
| CORE-07 | 5 | Pending |
| CORE-08 | 5 | Pending |
| API-01 | 6 | Pending |
| API-02 | 6 | Pending |
| API-03 | 6 | Pending |
| API-04 | 6 | Pending |
| API-05 | 6 | Pending |
| API-06 | 6 | Pending |
| API-07 | 6 | Pending |
| API-08 | 6 | Pending |
| API-09 | 6 | Pending |
| API-10 | 6 | Pending |
| API-11 | 6 | Pending |
| API-12 | 6 | Pending |
| CACHE-01 | 6 | Pending |
| STOR-01 | 6 | Pending |
| STOR-02 | 6 | Pending |
| STOR-03 | 6 | Pending |
| ADMIN-01 | 7 | Pending |
| ADMIN-02 | 7 | Pending |
| ADMIN-03 | 7 | Pending |
| ADMIN-04 | 7 | Pending |
| ADMIN-05 | 7 | Pending |
| ADMIN-06 | 8 | Pending |
| ADMIN-07 | 8 | Pending |
| ADMIN-08 | 8 | Pending |
| ADMIN-09 | 8 | Pending |
| ADMIN-10 | 8 | Pending |
| ADMIN-11 | 8 | Pending |
| ADMIN-12 | 8 | Pending |
| FE-01 | 9 | Pending |
| FE-02 | 9 | Pending |
| FE-03 | 9 | Pending |
| FE-04 | 9 | Pending |
| FE-05 | 9 | Pending |
| FE-10 | 9 | Pending |
| FE-06 | 10 | Pending |
| FE-07 | 10 | Pending |
| FE-08 | 10 | Pending |
| FE-09 | 10 | Pending |

**Coverage:**
- v1 requirements: 52 total
- Mapped to phases: 52
- Unmapped: 0

---
*Roadmap created: 2026-04-30*
*Phase 1 plan created: 2026-04-30*
*Phase 2 plan created: 2026-04-30*
*Phase 3 plan created: 2026-04-30*
*Phase 4 plan created: 2026-04-30*
