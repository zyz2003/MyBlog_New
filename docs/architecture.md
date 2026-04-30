# 个人博客系统架构方案

**版本**: v2.1
**更新日期**: 2026-04-30
**状态**: 架构设计优化完成，分阶段实施
**决策记录**: [docs/decisions/](decisions/)

---

## 一、项目概述

### 1.1 项目背景

现有主流博客系统的痛点：

| 类型          | 代表             | 痛点                                              |
| ------------- | ---------------- | ------------------------------------------------- |
| **静态博客**  | Hexo/Hugo/Jekyll | 增删改文章需命令 + 重建，样式修改困难，无后台管理 |
| **动态 CMS**  | WordPress/Ghost  | 需服务器 + 数据库，运维成本高，安全风险，更新频繁 |
| **SaaS 平台** | Medium/Substack  | 无法自定义样式，数据锁定，国内访问困难，平台依赖  |

### 1.2 核心需求

| 需求               | 描述                                        | 优先级 |
| ------------------ | ------------------------------------------- | ------ |
| **方便的内容管理** | 可视化编辑 + Markdown 双支持，无需命令/重建 | P0     |
| **灵活的样式系统** | 可轻松替换、修改、增加主题风格              | P0     |
| **极度解耦**       | 功能模块可热插拔，不影响其他功能            | P0     |
| **强扩展性**       | 通用插件适配系统，兼容第三方及自研模块      | P0     |
| **后台统一管理**   | 所有内容、样式、模块通过后台管理            | P0     |
| **首屏性能**       | SSR 渲染，解决首屏加载慢的问题              | P1     |
| **自部署**         | 部署到个人服务器，完全可控                  | P1     |

### 1.3 目标用户

| 用户类型       | 需求                                      | 本方案满足                 |
| -------------- | ----------------------------------------- | -------------------------- |
| **博客所有者** | 有 Vue3/TS/Node.js 技术背景，需要灵活定制 | 技术栈匹配，高度可定制     |
| **内容读者**   | 快速加载、良好阅读体验                    | SSR 首屏快，SEO 优化       |
| **内容创作者** | 简单写作、方便管理                        | 可视化编辑器，后台统一管理 |
| **开发者**     | 简单易懂的主题/模块开发体验               | 清晰接口，完整文档         |

---

