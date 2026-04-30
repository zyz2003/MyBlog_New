# Requirements: 个人博客系统

**Defined:** 2026-04-30
**Core Value:** 方便的内容管理 + 灵活的样式/插件系统 + 自部署可控

## v1 Requirements

### Foundation (基础设施)

- [ ] **FOUND-01**: 项目可通过 `pnpm dev` 一键启动，前台 SSR + 后台 SPA + API 运行在同一进程
- [ ] **FOUND-02**: pnpm workspace Monorepo 结构可用 (apps/site + packages/plugins + themes)
- [ ] **FOUND-03**: TypeScript 严格模式，全项目类型安全
- [ ] **FOUND-04**: UnoCSS 原子化 CSS 可用，支持 CSS Variables 动态主题
- [ ] **FOUND-05**: 环境变量管理 (.env)，敏感信息不入库

### Database (数据库)

- [ ] **DB-01**: Drizzle ORM + SQLite (WAL 模式) 连接可用
- [ ] **DB-02**: 11 张核心表 Schema 定义完成 (posts, categories, tags, postCategories, postTags, users, media, themeSettings, pluginSettings, systemSettings, sessions)
- [ ] **DB-03**: 数据库迁移脚本可自动生成和执行
- [ ] **DB-04**: 软删除模式 (posts 表 deletedAt 字段)
- [ ] **DB-05**: 统一主键 (integer 自增) 和时间戳 (createdAt, updatedAt)

### Auth (认证)

- [ ] **AUTH-01**: 管理员可通过用户名/密码登录
- [ ] **AUTH-02**: JWT token 生成和验证 (7 天有效期)
- [ ] **AUTH-03**: Token 自动续期 (剩余 < 1 天时刷新)
- [ ] **AUTH-04**: 登出功能 (清除客户端 token)
- [ ] **AUTH-05**: Auth 中间件保护后台 API 路由

### API (接口层)

- [ ] **API-01**: 统一 API 响应格式 `{ code: 0, data: T }` / `{ code: number, message: string }`
- [ ] **API-02**: 文章 CRUD API (list/create/update/delete)
- [ ] **API-03**: 分类管理 API (树形结构 CRUD)
- [ ] **API-04**: 标签管理 API (CRUD)
- [ ] **API-05**: 媒体管理 API (upload/list/delete)
- [ ] **API-06**: 主题管理 API (list/activate/config)
- [ ] **API-07**: 插件管理 API (list/enable/config)
- [ ] **API-08**: 系统设置 API (get/update)
- [ ] **API-09**: 搜索接口 (文章标题/内容搜索)
- [ ] **API-10**: 错误处理中间件 (统一错误格式)
- [ ] **API-11**: 请求日志中间件
- [ ] **API-12**: Rate limiting 中间件 (登录接口 5 次/分钟)

### Core System (核心系统)

- [ ] **CORE-01**: 插件适配器接口 (PluginAdapter: meta, configSchema, mountPoints, component, onMount)
- [ ] **CORE-02**: 插件管理器 (注册、启用、禁用、配置)
- [ ] **CORE-03**: 6 个挂载点实现 (head-end, header-end, sidebar, post-end, footer-start, body-end)
- [ ] **CORE-04**: 插件 SSR 兼容 (Vue 组件方式 + 脚本注入方式)
- [x] **CORE-05**: 主题系统 (layout.vue + config.json + styles.css)
- [x] **CORE-06**: 主题热切换 (动态组件加载，defineAsyncComponent)
- [x] **CORE-07**: CSS Variables 主题变量系统
- [x] **CORE-08**: 钩子系统 (生命周期管理)

### Admin (后台管理)

