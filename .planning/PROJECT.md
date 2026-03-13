# 个人博客系统

## What This Is

一个基于 Nuxt 3 + Vue 3 + TypeScript 的现代化个人博客系统，提供可视化内容管理、灵活的主题样式系统、通用插件适配系统。通过后台统一管理所有内容、样式和功能模块，支持 SSR 渲染和自部署。

## Core Value

提供一个极度解耦、强扩展性的博客平台，让内容管理变得简单，让功能扩展变得容易。

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### 核心内容管理
- [ ] **CONTENT-01**: 用户可以在后台创建、编辑、删除文章
- [ ] **CONTENT-02**: 支持可视化编辑器和 Markdown 编辑器双模式
- [ ] **CONTENT-03**: 用户可以管理分类和标签
- [ ] **CONTENT-04**: 用户可以管理媒体资源（图片、视频）

#### 主题样式系统
- [ ] **THEME-01**: 用户可以安装、切换、管理主题
- [ ] **THEME-02**: 主题包含布局组件和样式配置
- [ ] **THEME-03**: 支持 CSS Variables 动态换肤
- [ ] **THEME-04**: 样式配置可保存为预设

#### 插件系统
- [ ] **PLUGIN-01**: 提供 16 个标准插件挂载点
- [ ] **PLUGIN-02**: 插件可动态安装、启用、禁用、卸载
- [ ] **PLUGIN-03**: 支持 Twikoo 评论系统等第三方插件适配
- [ ] **PLUGIN-04**: 插件可注册自定义 API 路由

#### 前台博客站点
- [ ] **SITE-01**: SSR 渲染的文章列表页
- [ ] **SITE-02**: SSR 渲染的文章详情页
- [ ] **SITE-03**: 分类页、标签页、归档页
- [ ] **SITE-04**: 搜索功能

#### 后台管理系统
- [ ] **ADMIN-01**: 仪表盘显示统计信息
- [ ] **ADMIN-02**: 文章管理界面
- [ ] **ADMIN-03**: 媒体库管理界面
- [ ] **ADMIN-04**: 主题/样式管理界面
- [ ] **ADMIN-05**: 插件管理界面

#### 用户系统
- [ ] **USER-01**: 管理员登录认证（JWT）
- [ ] **USER-02**: 用户角色权限管理

### Out of Scope

- 移动端原生 App — 优先保证 Web 体验，后续考虑 PWA
- 实时聊天功能 — 高复杂度，不是博客核心需求
- 多租户/SaaS 模式 — 专注于单用户博客场景
- 复杂的电商功能 — 保持博客纯粹性

## Context

### 技术栈
- **前端框架**: Vue 3 + TypeScript
- **SSR 框架**: Nuxt 3
- **样式方案**: Tailwind CSS + CSS Variables
- **后端**: Nitro Server (Nuxt 3 内置)
- **数据库**: SQLite (通过 Drizzle ORM，可迁移 MySQL/PostgreSQL)
- **包管理**: pnpm (Monorepo 架构)

### 项目结构
```
My_blog_new/
├── apps/
│   ├── site/          # 前台博客站点
│   └── admin/         # 后台管理系统
├── packages/
│   ├── core/          # 核心系统（插件/主题/钩子）
│   ├── db/            # 数据库 Schema 和工具
│   └── ui-kit/        # 基础 UI 组件库
├── themes/            # 主题包
├── plugins/           # 插件包
└── docs/              # 文档
```

## Constraints

- **Tech stack**: 必须使用 Vue 3 生态，React 项目在学习中不适用
- **部署方式**: 个人服务器自部署，非 Vercel/Netlify 等 Serverless
- **数据库**: 默认 SQLite，但架构需支持迁移到 MySQL/PostgreSQL
- **性能**: SSR 首屏加载时间 < 2s

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo 架构 | 代码复用、依赖管理、版本同步 | ✓ 待实施 |
| 插件挂载点系统 | 实现极度解耦，支持任意第三方模块 | ✓ 待实施 |
| 主题 = 布局 + 样式 | 主题完全可替换，不影响核心功能 | ✓ 待实施 |
| Nitro API | 无需额外后端，Nuxt 3 内置全功能 API | ✓ 待实施 |
| Drizzle ORM | 类型安全、轻量、支持多数据库 | ✓ 待实施 |

---
*Last updated: 2026-03-13 after 架构文档整理*