## 二、技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              个人服务器 (VPS / 云服务器)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │                       Nginx / Caddy (反向代理)                          │     │
│  │  - HTTPS 终端 (SSL/TLS + 证书自动续期)                                  │     │
│  │  - 静态资源缓存 (图片/JS/CSS + 浏览器缓存策略)                          │     │
│  │  - 请求路由转发 (/api/* → Nitro, /* → Nuxt SSR)                        │     │
│  └──────────────────────────────────┬──────────────────────────────────────┘     │
│                                      │                                           │
│             ┌────────────────────────┴────────────────────────┐                  │
│             ▼                                                  ▼                  │
│  ┌─────────────────────────┐                   ┌─────────────────────────┐        │
│  │   前台博客 (Site)       │                   │   后台管理 (Admin)      │        │
│  │   Nuxt 3 SSR           │                   │   Nuxt 3 SPA            │        │
│  │                         │                   │                         │        │
│  │   路由:                 │                   │   路由:                 │        │
│  │   / (首页)              │                   │   /admin/dashboard      │        │
│  │   /articles (列表)      │                   │   /admin/articles       │        │
│  │   /articles/:slug       │                   │   /admin/categories     │        │
│  │   /categories/:slug     │                   │   /admin/tags           │        │
│  │   /tags/:slug           │                   │   /admin/media          │        │
│  │   /pages/:slug          │                   │   /admin/themes         │        │
│  │   /search               │                   │   /admin/styles         │        │
│  │   /about                │                   │   /admin/plugins        │        │
│  │   /feed.xml (RSS)       │                   │   /admin/settings       │        │
│  │                         │                   │                         │        │
│  │   渲染模式:             │                   │   渲染模式:             │        │
│  │   SSR (首屏直出)        │                   │   SPA (客户端渲染)      │        │
│  └────────────┬────────────┘                   └────────────┬────────────┘        │
│               │                                              │                    │
│               └──────────────────┬───────────────────────────┘                    │
│                                  ▼                                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐    │
│  │                         应用层 (Nuxt 3 App)                               │    │
│  │                                                                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │   组件层     │  │   Composables│  │   Stores     │  │   Utils      │  │    │
│  │  │              │  │   (组合函数)  │  │   (Pinia)    │  │   (工具函数)  │  │    │
│  │  │  layouts/    │  │              │  │              │  │              │  │    │
│  │  │  admin/      │  │  useTheme()  │  │  articleStore│  │  seo.ts      │  │    │
│  │  │  modules/    │  │  usePlugin() │  │  themeStore  │  │  format.ts   │  │    │
│  │  │  ui/         │  │  useStyle()  │  │  pluginStore │  │  cache.ts    │  │    │
│  │  │  plugins/    │  │  useSEO()    │  │  siteStore   │  │              │  │    │
│  │  │              │  │  useFetch()  │  │              │  │              │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  │                                                                           │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐    │    │
│  │  │                    核心系统 (Core Systems)                       │    │    │
│  │  │                                                                  │    │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │    │    │
│  │  │  │  插件系统    │  │  主题系统    │  │  钩子系统            │  │    │    │
│  │  │  │  PluginMgr   │  │  ThemeMgr    │  │  HookRegistry        │  │    │    │
│  │  │  │              │  │              │  │                      │  │    │    │
│  │  │  │  - 注册中心  │  │  - 主题注册  │  │  - 钩子注册          │  │    │    │
│  │  │  │  - SSR兼容   │  │  - Layout切换│  │  - 事件分发          │  │    │    │
│  │  │  │  - 挂载点    │  │  - 样式编译  │  │  - 优先级排序        │  │    │    │
│  │  │  │  - 生命周期  │  │  - CSS变量   │  │                      │  │    │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │    │    │
│  │  └──────────────────────────────────────────────────────────────────┘    │    │
│  └───────────────────────────────────┬───────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────────┐    │
│  │                       Nitro API 层 (服务端)                               │    │
│  │                                                                           │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐     │    │
│  │  │  API 路由                                                        │     │    │
│  │  │  /api/auth/*          认证授权 (login/logout/me)                │     │    │
│  │  │  /api/articles/*      文章 CRUD (list/create/update/delete)     │     │    │
│  │  │  /api/categories/*    分类管理                                  │     │    │
│  │  │  /api/tags/*          标签管理                                  │     │    │
│  │  │  /api/media/*         媒体管理 (upload/list/delete)             │     │    │
│  │  │  /api/themes/*        主题管理 (list/activate/config)           │     │    │
│  │  │  /api/styles/*        样式配置 (get/update)                     │     │    │
│  │  │  /api/plugins/*       插件管理 (list/enable/config)             │     │    │
│  │  │  /api/settings/*      系统设置                                  │     │    │
│  │  │  /api/comments/*      评论管理 (可选，优先用第三方插件)         │     │    │
│  │  │  /api/search          搜索接口                                  │     │    │
│  │  └─────────────────────────────────────────────────────────────────┘     │    │
│  │                                                                           │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐     │    │
│  │  │  中间件层                                                        │     │    │
│  │  │  - auth (JWT 认证)          - cors (跨域)                       │     │    │
│  │  │  - rateLimit (限流)         - error (统一错误处理)              │     │    │
│  │  │  - log (请求日志)                                                │     │    │
│  │  └─────────────────────────────────────────────────────────────────┘     │    │
│  │                                                                           │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐     │    │
│  │  │  服务层 (Service)                                                │     │    │
│  │  │  - ArticleService       文章业务逻辑                            │     │    │
│  │  │  - CategoryService      分类业务逻辑                            │     │    │
│  │  │  - TagService           标签业务逻辑                            │     │    │
│  │  │  - MediaService         媒体业务逻辑 + 存储适配                 │     │    │
│  │  │  - ThemeService         主题业务逻辑                            │     │    │
│  │  │  - PluginService        插件业务逻辑                            │     │    │
│  │  │  - AuthService          认证业务逻辑                            │     │    │
│  │  │  - CacheService         缓存管理                                │     │    │
│  │  └─────────────────────────────────────────────────────────────────┘     │    │
│  └───────────────────────────────────┬───────────────────────────────────────┘    │
│                                      │                                           │
│                    ┌─────────────────┴─────────────────┐                        │
│                    ▼                                    ▼                        │
│  ┌──────────────────────────┐          ┌──────────────────────────┐              │
│  │   Drizzle ORM            │          │   缓存层 (可选)          │              │
│  │                          │          │                          │              │
│  │   SQLite (WAL 模式)      │          │   MemoryCache (内置)     │              │
│  │   database/blog.sqlite   │          │   Redis (可选扩展)       │              │
│  │                          │          │                          │              │
│  │   特点:                  │          │   缓存策略:              │              │
│  │   - 单文件，易备份       │          │   - 文章列表 5min TTL    │              │
│  │   - 零配置，开箱即用     │          │   - 文章详情 10min TTL   │              │
│  │   - 支持 ACID 事务       │          │   - 主题/插件配置 1h TTL │              │
│  │   - 后续可迁移 MySQL/PG  │          │   - 写操作主动失效       │              │
│  └──────────────────────────┘          └──────────────────────────┘              │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │   文件系统                                                               │    │
│  │   themes/            主题目录 (minimal/, magazine/, portfolio/)          │    │
│  │   uploads/           上传文件 (images/, documents/)                      │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               数据流架构                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  浏览器   │───▶│  Nginx   │───▶│  Nuxt    │───▶│  Nitro   │───▶│ Drizzle  │  │
│  │  请求     │    │  反代    │    │  SSR/SPA │    │  API     │    │  ORM     │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘  │
│       │                                     │                         │        │
│       │                                     │                         ▼        │
│       │                                     │                   ┌──────────┐   │
│       │                                     │                   │  SQLite  │   │
│       │                                     │                   └──────────┘   │
│       │                                     │                                   │
│       │                                     ▼                                   │
│       │                           ┌─────────────────┐                          │
│       │                           │  插件钩子拦截    │                          │
│       │                           │  (数据预处理)    │                          │
│       │                           └─────────────────┘                          │
│       │                                                                         │
│       │         前台 SSR 流程:                                                  │
│       │         1. Nitro API 返回数据                                           │
│       │         2. 插件钩子拦截/修改数据                                        │
│       │         3. SSR 渲染为 HTML                                              │
│       │         4. 注入插件组件 (评论/统计等)                                   │
│       │         5. 返回完整 HTML                                                │
│       │                                                                         │
│       │         后台 SPA 流程:                                                  │
│       │         1. 返回空 HTML + JS Bundle                                      │
│       │         2. 客户端 JS 加载                                               │
│       │         3. Vue Router 匹配路由                                          │
│       │         4. 客户端调用 API 获取数据                                      │
│       │         5. 渲染页面                                                     │
│       │                                                                         │
│       ▼                                                                         │
│  ┌──────────────────────────────────┐                                           │
│  │  浏览器渲染                       │                                           │
│  │  1. 接收 HTML (首屏直出)          │                                           │
│  │  2. 解析并显示内容                │                                           │
│  │  3. Vue 水合 (Hydration)          │                                           │
│  │  4. 插件组件异步加载              │                                           │
│  │  5. 交互式页面完成                │                                           │
│  └──────────────────────────────────┘                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 插件系统架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              插件系统架构                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  插件注册中心 (PluginManager)                                             │  │
│  │                                                                           │  │
│  │  插件类型:                                                                │  │
│  │  ├── comment    评论类 (Twikoo, Waline, Disqus, 内置评论)                │  │
│  │  ├── analytics  统计类 (Google Analytics, 百度统计, Umami)               │  │
│  │  ├── search     搜索类 (Algolia, MeiliSearch, 本地搜索)                  │  │
│  │  ├── social     社交类 (分享按钮, Follow 按钮, 订阅框)                   │  │
│  │  ├── ad         广告类 (Google AdSense, 自定义广告位)                    │  │
│  │  ├── feature    功能类 (打赏, 暗黑模式, 阅读进度, 返回顶部)              │  │
│  │  └── custom     自定义 (任意代码/组件, 第三方服务集成)                   │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  插件适配器接口 (PluginAdapter) — SSR 兼容设计                            │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  // 元信息                                                          │ │  │
│  │  │  meta: { name, label, type, version, author, description, icon }    │ │  │
│  │  │                                                                     │ │  │
│  │  │  // 配置 Schema (后台自动生成表单)                                  │ │  │
│  │  │  configSchema: Record<string, ConfigField>                          │ │  │
│  │  │                                                                     │ │  │
│  │  │  // 挂载点声明                                                      │ │  │
│  │  │  mountPoints: MountPoint[]                                          │ │  │
│  │  │                                                                     │ │  │
│  │  │  // SSR 兼容: Vue 组件方式 (可选)                                   │ │  │
│  │  │  // 用于需要在服务端渲染的插件 (评论框、目录等)                     │ │  │
│  │  │  component?: AsyncComponentLoader                                   │ │  │
│  │  │                                                                     │ │  │
│  │  │  // 客户端初始化 (可选)                                             │ │  │
│  │  │  // 用于脚本注入类插件 (统计、广告等)                               │ │  │
│  │  │  onInit?(config: any): Promise<void>                                │ │  │
│  │  │  onMount?(container: HTMLElement, config: any): void                │ │  │
│  │  │  onUnmount?(): void                                                 │ │  │
│  │  │  onConfigChange?(newConfig: any, oldConfig: any): void              │ │  │
│  │  │                                                                     │ │  │
│  │  │  // 服务端路由 (可选)                                               │ │  │
│  │  │  serverRoutes?: ServerRoute[]                                       │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  挂载点系统 (6 个高频位置)                                                │  │
│  │                                                                           │  │
│  │  <html>                                                                   │  │
│  │    <head>                                                                 │  │
│  │      └─ head-end             // 统计脚本、SEO meta、自定义 link           │  │
│  │    <body>                                                                 │  │
│  │      ├─ header-end           // 搜索框、暗黑模式切换、用户按钮           │  │
│  │      ├─ sidebar              // 文章目录、标签云、热门文章               │  │
│  │      ├─ post-end             // 评论系统、打赏、相关推荐                 │  │
│  │      ├─ footer-start         // 站点信息扩展、订阅框                     │  │
│  │      └─ body-end             // 全局悬浮按钮 (回到顶部、客服)            │  │
│  │                                                                           │  │
│  │  注: 暂缓的 13 个挂载点见 docs/decisions/A002-mount-points-simplification  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  插件渲染策略 (SSR 兼容)                                                  │  │
│  │                                                                           │  │
│  │  方式一: Vue 组件渲染 (SSR 安全)                                          │  │
│  │  ├── 插件提供 Vue 组件 (component 字段)                                  │  │
│  │  ├── 通过 <PluginMount> 动态渲染                                         │  │
│  │  ├── 支持 SSR 预渲染                                                     │  │
│  │  └── 适用: 评论框、目录、相关文章推荐                                    │  │
│  │                                                                           │  │
│  │  方式二: 脚本注入渲染 (纯客户端)                                          │  │
│  │  ├── 插件通过 onMount 操作 DOM                                           │  │
│  │  ├── 用 <ClientOnly> 包裹，仅客户端执行                                  │  │
│  │  ├── 不影响 SSR 输出                                                     │  │
│  │  └── 适用: 统计代码、广告脚本、悬浮按钮                                  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  插件开发方式                                                              │  │
│  │                                                                           │  │
│  │  方式一: 内联插件 (简单)                                                  │  │
│  │  后台 → 插件中心 → 新建插件 → 填写配置 → 编写 JS/Vue 代码 → 保存        │  │
│  │  适用: 自定义脚本、简单广告代码                                          │  │
│  │                                                                           │  │
│  │  方式二: 独立包插件 (复杂)                                                │  │
│  │  packages/plugins/my-plugin/ → 本地开发 → 构建 → 后台上传 .zip           │  │
│  │  适用: 复杂插件，需要完整开发环境                                        │  │
│  │                                                                           │  │
│  │  方式三: npm 包插件 (未来)                                                │  │
│  │  发布到 npm → 后台搜索安装                                               │  │
│  │  适用: 公开插件，供多人使用                                              │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 技术栈选型详解

| 层次              | 技术选型       | 版本   | 理由                                | 备选方案             |
| ----------------- | -------------- | ------ | ----------------------------------- | -------------------- |
| **前端框架**      | Nuxt 3         | 3.x    | SSR 首屏性能、Vue3 生态、约定式路由 | Next.js 14, Astro    |
| **UI 框架**       | Vue 3          | 3.4+   | Composition API、响应式系统、性能好 | React 18, Svelte     |
| **语言**          | TypeScript     | 5.x    | 类型安全、智能提示、维护友好        | JavaScript (不推荐)  |
| **样式**          | UnoCSS         | 0.x    | 原子化 CSS、原生 CSS Variables 支持  | Tailwind CSS         |
| **CSS 扩展**      | CSS Variables  | Native | 动态换肤、运行时修改                | SCSS Variables       |
| **后端框架**      | Nitro          | 2.x    | Nuxt 3 内置、零配置、轻量高效       | NestJS, Express, Koa |
| **ORM**           | Drizzle ORM    | 0.x    | 轻量、类型安全、SQL-like            | Prisma, TypeORM      |
| **数据库**        | SQLite         | 3.x    | 单文件、易备份、零配置              | MySQL, PostgreSQL    |
| **缓存**          | 内置 LRU 缓存  | -      | 零依赖、够用                        | Redis (可选)         |
| **可视化编辑**    | TipTap         | 2.x    | Vue3 友好、可扩展、富文本           | Quill, Slate         |
| **Markdown 编辑** | Vditor         | 3.x    | 国产开源、即时渲染、模式切换        | bytemd, MD Editor    |
| **部署**          | Docker + PM2   | Latest | 容器化、进程管理、自动保活          | Systemd, Supervisor  |
| **反向代理**      | Nginx / Caddy  | Latest | 静态资源、HTTPS、负载均衡           | -                    |
| **构建工具**      | Vite           | 5.x    | 快速开发、热更新、按需编译          | Webpack (不推荐)     |
| **包管理**        | pnpm           | 8.x    | 快速、节省空间、依赖提升            | npm, yarn            |
| **Monorepo**      | pnpm workspace | -      | 多包管理、代码共享                  | Turborepo, Nx        |

---

## 三、项目目录结构

```
my-blog/
│
├── apps/
│   └── site/                              # 主应用 (Nuxt 3 - 前台 SSR + 后台 SPA)
│       ├── app.vue                        # 应用入口
│       ├── nuxt.config.ts                 # Nuxt 配置 (含 routeRules 混合渲染)
│       ├── tsconfig.json
│       ├── uno.config.ts                  # UnoCSS 配置
│       │
│       ├── components/
│       │   ├── layouts/                   # 布局组件
│       │   │   ├── DefaultLayout.vue      # 前台布局 (导航头 + 页脚)
│       │   │   ├── AdminLayout.vue        # 后台布局 (侧边栏 + 管理导航)
│       │   │   └── AuthLayout.vue         # 认证布局 (无导航)
│       │   │
│       │   ├── admin/                     # 后台管理组件
│       │   │   ├── articles/              # 文章管理
│       │   │   │   ├── ArticleTable.vue
│       │   │   │   ├── ArticleEditor.vue
│       │   │   │   ├── CategorySelector.vue
│       │   │   │   └── TagInput.vue
│       │   │   ├── media/                 # 媒体管理
│       │   │   │   ├── MediaGallery.vue
│       │   │   │   └── MediaUploader.vue
│       │   │   ├── themes/                # 主题管理
│       │   │   │   ├── ThemeCard.vue
│       │   │   │   ├── ThemePreview.vue
│       │   │   │   └── ThemeConfigPanel.vue
│       │   │   ├── plugins/               # 插件管理
│       │   │   │   ├── PluginCard.vue
│       │   │   │   ├── PluginConfigForm.vue
│       │   │   │   └── PluginMarket.vue
│       │   │   ├── styles/                # 样式配置
│       │   │   │   ├── StyleConfigPanel.vue
│       │   │   │   ├── ColorPalettePicker.vue
│       │   │   │   └── FontSelector.vue
│       │   │   ├── forms/                 # 通用表单组件
│       │   │   │   ├── TextInput.vue
│       │   │   │   ├── RichTextEditor.vue
│       │   │   │   ├── MarkdownEditor.vue
│       │   │   │   ├── ImageUploader.vue
│       │   │   │   ├── ColorPicker.vue
│       │   │   │   ├── ToggleSwitch.vue
│       │   │   │   └── SelectDropdown.vue
│       │   │   └── common/                # 后台通用组件
│       │   │       ├── Sidebar.vue
│       │   │       ├── Navbar.vue
│       │   │       └── Dashboard.vue
│       │   │
│       │   ├── modules/                   # 前台功能模块组件
│       │   │   ├── Header.vue             # 导航头
│       │   │   ├── Footer.vue             # 页脚
│       │   │   ├── Sidebar.vue            # 侧边栏
│       │   │   ├── PostCard.vue           # 文章卡片
│       │   │   ├── PostList.vue           # 文章列表
│       │   │   ├── Pagination.vue         # 分页
│       │   │   ├── TableOfContents.vue    # 文章目录
│       │   │   ├── CommentBox.vue         # 评论容器
│       │   │   └── PluginMount.vue        # 插件挂载容器
│       │   │
│       │   ├── ui/                        # 基础 UI 组件
│       │   │   ├── Button.vue
│       │   │   ├── Input.vue
│       │   │   ├── Modal.vue
│       │   │   ├── Card.vue
│       │   │   ├── Dropdown.vue
│       │   │   ├── Toast.vue
│       │   │   ├── Tooltip.vue
│       │   │   ├── Badge.vue
│       │   │   ├── Table.vue
│       │   │   ├── Empty.vue
│       │   │   └── index.ts               # 统一导出
│       │   │
│       │   └── plugins/                   # 插件渲染组件
│       │       ├── CommentRenderer.vue    # 评论渲染器
│       │       ├── AnalyticsInjector.vue  # 统计注入
│       │       └── ScriptInjector.vue     # 脚本注入
│       │
│       ├── composables/                   # 组合式函数
│       │   ├── useTheme.ts                # 主题加载/切换
│       │   ├── usePlugin.ts               # 插件注册/管理
│       │   ├── useStyle.ts                # 样式配置/应用
│       │   ├── useSEO.ts                  # SEO 元数据生成
│       │   ├── useFetch.ts                # API 请求封装 (含统一响应处理)
│       │   ├── useMountPoints.ts          # 挂载点管理
│       │   └── index.ts
│       │
│       ├── pages/                         # 页面路由 (约定式)
│       │   ├── index.vue                  # 首页
│       │   ├── articles/
│       │   │   ├── index.vue              # 文章列表
│       │   │   └── [slug].vue             # 文章详情
│       │   ├── categories/
│       │   │   └── [slug].vue             # 分类页
│       │   ├── tags/
│       │   │   └── [slug].vue             # 标签页
│       │   ├── pages/
│       │   │   └── [slug].vue             # 自定义页面
│       │   ├── admin/                     # 后台管理页面
│       │   │   ├── index.vue              # 仪表盘
│       │   │   ├── articles/
│       │   │   │   ├── index.vue          # 文章列表
│       │   │   │   ├── new.vue            # 新建文章
│       │   │   │   └── [id].vue           # 编辑文章
│       │   │   ├── categories.vue
│       │   │   ├── tags.vue
│       │   │   ├── media.vue
│       │   │   ├── themes.vue
│       │   │   ├── styles.vue
│       │   │   ├── plugins.vue
│       │   │   └── settings.vue
│       │   ├── search.vue                 # 搜索页
│       │   ├── about.vue                  # 关于页
│       │   └── feed.xml.ts                # RSS Feed
│       │
│       ├── stores/                        # Pinia 状态管理
│       │   ├── article.ts                 # 文章状态
│       │   ├── theme.ts                   # 主题状态
│       │   ├── plugin.ts                  # 插件状态
│       │   └── site.ts                    # 站点配置
│       │
│       ├── utils/                         # 工具函数
│       │   ├── seo.ts                     # SEO 工具
│       │   ├── format.ts                  # 格式化工具
│       │   └── cache.ts                   # 客户端缓存工具
│       │
│       ├── server/                        # Nitro 服务端
│       │   ├── api/                       # API 路由
│       │   │   ├── auth/
│       │   │   │   ├── login.post.ts
│       │   │   │   ├── logout.post.ts
│       │   │   │   └── me.get.ts
│       │   │   ├── articles/
│       │   │   │   ├── index.get.ts       # 列表 (支持分页/筛选)
│       │   │   │   ├── index.post.ts      # 创建
│       │   │   │   ├── [id].get.ts        # 详情
│       │   │   │   ├── [id].put.ts        # 更新
│       │   │   │   └── [id].delete.ts     # 删除 (软删除)
│       │   │   ├── categories/
│       │   │   ├── tags/
│       │   │   ├── media/
│       │   │   ├── themes/
│       │   │   ├── styles/
│       │   │   ├── plugins/
│       │   │   ├── settings/
│       │   │   ├── comments/
│       │   │   └── search.get.ts
│       │   │
│       │   ├── middleware/                # 服务端中间件
│       │   │   ├── auth.ts                # JWT 认证
│       │   │   ├── cors.ts                # 跨域
│       │   │   └── errorHandler.ts        # 统一错误处理
│       │   │
│       │   ├── services/                  # 服务层
│       │   │   ├── article.service.ts
│       │   │   ├── category.service.ts
│       │   │   ├── tag.service.ts
│       │   │   ├── media.service.ts
│       │   │   ├── theme.service.ts
│       │   │   ├── plugin.service.ts
│       │   │   ├── auth.service.ts
│       │   │   └── cache.service.ts       # 缓存管理
│       │   │
│       │   ├── db/                        # 数据库
│       │   │   ├── schema/                # Schema 定义
│       │   │   │   ├── posts.ts
│       │   │   │   ├── categories.ts
│       │   │   │   ├── tags.ts
│       │   │   │   ├── comments.ts
│       │   │   │   ├── users.ts
│       │   │   │   ├── media.ts
│       │   │   │   ├── settings.ts        # 主题/插件/系统设置合并
│       │   │   │   └── index.ts           # 统一导出 + 关系定义
│       │   │   ├── migrations/
│       │   │   │   └── meta/
│       │   │   │       └── _journal.json
│       │   │   └── index.ts               # 数据库连接
│       │   │
│       │   ├── core/                      # 核心系统
│       │   │   ├── plugin/                # 插件系统
│       │   │   │   ├── manager.ts         # 插件管理器
│       │   │   │   ├── types.ts           # 类型定义
│       │   │   │   └── registry.ts        # 注册中心
│       │   │   ├── theme/                 # 主题系统
│       │   │   │   ├── manager.ts         # 主题管理器
│       │   │   │   ├── compiler.ts        # 样式编译器
│       │   │   │   └── types.ts
│       │   │   └── hook/                  # 钩子系统
│       │   │       ├── registry.ts        # 钩子注册
│       │   │       └── dispatcher.ts      # 事件分发
│       │   │
│       │   └── storage/                   # 存储适配层
│       │       ├── adapter.ts             # 存储接口定义
│       │       ├── local.adapter.ts       # 本地存储实现
│       │       └── index.ts               # 存储工厂
│       │
│       └── public/                        # 静态资源
│           ├── robots.txt
│           └── sitemap.xml
│
├── packages/
│   └── plugins/                           # 独立插件包 (可选，复杂插件使用)
│       ├── twikoo/                        # Twikoo 评论插件
│       │   ├── src/index.ts
│       │   └── package.json
│       ├── google-analytics/              # Google 统计插件
│       └── built-in-comment/              # 内置评论插件
│
├── themes/                                # 主题仓库
│   ├── minimal/                           # 极简主题
│   │   ├── layout.vue                     # 布局定义
│   │   ├── config.json                    # 主题配置
│   │   ├── styles.css                     # 主题样式
│   │   ├── components/                    # 主题独有组件 (可选)
│   │   │   ├── Hero.vue
│   │   │   └── FeaturedPosts.vue
│   │   ├── screenshot.png                 # 预览图
│   │   └── manifest.json                  # 主题元信息
│   ├── magazine/                          # 杂志主题
│   └── portfolio/                         # 作品集主题
│
├── database/                              # SQLite 数据库 (运行时生成)
│   └── blog.sqlite
│
├── uploads/                               # 上传文件 (运行时生成)
│   ├── images/
│   └── documents/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── scripts/                               # 脚本工具
│   ├── init-db.ts
│   ├── migrate.ts
│   └── seed.ts
│
├── docs/                                  # 项目文档
│   ├── plugin-dev-guide.md
│   ├── theme-dev-guide.md
│   └── deployment.md
│
├── .env.example
├── .gitignore
├── package.json                           # Monorepo 根配置
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

### 目录职责说明

| 目录 | 职责 | 说明 |
|------|------|------|
| `apps/site/components/` | 视图组件 | 只负责渲染和用户交互，不含业务逻辑 |
| `apps/site/composables/` | 组合式函数 | 封装可复用的状态逻辑和副作用 |
| `apps/site/stores/` | 全局状态 | Pinia store，跨组件共享状态 |
| `apps/site/server/api/` | API 路由层 | 只做请求解析和响应格式化，不含业务逻辑 |
| `apps/site/server/services/` | 业务服务层 | 核心业务逻辑，被 API 路由调用 |
| `apps/site/server/db/` | 数据访问层 | Schema 定义 + 数据库连接 + 迁移 |
| `apps/site/server/core/` | 核心系统 | 插件/主题/钩子系统，与具体业务无关 |
| `apps/site/server/storage/` | 存储适配层 | 文件存储抽象，支持本地/OSS/S3 切换 |
| `packages/plugins/` | 独立插件包 | 复杂插件的独立开发包 |
| `themes/` | 主题仓库 | 主题文件，运行时被主题系统加载 |

---

## 四、核心系统设计详解

### 4.1 主题系统

**设计理念**: 主题 = 布局 (Layout) + 样式 (CSS Variables) + 配置 (JSON)

#### 4.1.1 主题文件结构

```
themes/minimal/
├── layout.vue              # 布局定义 (Vue 组件)
├── config.json             # 主题配置 (颜色/字体/间距)
├── styles.css              # 主题样式 (CSS Variables)
├── components/             # 主题独有组件 (可选)
│   ├── Hero.vue
│   └── FeaturedPosts.vue
├── screenshot.png          # 主题预览图
└── manifest.json           # 主题元信息
```

#### 4.1.2 主题配置 Schema

```json
{
  "name": "Minimal",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "极简主义博客主题",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#64748B",
    "accent": "#8B5CF6",
    "background": "#FFFFFF",
    "surface": "#F8FAFC",
    "text": "#0F172A",
    "textMuted": "#64748B"
  },
  "fonts": {
    "heading": "system-ui",
    "body": "Inter, system-ui, sans-serif",
    "mono": "JetBrains Mono, monospace"
  },
  "spacing": {
    "unit": "8px",
    "containerMax": "720px",
    "contentPadding": "24px"
  },
  "borderRadius": {
    "small": "4px",
    "medium": "8px",
    "large": "16px"
  },
  "layout": {
    "headerPosition": "top",
    "sidebarPosition": "right",
    "footerStyle": "simple"
  }
}
```

#### 4.1.3 主题 Layout 切换机制

Nuxt 3 中运行时切换 Layout 需要特殊处理。本方案采用**动态组件 + 异步加载**方式：

```typescript
// composables/useTheme.ts
export function useTheme() {
  const activeTheme = useState<string>('activeTheme', () => 'minimal')
  const themeConfig = useState<ThemeConfig | null>('themeConfig', null)

  // 动态加载主题布局组件
  const ThemeLayout = defineAsyncComponent(() => {
    return import(`../../themes/${activeTheme.value}/layout.vue`)
  })

  // 切换主题
  async function switchTheme(themeName: string) {
    // 1. API 更新数据库
    await $fetch('/api/themes/activate', {
      method: 'POST',
      body: { name: themeName },
    })

    // 2. 加载主题配置
    const config = await $fetch(`/api/themes/${themeName}/config`)
    themeConfig.value = config

    // 3. 应用 CSS Variables
    applyThemeStyles(config)

    // 4. 切换布局组件 (通过响应式变量驱动)
    activeTheme.value = themeName
  }

  return { activeTheme, themeConfig, ThemeLayout, switchTheme }
}
```

```vue
<!-- app.vue -->
<template>
  <NuxtLayout :name="activeTheme">
    <NuxtPage />
  </NuxtLayout>
</template>
```

> **注意**: 主题的 layout.vue 需要在 `nuxt.config.ts` 中预注册，或通过 Nuxt 的 `extends` 特性加载。不支持完全运行时从文件系统加载未编译的 `.vue` 文件。

#### 4.1.4 CSS Variables 系统

```css
/* themes/minimal/styles.css */
:root {
  /* 颜色变量 */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-accent: #8b5cf6;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-text-muted: #64748b;

  /* 字体变量 */
  --font-heading: system-ui;
  --font-body: Inter, system-ui, sans-serif;
  --font-mono: JetBrains Mono, monospace;

  /* 间距变量 */
  --spacing-unit: 8px;
  --spacing-sm: calc(var(--spacing-unit) * 1);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 4);

  /* 圆角变量 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* 布局变量 */
  --container-max: 720px;
  --content-padding: 24px;
}

