# My Blog System

## What This Is

一个现代化的个人博客系统，支持 SSR 渲染、插件化扩展和主题热切换。面向博客作者和技术爱好者，提供流畅的内容创作和分享体验。

## Core Value

用户可以专注于内容创作，同时享受灵活的博客定制能力和简洁高效的管理体验。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 博客系统基础框架搭建（Monorepo 架构）
- [ ] 数据库层设计（SQLite + Drizzle ORM）
- [ ] API 层实现（Nitro Server）
- [ ] 后台管理系统（文章管理、媒体库）
- [ ] 前台博客页面（首页、列表、详情页）
- [ ] 插件系统（16 个挂载点）
- [ ] 主题系统（CSS Variables + JSON 配置）
- [ ] 双编辑器集成（TipTap + Vditor）

### Out of Scope

- [ ] 移动端 App — 优先 Web，后续考虑 PWA
- [ ] 多语言国际化 — v1 仅支持中文
- [ ] 付费订阅功能 — 基础博客功能优先

## Context

- **技术栈**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **后端**: Nitro API + Drizzle ORM + SQLite
- **架构**: 模块化单体（Monorepo + pnpm workspace）
- **部署**: Docker 一键部署
- **核心特性**: 插件系统、主题热切换、双编辑器支持

## Constraints

- **Tech stack**: Nuxt 3 生态 — 团队熟悉 Vue 技术栈
- **Timeline**: 无硬性截止日期，按质量优先推进
- **Database**: SQLite — 轻量级、零配置、易备份
- **Performance**: 首屏加载 < 2s，支持 SEO

## Key Decisions

| Decision       | Rationale                                        | Outcome   |
| -------------- | ------------------------------------------------ | --------- |
| 模块化单体架构 | 平衡开发效率和可维护性，避免过度微服务化         | — Pending |
| pnpm workspace | 优于 npm/yarn 的 monorepo 方案，依赖提升节省空间 | — Pending |
| Drizzle ORM    | 类型安全、轻量、SQL-like 查询                    | — Pending |
| Tailwind CSS   | 原子化 CSS，快速开发，主题定制友好               | — Pending |
| Nitro Server   | Nuxt 3 内置，零配置 API 路由                     | — Pending |

---

_Last updated: 2026-03-16 after project initialization_
