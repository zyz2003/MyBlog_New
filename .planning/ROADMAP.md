# Roadmap: 个人博客系统

**Created:** 2026-04-30
**Granularity:** Fine (8-12 phases)
**Mode:** YOLO

## Milestone 1: 基础框架

| # | Phase | Goal | Requirements | Success Criteria | Status |
|---|-------|------|--------------|------------------|--------|
| 1 | Monorepo 脚手架 | 可运行的 Nuxt 3 项目 | FOUND-01~05 | pnpm dev 可启动，UnoCSS 可用 | Complete |
| 2 | 数据库层 | SQLite + Drizzle ORM 可用 | DB-01~05 | Schema 定义完成，迁移可执行 | Complete |
| 3 | 认证系统 | JWT 登录/登出 | AUTH-01~05 | 管理员可登录，API 受保护 | Complete |
| 4 | 插件系统 | 插件适配器 + 挂载点 | CORE-01~04 | 插件可注册/启用/渲染 | Complete |
| 5 | 主题系统 | 主题热切换 + CSS Variables | CORE-05~08 | 主题可切换，样式实时生效 | Complete |
| 6 | API 层 | RESTful 路由 + 中间件 | API-01~12, CACHE-01 | 所有 CRUD API 可用 | Complete |

## Milestone 2: 核心功能

| # | Phase | Goal | Requirements | Success Criteria | Status |
|---|-------|------|--------------|------------------|--------|
| 7 | 后台布局 + 文章管理 | 后台可写文章 | ADMIN-01~05, STOR-01~03 | 后台可创建/编辑/发布文章 | Complete |
| 8 | 后台完整管理 | 所有管理功能 | ADMIN-06~12 | 分类/标签/媒体/主题/插件/设置可用 | Complete |
| 9 | 前台博客 | 博客前台可访问 | FE-01~05, FE-10 | 首页/列表/详情/分类/标签可用 | Pending |
| 10 | 前台扩展 | 搜索/RSS/SEO | FE-06~09 | 搜索/RSS/SEO 全部可用 | Pending |

## Milestone 3: 扩展功能

| # | Phase | Goal | Requirements | Success Criteria | Status |
|---|-------|------|--------------|------------------|--------|
| 11 | 集成测试 + 优化 | 稳定可用版本 | (全部 v1) | 端到端流程畅通，无阻断 bug | Pending |

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
- [x] 04-01-PLAN.md — Plugin types + PluginManager (server-side core: PluginAdapter interface, manager with register/enable/disable)
- [x] 04-02-PLAN.md — Mount point components + PluginRenderer (8 Vue components for plugin rendering at 6 mount points)
- [x] 04-03-PLAN.md — Plugin API routes + store + composable + verification checkpoint

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

**Plans:** 3 plans

Plans:
- [x] 05-01-PLAN.md — Theme types + hook system EventEmitter (type definitions, event emitter for lifecycle hooks)
- [x] 05-02-PLAN.md — ThemeManager + default theme (server-side manager, CSS Variables generation, default theme assets, Nitro plugin)
- [x] 05-03-PLAN.md — Theme API routes + store + composable (REST API, Pinia store, useTheme with CSS injection)

**Requirements:**
- CORE-05: 主题系统 (layout.vue + config.json + styles.css per theme)
- CORE-06: 主题热切换 (动态组件加载，defineAsyncComponent)
- CORE-07: CSS Variables 主题变量系统
- CORE-08: 钩子系统 (生命周期管理)

**Success Criteria:**
1. 主题可加载/切换
2. CSS Variables 实时生效
3. Layout 动态切换
4. 钩子系统可用