/* 使用变量 */
.article-content {
  max-width: var(--container-max);
  padding: var(--content-padding);
  color: var(--color-text);
  font-family: var(--font-body);
}

.btn-primary {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

> **作用域说明**: CSS Variables 挂载在 `:root` 上，全局生效。如果需要局部主题覆盖（如暗黑模式），通过 `[data-theme="dark"]` 选择器覆盖变量值即可。

#### 4.1.5 主题切换流程

```
1. 用户在后台选择主题
        ↓
2. API: POST /api/themes/activate { name: 'minimal' }
        ↓
3. 更新数据库 theme_settings 表
        ↓
4. 触发钩子: theme:changed
        ↓
5. 前台监听到变更，加载新主题配置
        ↓
6. 应用新 CSS Variables 到 :root
        ↓
7. 切换 Layout 组件 (动态组件)
        ↓
8. 页面即时生效 (无需刷新)
```

---

### 4.2 样式配置系统

#### 4.2.1 配置层级

```
┌─────────────────────────────────────────────────────────────┐
│                    样式配置金字塔                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                       ┌─────────┐                           │
│                      │ 自定义   │  开发者：编辑 CSS          │
│                     │   CSS    │  完整控制，需要技术能力    │
│                    └─────────┘                              │
│                   ┌─────────────┐                           │
│                  │   主题配置   │  高级用户：修改主题 JSON   │
│                 │  (JSON 文件)   │  颜色/字体/间距配置       │
│                └─────────────┘                              │
│               ┌─────────────────┐                           │
│              │   可视化配置器   │  普通用户：后台配置面板    │
│             │  (颜色/字体/滑块)  │  所见即所得，实时预览     │
│            └─────────────────┘                              │
│           ┌─────────────────────┐                           │
│          │      预设主题库      │  一键切换，零配置         │
│         └─────────────────────┘                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.2 后台样式配置 UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│  后台管理系统 - 样式配置                              [重置] [保存] [预览]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ 颜色配置 ────────────────────────────────────────────────────────┐  │
│  │  主色调   ┌─────┐  #3B82F6  [选择器]  按钮/链接/高亮               │  │
│  │  辅色调   ┌─────┐  #64748B  [选择器]  次要按钮/边框                 │  │
│  │  强调色   ┌─────┐  #8B5CF6  [选择器]  徽章/标签/特殊提示           │  │
│  │  背景色   ┌─────┐  #FFFFFF  [选择器]                               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ 字体配置 ────────────────────────────────────────────────────────┐  │
│  │  标题字体  [system-ui ▼]  [思源黑体 ▼]  [自定义_______]            │  │
│  │  正文字体  [Inter ▼]      [思源宋体 ▼]  [自定义_______]            │  │
│  │  等宽字体  [JetBrains Mono ▼]  [Fira Code ▼]  [自定义___]         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ 间距配置 ────────────────────────────────────────────────────────┐  │
│  │  基础间距   [━━●━━━━━━]  8px  (4px - 16px)                        │  │
│  │  内容宽度   [━━━━━●━━━━━]  720px (600px - 1200px)                 │  │
│  │  内容内距   [━━━━●━━━━━━]  24px (16px - 48px)                     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ 圆角配置 ────────────────────────────────────────────────────────┐  │
│  │  小圆角     [━━●━━━━━━]  4px  (0px - 12px)  按钮/徽章              │  │
│  │  中圆角     [━━━●━━━━━]  8px  (0px - 24px)  卡片/模块              │  │
│  │  大圆角     [━━━━●━━━━]  16px (0px - 32px)  弹窗/模态框            │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ 高级 CSS ────────────────────────────────────────────────────────┐  │
│  │  [编辑自定义 CSS]  →  打开代码编辑器                               │  │
│  │  :root {                                                           │  │
│  │    --custom-bg: #fafafa;                                          │  │
│  │    .article-content p { line-height: 1.8; }                       │  │
│  │  }                                                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ 实时预览 ────────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │  你的博客 - 实时预览 (配置变更后自动刷新)                    │   │  │
│  │  │  [这是一个按钮示例]  [这是次要按钮]                          │   │  │
│  │  │  文章标题示例                                                │   │  │
│  │  │  这里是正文内容预览... (应用当前所有配置)                     │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3 插件系统详解

#### 4.3.1 插件接口定义 (TypeScript)

```typescript
// server/core/plugin/types.ts

/** 插件类型 */
export type PluginType =
  | 'comment'     // 评论
  | 'analytics'   // 统计
  | 'search'      // 搜索
  | 'social'      // 社交
  | 'ad'          // 广告
  | 'feature'     // 功能
  | 'custom'      // 自定义

/** 挂载点 (MVP 阶段 6 个高频位置，暂缓的挂载点见 docs/decisions/A002) */
export type MountPoint =
  | 'head-end'
  | 'header-end'
  | 'sidebar'
  | 'post-end'
  | 'footer-start'
  | 'body-end'

/** 配置字段类型 */
export type ConfigFieldType =
  | 'string' | 'number' | 'boolean'
  | 'select' | 'multi-select'
  | 'code' | 'textarea' | 'color' | 'image'

/** 配置字段定义 */
export interface ConfigField {
  type: ConfigFieldType
  label: string
  description?: string
  required?: boolean
  default?: any
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  language?: string
  validator?: (value: any) => boolean
}

/** 配置 Schema */
export type ConfigSchema = Record<string, ConfigField>

/** 插件元信息 */
export interface PluginMeta {
  name: string
  label: string
  type: PluginType
  version: string
  author?: string
  description?: string
  icon?: string
}

/** 服务端路由定义 */
export interface ServerRoute {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  handler: (event: any) => Promise<any>
}

/** Vue 组件加载器 (SSR 兼容) */
export type AsyncComponentLoader = () => Promise<{ default: any }>

/** 插件适配器接口 — 核心接口 (简化版) */
export interface PluginAdapter {
  /** 元信息 */
  meta: PluginMeta
  /** 配置表单 Schema (后台自动生成配置界面) */
  configSchema: ConfigSchema
  /** 挂载到哪个位置 */
  mountPoints: MountPoint[]
  /** 渲染方式: Vue 组件 (SSR 安全) */
  component?: AsyncComponentLoader
  /** 渲染方式: DOM 操作 (纯客户端，用 <ClientOnly> 包裹) */
  onMount?(container: HTMLElement, config: Record<string, any>): void
}

/** 插件适配器扩展接口 (可选，按需实现) */
export interface PluginAdapterExtended extends PluginAdapter {
  /** 插件初始化 (加载外部 SDK 等) */
  onInit?(config: Record<string, any>): Promise<void>
  /** 插件卸载清理 */
  onUnmount?(): void
  /** 配置变更回调 */
  onConfigChange?(newConfig: Record<string, any>, oldConfig: Record<string, any>): void
  /** 自定义服务端 API 路由 */
  serverRoutes?: ServerRoute[]
  /** 依赖的其他插件 */
  dependencies?: string[]
  /** 冲突的插件 */
  conflicts?: string[]
}
```

#### 4.3.2 插件管理器

```typescript
// server/core/plugin/manager.ts

import type { PluginAdapter, PluginAdapterExtended, MountPoint, PluginType } from './types'

/** 类型守卫: 判断插件是否实现了扩展接口 */
function isExtended(plugin: PluginAdapter): plugin is PluginAdapterExtended {
  return 'onInit' in plugin || 'onUnmount' in plugin || 'onConfigChange' in plugin
    || 'serverRoutes' in plugin || 'dependencies' in plugin || 'conflicts' in plugin
}

export class PluginManager {
  private plugins = new Map<string, PluginAdapter>()
  private enabledPlugins = new Set<string>()
  private configs = new Map<string, Record<string, any>>()

  /** 注册插件 */
  register(plugin: PluginAdapter): void {
    if (this.plugins.has(plugin.meta.name)) {
      console.warn(`Plugin "${plugin.meta.name}" already registered`)
      return
    }
    this.plugins.set(plugin.meta.name, plugin)
  }

  /** 启用插件 */
  async enable(pluginName: string, config: Record<string, any>): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) throw new Error(`Plugin "${pluginName}" not found`)

    // 检查依赖和冲突 (仅扩展接口)
    if (isExtended(plugin)) {
      this.checkDependencies(plugin)
      this.checkConflicts(plugin)
    }

    // 验证配置
    this.validateConfig(plugin.configSchema, config)

    // 初始化 (仅扩展接口)
    if (isExtended(plugin) && plugin.onInit) {
      await plugin.onInit(config)
    }

    this.enabledPlugins.add(pluginName)
    this.configs.set(pluginName, config)
  }

  /** 禁用插件 */
  async disable(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) throw new Error(`Plugin "${pluginName}" not found`)

    if (isExtended(plugin) && plugin.onUnmount) plugin.onUnmount()

    this.enabledPlugins.delete(pluginName)
    this.configs.delete(pluginName)
  }

  /** 获取已启用的插件 */
  getEnabled(type?: PluginType): PluginAdapter[] {
    return Array.from(this.enabledPlugins)
      .map(name => this.plugins.get(name)!)
      .filter(Boolean)
      .filter(p => !type || p.meta.type === type)
  }

  /** 获取支持指定挂载点的插件 */
  getPluginsForMountPoint(mountPoint: MountPoint): PluginAdapter[] {
    return this.getEnabled().filter(p => p.mountPoints.includes(mountPoint))
  }

  /** 获取插件配置 */
  getConfig(pluginName: string): Record<string, any> | undefined {
    return this.configs.get(pluginName)
  }

  /** 更新插件配置 */
  async updateConfig(pluginName: string, newConfig: Record<string, any>): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) throw new Error(`Plugin "${pluginName}" not found`)

    const oldConfig = this.configs.get(pluginName) ?? {}
    this.validateConfig(plugin.configSchema, newConfig)

    if (isExtended(plugin) && plugin.onConfigChange) {
      plugin.onConfigChange(newConfig, oldConfig)
    }

    this.configs.set(pluginName, newConfig)
  }

  private checkDependencies(plugin: PluginAdapterExtended): void {
    for (const dep of plugin.dependencies ?? []) {
      if (!this.enabledPlugins.has(dep)) {
        throw new Error(`Plugin "${plugin.meta.name}" requires "${dep}" to be enabled first`)
      }
    }
  }

  private checkConflicts(plugin: PluginAdapterExtended): void {
    for (const conflict of plugin.conflicts ?? []) {
      if (this.enabledPlugins.has(conflict)) {
        throw new Error(`Plugin "${plugin.meta.name}" conflicts with "${conflict}"`)
      }
    }
  }

  private validateConfig(schema: Record<string, any>, config: Record<string, any>): void {
    for (const [key, field] of Object.entries(schema) as [string, any][]) {
      if (field.required && !(key in config)) {
        throw new Error(`Missing required config: ${key}`)
      }
      if (field.validator && key in config && !field.validator(config[key])) {
        throw new Error(`Invalid config value: ${key}`)
      }
    }
  }
}

