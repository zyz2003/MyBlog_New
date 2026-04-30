# Project State: 个人博客系统

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-30)

**Core value:** 方便的内容管理 + 灵活的样式/插件系统 + 自部署可控
**Current focus:** Phase 9 — 前台博客

## Current Phase

**Phase:** 8 — 后台完整管理
**Status:** Complete
**Next action:** `/gsd-plan-phase 9`

## Progress

| Milestone | Phases | Status |
|-----------|--------|--------|
| M1: 基础框架 | 1-6 | Complete (6/6) |
| M2: 核心功能 | 7-10 | In progress (2/4) |
| M3: 扩展功能 | 11 | Not started |

## Session Continuity

**Last session:** 2026-04-30 — Phase 8 admin complete management done
**Resume point:** `/gsd-plan-phase 9`

## Key Decisions Log

| Date | Decision | Phase |
|------|----------|-------|
| 2026-04-30 | UnoCSS 替代 Tailwind | Pre-project |
| 2026-04-30 | 6 个挂载点 (精简自 19) | Pre-project |
| 2026-04-30 | 插件接口 5 核心字段 | Pre-project |
| 2026-04-30 | SSR+SPA 混合渲染 | Pre-project |
| 2026-04-30 | 移除 packages/core | Pre-project |
| 2026-04-30 | 评论用第三方插件 | Pre-project |
| 2026-04-30 | Vditor 单编辑器 | Pre-project |
| 2026-04-30 | @unocss/nuxt 替代 @nuxtjs/unocss (正确包名) | Phase 1 |
| 2026-04-30 | better-sqlite3 v11.6.0 (预编译 Windows 二进制) | Phase 2 |
| 2026-04-30 | jose 替代 jsonwebtoken (无原生依赖) | Phase 3 |
| 2026-04-30 | bcryptjs 替代 bcrypt (纯 JS) | Phase 3 |
| 2026-04-30 | 种子脚本放 apps/site/scripts/ (pnpm 隔离) | Phase 3 |
| 2026-04-30 | pinia + @pinia/nuxt 用于插件状态管理 | Phase 4 |
| 2026-04-30 | Nitro server plugin 自动注册插件 | Phase 4 |
| 2026-04-30 | RawThemeJson 接口处理 config.json 组合结构 | Phase 5 |
| 2026-04-30 | 路径遍历保护 (正则验证主题目录名) | Phase 5 |

## Phase 1 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** FOUND-01~05 all verified
**Key files:** pnpm-workspace.yaml, package.json, tsconfig.json, apps/site/nuxt.config.ts, apps/site/uno.config.ts, apps/site/app.vue

## Phase 2 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** DB-01~05 all verified
**Key files:** apps/site/server/db/schema/ (6 files), apps/site/server/db/connection.ts, apps/site/server/db/migrate.ts, apps/site/server/utils/db.ts, apps/site/drizzle.config.ts, apps/site/database/blog.sqlite

## Phase 3 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** AUTH-01~05 all verified
**Key files:** apps/site/server/services/auth.ts, apps/site/server/utils/response.ts, apps/site/server/api/auth/login.post.ts, apps/site/server/api/auth/logout.post.ts, apps/site/server/api/auth/refresh.post.ts, apps/site/server/middleware/auth.ts, apps/site/scripts/seed.ts

## Phase 4 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** CORE-01~04 all built
**Key files:** apps/site/server/core/plugin/types.ts, manager.ts, index.ts, apps/site/components/plugins/PluginMount.vue, PluginRenderer.vue, MountPoint*.vue, apps/site/server/api/plugins/, apps/site/stores/plugin.ts, apps/site/composables/usePlugin.ts
**Note:** Test plugin registration verified at API level. Plugin system infrastructure complete.

## Phase 5 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** CORE-05~08 all built
**Key files:** apps/site/server/core/theme/types.ts, manager.ts, index.ts, apps/site/server/core/hooks/event-emitter.ts, index.ts, themes/default/ (config.json, layout.vue, styles.css), apps/site/server/plugins/register-themes.ts, apps/site/server/api/themes/, apps/site/stores/theme.ts, apps/site/composables/useTheme.ts
**Note:** Theme system infrastructure complete. ThemeManager discovers themes, generates CSS Variables, persists to DB. useTheme composable injects CSS into document.head for real-time switching.

## Phase 6 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** API-02~05, API-08~12, STOR-01~03, CACHE-01 all built
**Key files:**
- Services: article.service.ts, category.service.ts, tag.service.ts, media.service.ts, settings.service.ts, cache.service.ts
- Storage: adapter.ts, local.adapter.ts, index.ts
- API routes: articles/ (5), categories/ (5), tags/ (4), media/ (3), settings/ (3), search.get.ts
- Middleware: error-handler.ts, log.ts, rate-limit.ts, utils/error-handler.ts
**Note:** All CRUD APIs, storage adapter, media upload, settings, search, caching, and middleware chain complete.

## Phase 7 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** ADMIN-01~05 all built
**Key files:**
- Auth: stores/auth.ts, composables/useAuth.ts, middleware/admin-auth.ts
- Layout: layouts/admin.vue, layouts/auth.vue, components/admin/common/Sidebar.vue, Navbar.vue, Breadcrumb.vue
- Pages: pages/admin/login.vue, pages/admin/index.vue, pages/admin/articles/index.vue, new.vue, [id].vue
- Editor: components/admin/articles/ArticleEditor.vue, CategorySelector.vue, TagInput.vue
- API: composables/useAdminApi.ts
**Note:** Admin shell complete — login/auth flow, sidebar navigation, dashboard with stats, article list with search/filter/pagination, article editor with Vditor Markdown.

## Phase 8 Summary

**Status:** Complete
**Plans:** 3/3 complete
**Requirements:** ADMIN-06~12 all built
**Key files:**
- Categories: pages/admin/categories.vue, components/admin/categories/CategoryTree.vue, CategoryForm.vue
- Tags: pages/admin/tags.vue, components/admin/tags/TagTable.vue, TagForm.vue
- Media: pages/admin/media.vue, components/admin/media/MediaGallery.vue, MediaUploader.vue
- Themes: pages/admin/themes.vue, components/admin/themes/ThemeCard.vue
- Plugins: pages/admin/plugins.vue, components/admin/plugins/PluginCard.vue
- Settings: pages/admin/settings.vue, components/admin/settings/SettingsForm.vue
**Note:** All admin management pages complete. Categories tree CRUD, tags with colors, media upload/gallery, theme activation, plugin enable/disable with config, settings with 4 tabs, user menu logout.

---
*Last updated: 2026-04-30 after Phase 8 completion — M2 Admin Complete DONE*