**Deliverables:**
- `apps/site/server/core/theme/types.ts` — Theme TypeScript interfaces
- `apps/site/server/core/theme/manager.ts` — ThemeManager class
- `apps/site/server/core/theme/index.ts` — Barrel export
- `apps/site/server/core/hooks/event-emitter.ts` — EventEmitter class
- `apps/site/server/core/hooks/index.ts` — Barrel export
- `themes/default/layout.vue` — Default theme layout
- `apps/site/server/api/themes/` — Theme API routes
- `apps/site/stores/theme.ts` — Pinia theme store
- `apps/site/composables/useTheme.ts` — useTheme composable

---

### Phase 6: API 层

**Goal:** 所有 CRUD API 可用

**Plans:** 3 plans

Plans:
- [x] 06-01-PLAN.md — Core content CRUD APIs (Article + Category + Tag services and routes)
- [x] 06-02-PLAN.md — Storage adapter + Media API + System settings API
- [x] 06-03-PLAN.md — Middleware chain + Search API + Cache service

**Requirements:**
- API-01: 统一 API 响应格式 (already done in Phase 3)
- API-02: 文章 CRUD API (list/create/update/delete)
- API-03: 分类管理 API (树形结构 CRUD)
- API-04: 标签管理 API (CRUD)
- API-05: 媒体管理 API (upload/list/delete)
- API-06: 主题管理 API (already done in Phase 5)
- API-07: 插件管理 API (already done in Phase 4)
- API-08: 系统设置 API (get/update)
- API-09: 搜索接口 (文章标题/内容搜索)
- API-10: 错误处理中间件
- API-11: 请求日志中间件
- API-12: Rate limiting 中间件 (登录接口 5 次/分钟)
- STOR-01: 存储适配器接口 (StorageAdapter)
- STOR-02: 本地存储实现
- STOR-03: 文件上传 (类型/大小限制 + MIME 校验)
- CACHE-01: LRU 缓存服务 (per-data-type TTL)

**Success Criteria:**
1. 统一响应格式
2. 所有 CRUD 路由可用
3. 中间件链正常
4. 文件上传可用
5. 缓存服务可用

**Deliverables:**
- `apps/site/server/api/` — 所有 API 路由 (articles, categories, tags, media, settings, search)
- `apps/site/server/services/` — 业务服务层 (article, category, tag, media, settings, cache)
- `apps/site/server/storage/` — 存储适配层 (adapter, local, factory)
- `apps/site/server/middleware/` — 中间件 (error-handler, log, rate-limit)

---

### Phase 7: 后台布局 + 文章管理

**Goal:** 后台可写文章

**Plans:** 3 plans

Plans:
- [x] 07-01-PLAN.md — Admin layout + login page + auth composable (sidebar, navbar, breadcrumbs, client-side auth)
- [x] 07-02-PLAN.md — Dashboard + article list pages (stats, table, search, filter, pagination, delete)
- [x] 07-03-PLAN.md — Article editor with Vditor + metadata panel (create/edit, categories, tags, status)

**Requirements:**
- ADMIN-01: 后台布局 (侧边栏 + 顶部导航 + 面包屑)
- ADMIN-02: 仪表盘页面 (概览统计)
- ADMIN-03: 文章管理页面 (列表 + 创建/编辑/删除)
- ADMIN-04: 文章编辑器 (Vditor Markdown 编辑)
- ADMIN-05: 文章状态管理 (草稿/发布/定时发布)

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

**Plans:** 3 plans

Plans:
- [x] 08-01-PLAN.md — Categories + Tags management pages (tree CRUD, color picker)
- [x] 08-02-PLAN.md — Media library + Themes + Plugins pages (upload, activate, enable/disable)
- [x] 08-03-PLAN.md — Settings page + verification (tabbed form, user menu logout)

**Requirements:**
- ADMIN-06: 分类管理页面 (树形结构 + CRUD)
- ADMIN-07: 标签管理页面 (CRUD + 颜色)
- ADMIN-08: 媒体库页面 (上传/浏览/删除)
- ADMIN-09: 主题管理页面 (列表/启用/配置)
- ADMIN-10: 插件管理页面 (列表/启用/配置)
- ADMIN-11: 系统设置页面 (站点/SEO/阅读/社交)
- ADMIN-12: 用户菜单 (登出)