export const pluginManager = new PluginManager()
```

#### 4.3.3 插件开发示例

**Vue 组件方式 (SSR 安全，适用于评论等需要 SEO 的插件)**:

```typescript
// packages/plugins/twikoo/src/index.ts
import type { PluginAdapter } from '@my-blog/server/core/plugin/types'

export default {
  meta: {
    name: 'twikoo',
    label: 'Twikoo 评论',
    type: 'comment',
    version: '1.6.0',
    author: 'imaegoo',
    description: '轻量、简洁、优雅的评论系统',
  },

  configSchema: {
    envId: {
      type: 'string',
      label: '环境 ID',
      description: 'Twikoo 云开发环境 ID 或自建服务地址',
      required: true,
    },
    region: {
      type: 'string',
      label: '区域',
      description: '腾讯云区域，自建服务可不填',
    },
  },

  mountPoints: ['post-end'],

  // SSR 兼容: 提供 Vue 组件
  component: () => import('./TwikooComment.vue'),

  // 客户端初始化 (加载 SDK)
  async onInit(config) {
    if (typeof window !== 'undefined' && !(window as any).twikoo) {
      await loadScript('https://cdn.jsdelivr.net/npm/twikoo/dist/twikoo.all.min.js')
    }
  },

  onMount(container, config) {
    container.innerHTML = '<div id="twikoo-container"></div>'
    ;(window as any).twikoo?.init({
      envId: config.envId,
      el: '#twikoo-container',
      region: config.region,
    })
  },

  onUnmount() {
    ;(window as any).twikoo?.destroy?.()
  },
} satisfies PluginAdapterExtended  // 使用扩展接口，因为有 onInit/onUnmount
```

```vue
<!-- packages/plugins/twikoo/src/TwikooComment.vue -->
<script setup lang="ts">
const props = defineProps<{
  config: Record<string, any>
  postId: string
}>()

