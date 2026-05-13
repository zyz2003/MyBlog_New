# Phase 1: Architecture Refactoring - Discussion Log

**Date:** 2026-05-13
**Mode:** Default (interactive, Claude discretion)

## Gray Areas Presented

1. **配置统一策略** — How to merge system_settings and theme_settings
2. **Composables API** — What shape should useSiteSettings/useAdminSettings return
3. **CSS 注入方式** — How to deliver theme CSS to frontend
4. **布局链+样式统一** — Layout chain fix + scoped @apply replacement

## Decisions Summary

All areas: User delegated to Claude ("你自行决定").

| Area | Decision | Rationale |
|------|----------|-----------|
| Config Unification | Keep two tables, sync writes | Different purposes (K-V vs theme), backward compatible |
| Composables API | useSiteSettings returns typed reactive; useAdminSettings scopes by category | Follows existing useTheme pattern with useState + $fetch |
| CSS Injection | New `/api/themes/active.css` + `<link>` | Browser caching, no FOUC, reuses existing CSSVariablesMap |
| Layout Chain | admin.vue add layout, children remove | Minimal change, corrects Nuxt layout inheritance |
| Style Unification | Direct UnoCSS replacement | No over-engineering, visual verification sufficient |
| Data Integrity | db.transaction() + Zod schemas co-located with service | Industry standard, minimal boilerplate |

## Deferred Ideas

- Settings cache layer → Phase 5 or v2.1
- CSRF protection → only if switching from Bearer to cookie auth
- Rate limiting audit → may already be covered

## Claude Notes

- `useTheme.ts` already demonstrates the `useState + $fetch` pattern that `useSiteSettings` should follow
- ThemeManager.getActiveCSS() already exists and works — just needs to be exposed via API endpoint
- admin.vue layout fix is a one-line change + bulk remove from child pages