**Success Criteria:**
1. 分类管理 (树形 CRUD)
2. 标签管理 (CRUD + 颜色)
3. 媒体库 (上传/浏览/删除)
4. 主题管理 (列表/启用)
5. 插件管理 (列表/启用/配置)
6. 系统设置 (4 个分组 tab)
7. 用户菜单登出

**Deliverables:**
- `apps/site/pages/admin/categories.vue` — 分类管理页面
- `apps/site/pages/admin/tags.vue` — 标签管理页面
- `apps/site/pages/admin/media.vue` — 媒体库页面
- `apps/site/pages/admin/themes.vue` — 主题管理页面
- `apps/site/pages/admin/plugins.vue` — 插件管理页面
- `apps/site/pages/admin/settings.vue` — 系统设置页面
- `apps/site/components/admin/categories/` — 分类组件
- `apps/site/components/admin/tags/` — 标签组件
- `apps/site/components/admin/media/` — 媒体组件
- `apps/site/components/admin/themes/` — 主题组件
- `apps/site/components/admin/plugins/` — 插件组件
- `apps/site/components/admin/settings/` — 设置组件

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
| FOUND-01 | 1 | Complete |
| FOUND-02 | 1 | Complete |
| FOUND-03 | 1 | Complete |
| FOUND-04 | 1 | Complete |
| FOUND-05 | 1 | Complete |
| DB-01 | 2 | Complete |
| DB-02 | 2 | Complete |
| DB-03 | 2 | Complete |
| DB-04 | 2 | Complete |
| DB-05 | 2 | Complete |
| AUTH-01 | 3 | Complete |
| AUTH-02 | 3 | Complete |
| AUTH-03 | 3 | Complete |
| AUTH-04 | 3 | Complete |
| AUTH-05 | 3 | Complete |
| CORE-01 | 4 | Complete |
| CORE-02 | 4 | Complete |
| CORE-03 | 4 | Complete |
| CORE-04 | 4 | Complete |
| CORE-05 | 5 | Complete |
| CORE-06 | 5 | Complete |
| CORE-07 | 5 | Complete |
| CORE-08 | 5 | Complete |
| API-01 | 6 | Complete |
| API-02 | 6 | Complete |
| API-03 | 6 | Complete |
| API-04 | 6 | Complete |
| API-05 | 6 | Complete |
| API-06 | 5 | Complete |
| API-07 | 4 | Complete |
| API-08 | 6 | Complete |
| API-09 | 6 | Complete |
| API-10 | 6 | Complete |
| API-11 | 6 | Complete |
| API-12 | 6 | Complete |
| CACHE-01 | 6 | Complete |
| STOR-01 | 6 | Complete |
| STOR-02 | 6 | Complete |
| STOR-03 | 6 | Complete |
| ADMIN-01 | 7 | Complete |
| ADMIN-02 | 7 | Complete |
| ADMIN-03 | 7 | Complete |
| ADMIN-04 | 7 | Complete |
| ADMIN-05 | 7 | Complete |
| ADMIN-06 | 8 | Complete |
| ADMIN-07 | 8 | Complete |
| ADMIN-08 | 8 | Complete |
| ADMIN-09 | 8 | Complete |
| ADMIN-10 | 8 | Complete |
| ADMIN-11 | 8 | Complete |
| ADMIN-12 | 8 | Complete |
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
*Phase 5 plan created: 2026-04-30*
*Phase 5 completed: 2026-04-30*
*Phase 6 plan created: 2026-04-30*
*Phase 6 Plan 1 completed: 2026-04-30*
*Phase 7 plan created: 2026-04-30*
*Phase 7 completed: 2026-04-30*
*Phase 8 plan created: 2026-04-30*
*Phase 8 completed: 2026-04-30*