const commentRef = ref<HTMLElement>()

onMounted(async () => {
  if (!(window as any).twikoo) {
    await loadScript('https://cdn.jsdelivr.net/npm/twikoo/dist/twikoo.all.min.js')
  }
  ;(window as any).twikoo.init({
    envId: props.config.envId,
    el: commentRef.value,
    path: props.postId,
  })
})
</script>

<template>
  <div ref="commentRef" class="twikoo-comment" />
</template>
```

**脚本注入方式 (纯客户端，适用于统计等)**:

```typescript
// packages/plugins/google-analytics/src/index.ts
import type { PluginAdapter } from '@my-blog/server/core/plugin/types'

export default {
  meta: {
    name: 'google-analytics',
    label: 'Google Analytics',
    type: 'analytics',
    version: '1.0.0',
  },

  configSchema: {
    measurementId: {
      type: 'string',
      label: 'Measurement ID',
      placeholder: 'G-XXXXXXXXXX',
      required: true,
    },
  },

  mountPoints: ['head-end'],

  async onInit(config) {
    if (typeof window === 'undefined') return

    // 加载 gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) { window.dataLayer.push(args) }
    gtag('js', new Date())
    gtag('config', config.measurementId)
  },
} satisfies PluginAdapterExtended  // 使用扩展接口，因为有 onInit
```

---

### 4.4 文章管理系统

#### 4.4.1 双编辑器支持

**可视化编辑器 (TipTap)**:
- 所见即所得
- 支持富文本格式、图片拖拽上传
- 支持 Markdown 快捷键
- 支持自定义扩展

**Markdown 编辑器 (Vditor)**:
- 支持即时渲染
- 支持三种模式切换 (编辑/预览/源码)
- 支持大纲导航、代码高亮、流程图

#### 4.4.2 编辑器切换

```
┌─────────────────────────────────────────────────────────────────┐
│  文章编辑器                                     [保存] [发布]    │
├─────────────────────────────────────────────────────────────────┤
│  标题：[我的第一篇博客文章___________________________]            │
│                                                                  │
│  ┌────────────┬──────────────────────────────────────────────┐  │
│  │            │  ┌────────────────────────────────────────┐  │  │
│  │  文章      │  │  B  I  U  💡 📷  🔗  ⋮   [👁] [✏️] [💻]│  │  │
│  │  分类      │  ├────────────────────────────────────────┤  │  │
│  │  标签      │  │                                        │  │  │
│  │  设置      │  │  今天开始搭建我的新博客！                │  │  │
│  │            │  │                                        │  │  │
│  │  [切换     │  │  技术栈选择：                          │  │  │
│  │   可视化]  │  │  - Nuxt 3 for SSR                      │  │  │
│  │            │  │  - UnoCSS for styling                  │  │  │
│  │            │  │                                        │  │  │
│  │            │  │  [图片拖拽上传区域]                    │  │  │
│  │            │  └────────────────────────────────────────┘  │  │
│  └────────────┴──────────────────────────────────────────────┘  │
│                                                                  │
│  状态：草稿    最后保存：刚刚                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.5 数据库设计