- [ ] **ADMIN-01**: 后台布局 (侧边栏 + 顶部导航 + 面包屑)
- [ ] **ADMIN-02**: 仪表盘页面 (概览统计)
- [ ] **ADMIN-03**: 文章管理页面 (列表 + 创建/编辑/删除)
- [ ] **ADMIN-04**: 文章编辑器 (Vditor Markdown 编辑)
- [ ] **ADMIN-05**: 文章状态管理 (草稿/发布/定时发布)
- [ ] **ADMIN-06**: 分类管理页面 (树形结构 + CRUD)
- [ ] **ADMIN-07**: 标签管理页面 (CRUD + 颜色)
- [ ] **ADMIN-08**: 媒体库页面 (上传/浏览/删除 + 文件夹管理)
- [ ] **ADMIN-09**: 主题管理页面 (列表/启用/配置预览)
- [ ] **ADMIN-10**: 插件管理页面 (列表/启用/配置)
- [ ] **ADMIN-11**: 系统设置页面 (站点/SEO/样式/阅读/社交)
- [ ] **ADMIN-12**: 用户菜单 (登出)

### Frontend (前台博客)

- [ ] **FE-01**: 首页 (最新文章列表 + 分类/标签导航)
- [ ] **FE-02**: 文章列表页 (分页 + 分类/标签筛选)
- [ ] **FE-03**: 文章详情页 (Markdown 渲染 + 目录 + 代码高亮)
- [ ] **FE-04**: 分类页 (按分类筛选文章)
- [ ] **FE-05**: 标签页 (按标签筛选文章)
- [ ] **FE-06**: 搜索页 (关键词搜索)
- [ ] **FE-07**: 关于页面
- [ ] **FE-08**: RSS Feed 生成
- [ ] **FE-09**: SEO 优化 (meta tags, og tags, sitemap)
- [ ] **FE-10**: 响应式设计 (移动端适配)

### Storage (存储)

- [ ] **STOR-01**: 存储适配器接口 (StorageAdapter)
- [ ] **STOR-02**: 本地存储实现
- [ ] **STOR-03**: 文件上传 (类型/大小限制 + MIME 校验)

### Cache (缓存)

- [ ] **CACHE-01**: LRU 缓存服务 (per-data-type TTL)

## v2 Requirements

### Editor (编辑器)

- **EDIT-01**: TipTap 可视化富文本编辑器集成
- **EDIT-02**: 双编辑器切换 (Vditor ↔ TipTap)

### Plugin (插件扩展)

- **PLUG-01**: 插件扩展接口 (onInit, onUnmount, onConfigChange)
- **PLUG-02**: 插件自定义服务端路由 (serverRoutes)
- **PLUG-03**: 插件依赖和冲突管理

### Storage (存储扩展)

- **STOR-03**: OSS 存储适配器
- **STOR-04**: S3 存储适配器

### Deploy (部署)

- **DEPLOY-01**: Docker 配置 (Dockerfile + docker-compose)
- **DEPLOY-02**: Nginx 反向代理配置
- **DEPLOY-03**: 部署文档

### Advanced (高级功能)

- **ADV-01**: 文章版本历史 (post_revisions)
- **ADV-02**: 文章系列 (series)
- **ADV-03**: 详细浏览统计 (post_views)
- **ADV-04**: SEO 重定向管理

## Out of Scope

| Feature | Reason |
|---------|--------|
| 内置评论系统 | 使用第三方插件 (Twikoo/Waline)，避免重复造轮子 |
| 多语言支持 | 单语言中文博客，复杂度高 |
| 多用户/权限 | 单管理员使用，不需要 |
| Redis 缓存 | SQLite WAL 模式已足够 |
| Serverless 部署 | 暂不考虑部署方式 |
| 移动端 App | Web 优先，响应式适配即可 |

## Traceability

(由 roadmap 创建时填充)

| Requirement | Phase | Status |
|-------------|-------|--------|

**Coverage:**
- v1 requirements: 0 total
- Mapped to phases: 0
- Unmapped: 0

---
*Requirements defined: 2026-04-30*
*Last updated: 2026-04-30 after initial definition*