#### 4.5.1 设计原则

- **统一主键**: 所有表使用 `integer` 自增主键（简单、高效、无歧义）
- **软删除**: 核心内容表（posts）使用 `deletedAt` 字段，删除可恢复
- **时间戳**: 所有表包含 `createdAt` 和 `updatedAt`
- **外键约束**: 使用 `ON DELETE CASCADE` 保证数据一致性

#### 4.5.2 统一 API 响应格式

```typescript
// 所有 API 路由统一使用以下响应格式

// 成功响应
interface ApiResponse<T> {
  code: 0
  data: T
  message?: string
}

// 分页响应
interface ApiPaginatedResponse<T> {
  code: 0
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// 错误响应
interface ApiError {
  code: number        // 业务错误码 (1001, 1002, ...)
  message: string     // 用户友好的错误信息
  details?: any       // 开发调试信息 (仅 dev 环境)
}

// 错误码规范
// 0     - 成功
// 1xxx  - 认证/授权错误 (1001 未登录, 1002 无权限, 1003 token过期)
// 2xxx  - 参数/验证错误 (2001 参数缺失, 2002 参数格式错误)
// 3xxx  - 业务逻辑错误 (3001 文章不存在, 3002 分类名重复)
// 9xxx  - 系统错误 (9001 服务器内部错误, 9002 数据库错误)
```

#### 4.5.3 存储适配层

```typescript
// server/storage/adapter.ts

/** 存储适配器接口 */
export interface StorageAdapter {
  /** 上传文件 */
  upload(file: Buffer, storagePath: string, mimeType: string): Promise<string>

  /** 删除文件 */
  delete(storagePath: string): Promise<void>

  /** 获取文件 URL */
  getUrl(storagePath: string): string

  /** 检查文件是否存在 */
  exists(storagePath: string): Promise<boolean>
}

/** 存储配置 */
export interface StorageConfig {
  type: 'local' | 'oss' | 'cos' | 's3'
  basePath: string          // 本地路径或 bucket 名称
  baseUrl: string           // 访问基础 URL
  cdnUrl?: string           // CDN 加速 URL (可选)
  // 对象存储专用
  accessKeyId?: string
  accessKeySecret?: string
  region?: string
  endpoint?: string
}
```

```typescript
// server/storage/local.adapter.ts

import { writeFile, unlink, access } from 'fs/promises'
import { join } from 'path'
import type { StorageAdapter, StorageConfig } from './adapter'

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private config: StorageConfig) {}

  async upload(file: Buffer, storagePath: string): Promise<string> {
    const fullPath = join(this.config.basePath, storagePath)
    await writeFile(fullPath, file)
    return this.getUrl(storagePath)
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = join(this.config.basePath, storagePath)
    await unlink(fullPath)
  }

  getUrl(storagePath: string): string {
    const cdn = this.config.cdnUrl || this.config.baseUrl
    return `${cdn}/${storagePath}`
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await access(join(this.config.basePath, storagePath))
      return true
    } catch {
      return false
    }
  }
}
```

```typescript
// server/storage/index.ts

import type { StorageAdapter, StorageConfig } from './adapter'
import { LocalStorageAdapter } from './local.adapter'

export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  switch (config.type) {
    case 'local':
      return new LocalStorageAdapter(config)
    // case 'oss': return new OssStorageAdapter(config)
    // case 's3':  return new S3StorageAdapter(config)
    default:
      throw new Error(`Unsupported storage type: ${config.type}`)
  }
}
```

#### 4.5.4 缓存策略

```typescript
// server/services/cache.service.ts

import { LRUCache } from 'lru-cache'

/** 缓存 TTL 配置 (秒) */
const CACHE_TTL = {
  articleList: 5 * 60,        // 文章列表 5 分钟
  articleDetail: 10 * 60,     // 文章详情 10 分钟
  categoryList: 10 * 60,      // 分类列表 10 分钟
  tagList: 10 * 60,           // 标签列表 10 分钟
  themeConfig: 60 * 60,       // 主题配置 1 小时
  pluginConfig: 60 * 60,      // 插件配置 1 小时
  systemSettings: 60 * 60,    // 系统设置 1 小时
} as const

export class CacheService {
  private cache = new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 5, // 默认 5 分钟
  })

  get<T>(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, { ttl: ttl ? ttl * 1000 : undefined })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  /** 按前缀清除缓存 */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  /** 清除所有缓存 */
  clear(): void {
    this.cache.clear()
  }
}

export const cache = new CacheService()

// 使用示例:
// const articles = await cache.getOrSet('articles:list:1', async () => {
//   return db.select().from(posts).where(eq(posts.status, 'published'))
// }, CACHE_TTL.articleList)
```

#### 4.5.5 完整 Schema 定义

```typescript
// server/db/schema/index.ts

import { sqliteTable, text, integer, real, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ==================== 文章相关 ====================

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  status: text('status', { enum: ['draft', 'published', 'scheduled'] }).default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  isTop: integer('is_top', { mode: 'boolean' }).default(false),
  allowComment: integer('allow_comment', { mode: 'boolean' }).default(true),
  password: text('password'),
  authorId: integer('author_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),  // 软删除
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references((): any => categories.id),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  color: text('color').default('#3B82F6'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const postCategories = sqliteTable(
  'post_categories',
  {
    postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.categoryId] }),
  })
)

export const postTags = sqliteTable(
  'post_tags',
  {
    postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
)

// ==================== 用户相关 ====================
// 注: 评论功能优先使用第三方插件 (Twikoo/Waline/Disqus)，评论数据存在第三方后端。
// 如需自建内置评论系统，comments 表定义见下方"可选扩展表"章节。

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  displayName: text('display_name'),
  avatar: text('avatar'),
  bio: text('bio'),
  role: text('role', { enum: ['admin', 'editor', 'author'] }).default('author'),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ==================== 媒体相关 ====================

export const media = sqliteTable('media', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  filename: text('filename').notNull(),
  originalName: text('original_name'),
  title: text('title'),
  alt: text('alt'),
  caption: text('caption'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  extension: text('extension').notNull(),
  storageType: text('storage_type', { enum: ['local', 'oss', 'cos', 's3'] }).default('local'),
  storagePath: text('storage_path').notNull(),
  url: text('url').notNull(),
  cdnUrl: text('cdn_url'),
  width: integer('width'),
  height: integer('height'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ==================== 设置相关 (合并表) ====================

// 主题配置
export const themeSettings = sqliteTable('theme_settings', {
  id: integer('id').primaryKey(),
  themeName: text('theme_name').notNull().unique(),
  config: text('config', { mode: 'json' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// 插件配置
export const pluginSettings = sqliteTable('plugin_settings', {
  id: integer('id').primaryKey(),
  pluginName: text('plugin_name').notNull().unique(),
  config: text('config', { mode: 'json' }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).default(false),
  version: text('version'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// 系统设置 (key-value 合并表)
// category 支持的值: 'site' | 'seo' | 'style' | 'email' | 'reading' | 'social'
export const systemSettings = sqliteTable('system_settings', {
  id: integer('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }).notNull(),
  category: text('category'),  // site, seo, style, email, reading, social
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ==================== 认证相关 ====================

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ==================== 关系定义 ====================

export const postsRelations = relations(posts, ({ many, one }) => ({
  categories: many(postCategories),
  tags: many(postTags),
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}))

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  posts: many(postCategories),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}))

```

#### 4.5.6 可选扩展表 (按需添加)

以下表在核心功能稳定后按需添加，不在 MVP 范围内：

| 表名 | 用途 | 添加时机 |
|------|------|---------|
| `post_revisions` | 文章版本历史 | 需要版本回退时 |
| `series` + `post_series` | 文章系列 | 需要系列文章功能时 |
| `post_views` | 每日浏览统计 | 需要详细统计时 |
| `post_likes` | 文章点赞 | 需要互动功能时 |
| `seo_redirects` | SEO 重定向 | 需要 URL 迁移时 |
| `comments` | 内置评论系统 | 第三方插件无法满足，需完全自建评论时 |
| `notifications` | 通知系统 | 需要消息通知时 |
| `database_backups` | 备份记录 | 需要自动备份时 |

**comments 表 Schema (仅自建评论系统时需要)**:

```typescript
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references((): any => comments.id),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email'),
  authorUrl: text('author_url'),
  authorIp: text('author_ip'),
  content: text('content').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'spam'] }).default('pending'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})
```

> **建议**: 评论功能优先使用第三方插件 (Twikoo/Waline/Disqus/utterances)，数据存储在第三方后端，无需自建表。仅当第三方方案无法满足需求时才考虑自建。

---

### 4.6 安全设计

#### 4.6.1 认证方案

```
JWT 认证流程:

1. 登录: POST /api/auth/login
   ├── 验证用户名/密码
   ├── 生成 JWT (有效期 7 天)
   └── 返回 token + 用户信息

2. 请求: 带 Authorization: Bearer <token>
   ├── auth 中间件验证 token
   ├── 解析 userId 注入 event.context
   └── 路由处理

3. 刷新: 自动续期
   ├── token 剩余 < 1 天时自动刷新
   └── 返回新 token

4. 登出: POST /api/auth/logout
   └── 清除客户端 token
```

#### 4.6.2 安全措施

| 风险 | 措施 |
|------|------|
| **XSS** | 所有用户输入转义；富文本使用白名单过滤 |
| **CSPOST** | API 使用 JWT 认证，不依赖 Cookie |
| **SQL 注入** | Drizzle ORM 参数化查询，禁止拼接 SQL |
| **文件上传** | 限制文件类型/大小；重命名文件；校验 MIME |
| **暴力破解** | 登录接口 rate limiting (5次/分钟) |
| **敏感信息** | .env 管理密钥；日志脱敏 |

---

## 五、核心特性详解

### 5.1 强扩展性

| 能力               | 说明                               | 实现方式            |
| ------------------ | ---------------------------------- | ------------------- |
| **第三方评论集成** | Twikoo, Waline, Disqus, utterances | 插件适配器模式      |
| **统计分析**       | Google Analytics, 百度统计，Umami  | head-script 挂载点  |
| **搜索服务**       | Algolia, MeiliSearch, 本地搜索     | 插件 API + 前端组件 |
| **社交功能**       | 分享按钮，Follow 按钮              | post-end 挂载点     |
| **广告嵌入**       | Google AdSense, 自定义广告         | 多位置挂载点        |
| **自定义代码**     | 任意 JS 代码/组件                  | custom-script 插件  |
| **自研模块**       | 完全自定义功能                     | 完整插件 SDK        |

### 5.2 可变性 (热切换)

| 变更类型   | 生效方式               | 是否需要重启 |
| ---------- | ---------------------- | ------------ |
| 切换主题   | 后台选择 → 即时生效    | 否           |
| 修改颜色   | 配置器调整 → 实时预览  | 否           |
| 修改字体   | 配置器调整 → 实时预览  | 否           |
| 修改间距   | 配置器调整 → 实时预览  | 否           |
| 自定义 CSS | 编辑器保存 → 即时生效  | 否           |
| 上传新主题 | 上传 → 启用 → 即时生效 | 否           |
| 启用插件   | 后台启用 → 配置 → 生效 | 否           |
| 禁用插件   | 后台禁用 → 立即移除    | 否           |

### 5.3 解耦性

```
解耦层次:

应用层解耦
├── 前台 SSR (/)  ← routeRules 控制渲染模式
└── 后台 SPA (/admin/*)

服务层解耦
├── API 路由层     ← 只做请求解析和响应
├── 服务层         ← 独立业务逻辑
└── 数据访问层     ← Drizzle ORM

核心系统解耦
├── 插件系统       ← 通过挂载点交互，无直接依赖
├── 主题系统       ← 独立目录，互不影响
└── 钩子系统       ← 事件驱动，松耦合

数据层解耦
├── 每个表独立 Schema
└── 关系通过 relations 定义，非硬编码
```

### 5.4 高自定义性

```
自定义能力金字塔 (从简单到复杂):

Level 1: 预设主题切换
  操作：后台选择主题 → 启用
  技术要求：无

Level 2: 可视化样式配置
  操作：后台配置面板调整颜色/字体/间距
  技术要求：无

Level 3: 自定义 CSS
  操作：后台 CSS 编辑器编写样式
  技术要求：CSS 基础

Level 4: 主题开发
  操作：创建主题目录 → 编写 layout.vue + config.json + styles.css
  技术要求：Vue + CSS

Level 5: 插件开发
  操作：使用插件 SDK 开发完整功能
  技术要求：Vue + TS + Node.js

Level 6: 核心定制
  操作：修改 server/core 源代码
  技术要求：完整技术栈
```

### 5.5 高性能

| 层级       | 优化措施                     | 预期效果            |
| ---------- | ---------------------------- | ------------------- |
| **网络层** | Nginx 静态资源缓存 + Gzip    | 减少 70% 传输量     |
| **渲染层** | Nuxt 3 SSR 首屏直出          | FCP < 1s            |
| **资源层** | 图片懒加载 + WebP 格式       | 减少 50% 图片体积   |
| **代码层** | Vite 按需加载 + Tree Shaking | 减少 40% JS 体积    |
| **数据层** | SQLite WAL 模式 + 索引优化   | 查询速度提升 10 倍  |
| **缓存层** | LRU 内存缓存热点数据         | 减少 80% 数据库查询 |

**性能指标目标**:

| 指标                               | 目标值  |
| ---------------------------------- | ------- |
| **FCP (First Contentful Paint)**   | < 1.0s  |
| **LCP (Largest Contentful Paint)** | < 2.5s  |
| **TTI (Time to Interactive)**      | < 3.5s  |
| **CLS (Cumulative Layout Shift)**  | < 0.1   |
| **TTFB (Time to First Byte)**      | < 200ms |
| **API 响应时间 (P95)**             | < 100ms |

---

## 六、预期效果

### 6.1 前台博客效果

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] 首页    文章    分类    标签    关于    [搜索🔍]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│            欢迎来到我的博客                                      │
│            分享技术与生活                                        │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  文章封面        │  │  文章封面        │  │  文章封面        │  │
│  │  文章标题一      │  │  文章标题二      │  │  文章标题三      │  │
│  │  2026-04-30     │  │  2026-04-29     │  │  2026-04-28     │  │
│  │  #Vue3  #Nuxt   │  │  #TypeScript    │  │  #插件系统       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│          [← 上一页]   1 / 5   [下一页 →]                          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  关于博主    最新评论    标签云    [评论插件]  [统计插件]         │
│  © 2026 My Blog. Powered by Nuxt 3.                            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 后台管理效果

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] 博客管理                               [用户▼] [退出]    │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  📊 仪表盘│  文章管理 / 所有文章                                 │
│          │                                                       │
│  📝 文章  │  [+ 新建文章]  [批量操作▼]    [搜索文章_______]     │
│    所有   │                                                       │
│    草稿   │  ┌────────────────────────────────────────────────┐ │
│    已发布 │  │ ☐ │ 标题    │ 分类  │ 标签  │ 日期      │ 状态 │ │
│          │  ├────────────────────────────────────────────────┤ │
│  📁 分类  │  │ ☐ │ 文章一   │ 技术  │ Vue   │ 04-30  │ ✅   │ │
│          │  │ ☐ │ 文章二   │ 生活  │ 随笔  │ 04-29  │ ✅   │ │
│  🏷️ 标签  │  │ ☐ │ 文章三   │ 技术  │ TS    │ 04-28  │ 📝   │ │
│          │  └────────────────────────────────────────────────┘ │
│  🖼️ 媒体库 │                                                       │
│          │                                                       │
│  🎨 主题   │                                                       │
│  🎨 样式   │                                                       │
│  🔌 插件   │                                                       │
│  ⚙️ 设置   │                                                       │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

### 6.3 用户体验

**内容创作者**:
```
写文章: 登录后台 → 新建文章 → 输入标题和内容 → 选择分类/标签 → 发布
全程可视化，无需命令行，无需重建，发布后立即可见。
```

**开发者**:
```
开发主题: 复制 themes/minimal → 修改 layout.vue/styles.css → 后台预览 → 启用
开发插件: packages/plugins/my-plugin/ → 开发 → 构建 → 后台上传 → 启用
```

**读者**:
```
访问博客: 打开链接 → 首屏立即显示 (SSR) → 快速浏览 → 流畅阅读
```

---

## 七、开发计划

### 7.1 阶段划分

| 阶段         | 名称       | 内容                                    | 交付物                | 预计时间 |
| ------------ | ---------- | --------------------------------------- | --------------------- | -------- |
| **Phase 1**  | 脚手架搭建 | pnpm workspace、Nuxt 3 配置、基础目录   | 可运行的空项目        | 3-5 天   |
| **Phase 2**  | 数据库层   | Schema 定义、Drizzle ORM、迁移脚本      | server/db             | 3-5 天   |
| **Phase 3**  | API 层     | 统一响应格式、文章/分类/标签 CRUD       | server/api + services | 5-7 天   |
| **Phase 4**  | 认证系统   | JWT 认证、用户管理、权限中间件          | auth 完整流程         | 3-5 天   |
| **Phase 5**  | 后台管理   | 文章管理、分类/标签、媒体库、基础 UI    | pages/admin           | 7-10 天  |
| **Phase 6**  | 前台博客   | 首页、文章列表/详情、分类/标签页        | pages (前台)          | 5-7 天   |
| **Phase 7**  | 主题系统   | 主题加载、Layout 切换、CSS Variables    | server/core/theme     | 5-7 天   |
| **Phase 8**  | 样式配置   | 后台样式配置面板、实时预览              | pages/admin/styles    | 3-5 天   |
| **Phase 9**  | 插件系统   | 插件管理器、挂载点、官方插件            | server/core/plugin    | 7-10 天  |
| **Phase 10** | 双编辑器   | TipTap + Vditor 集成                    | 完整编辑体验          | 3-5 天   |
| **Phase 11** | 测试部署   | 单元测试、Docker 配置、部署文档         | 可交付产品            | 5-7 天   |

**总预计时间**: 8-12 周 (单人开发)

### 7.2 实施顺序说明

```
Phase 1-4: 基础设施 (脚手架 → 数据库 → API → 认证)
   ↓
Phase 5-6: 核心功能 (后台管理 + 前台博客 → 可用的博客系统)
   ↓
Phase 7-8: 主题样式 (主题切换 + 样式配置 → 可定制的博客)
   ↓
Phase 9-10: 扩展功能 (插件系统 + 编辑器 → 完整功能)
   ↓
Phase 11: 收尾 (测试 + 部署 → 可交付)
```

### 7.3 下一步行动

1. ✅ 确认架构方案 — 已完成
2. ⏳ 创建 Git 仓库 — 待进行
3. ⏳ Phase 1: 搭建 Monorepo 脚手架 — 待进行

---

## 八、风险与应对

| 风险               | 可能性 | 影响 | 应对措施                                   |
| ------------------ | ------ | ---- | ------------------------------------------ |
| **技术选型过新**   | 中     | 中   | Nuxt 3 已成熟；备选 Next.js               |
| **插件系统复杂**   | 高     | 中   | 分阶段实现，先核心后扩展；充分测试         |
| **性能问题**       | 低     | 高   | SSR + 缓存 + 图片优化；性能监控            |
| **单数据库瓶颈**   | 低     | 中   | SQLite 够用；可迁移 MySQL/PostgreSQL       |
| **开发周期长**     | 中     | 中   | MVP 优先，分阶段交付                       |
| **安全问题**       | 中     | 高   | JWT 认证、输入验证、参数化查询；安全审计   |
| **主题 Layout 限制** | 中   | 中   | 预注册主题；不支持完全运行时加载 .vue     |

---

## 九、总结

### 9.1 核心优势

| 优势         | 描述                                | 竞品对比               |
| ------------ | ----------------------------------- | ---------------------- |
| **极度解耦** | 主题/样式/模块完全独立，可分别替换  | WordPress 主题插件耦合 |
| **通用适配** | 插件适配系统支持任意第三方/自研功能 | Hexo 插件需改代码      |
| **后台统一** | 所有内容/样式/模块通过后台管理      | 静态博客无后台         |
| **首屏性能** | SSR 渲染，FCP < 1s                  | WordPress 首屏慢       |
| **双编辑器** | 可视化 + Markdown 自由切换          | 单一编辑器             |
| **自部署**   | 完全可控，数据自己掌握              | SaaS 平台锁定          |
| **易扩展**   | 6 个挂载点 + 可扩展，支持任意位置注入 | 固定模板结构           |
| **热切换**   | 主题/样式/插件即改即生效            | 需重建部署             |
| **SSR 兼容** | 插件系统支持 SSR 预渲染             | 多数博客插件纯客户端   |

### 9.2 架构设计原则

1. **职责清晰** — API 路由层只做请求解析，业务逻辑在 Service 层，数据访问在 DB 层
2. **统一契约** — API 响应格式统一、存储接口统一、错误码统一
3. **SSR 优先** — 插件和组件设计优先考虑 SSR 兼容，纯客户端功能用 `<ClientOnly>` 包裹
4. **软删除** — 核心内容表支持软删除，数据安全可恢复
5. **按需扩展** — 核心表精简，扩展表按需添加，避免过度设计

### 9.3 适用场景

| 场景         | 适合度 | 理由               |
| ------------ | ------ | ------------------ |
| **个人博客** | ★★★★★ | 完全匹配需求       |
| **技术博客** | ★★★★★ | 代码高亮、MD 支持  |
| **企业官网** | ★★★★  | 可定制，但需多语言 |
| **内容平台** | ★★★   | 需多用户/权限扩展  |
| **文档站点** | ★★★★  | 主题适配后可用     |

### 9.4 不适用场景

| 场景           | 原因            | 建议方案              |
| -------------- | --------------- | --------------------- |
| **超大型网站** | SQLite 可能瓶颈 | WordPress + MySQL     |
| **纯电商**     | 缺少电商功能    | Shopify / WooCommerce |
| **论坛社区**   | 缺少论坛功能    | Discourse / Flarum    |
| **纯静态托管** | 需要服务器      | GitHub Pages + Hexo   |

---

**文档版本**: v2.1
**最后更新**: 2026-04-30
**决策记录**: [docs/decisions/](decisions/)
**下一步**: 创建 Git 仓库，开始 Phase 1 脚手架搭建

---

**END**
