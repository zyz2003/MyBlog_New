# Phase 1: Architecture Refactoring - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the project's architectural foundation: unify the dual configuration system, establish composables layer to eliminate code duplication, create theme CSS injection channel, fix admin layout nesting, unify styling approach, and add data integrity guarantees (transactions + validation).

This phase produces ZERO user-visible features. All work is internal plumbing that enables later UI work.
</domain>

<decisions>
## Implementation Decisions

### Configuration Unification
- **D-01:** Keep two DB tables (system_settings + theme_settings) — they serve different purposes (K-V settings vs theme configs)
- **D-02:** ThemeCustomizer must sync writes to both tables: `system_settings.themeConfig` key AND `theme_settings` via ThemeManager
- **D-03:** Add `ThemeManager.saveConfig()` method that accepts theme config and handles dual-write atomically
- **D-04:** ThemeManager no longer scans file system for theme discovery — config is purely DB-driven. File system only used for theme overrides (.vue, .css files)

### Composables API Design
- **D-05:** `useSiteSettings()` — returns `{ settings: Ref<SiteSettings>, loading: Ref<boolean>, refresh(): Promise<void> }`. Fetches `/api/settings` once, shared via `useState` across SSR/client. All fields are typed via inferred TypeScript from the settings schema
- **D-06:** `useAdminSettings(category: string)` — returns `{ settings: Ref<Record<string, any>>, loading: Ref<boolean>, save(values): Promise<void>, refresh(): Promise<void> }`. Encapsulates the fetch/save pattern duplicated across 11 pages. Category parameter scopes to one admin page's settings group
- **D-07:** Both composables live in `apps/site/composables/admin/` and `apps/site/composables/frontend/` respectively

### Theme CSS Injection
- **D-08:** Add `GET /api/themes/active.css` endpoint returning `text/css; charset=utf-8`
- **D-09:** Frontend layout injects via `<link rel="stylesheet" href="/api/themes/active.css">` — benefits from browser caching, no FOUC
- **D-10:** Endpoint reads theme config from `theme_settings` table (post-unification), calls `CSSVariablesMap(config)` to generate CSS

### Layout Chain Fix
- **D-11:** `pages/admin.vue` adds `definePageMeta({ layout: 'admin-default' })`
- **D-12:** All child admin pages (homepage, seo, sidebar, general, etc.) remove their `definePageMeta({ layout: 'admin-default' })` declarations — they inherit from the parent
- **D-13:** This eliminates the double scrollbar issue (frontend default wrapping admin-default)

### Styling Unification
- **D-14:** Replace all scoped `<style>` blocks using `@apply` with inline UnoCSS utility classes directly in templates
- **D-15:** No lint rules or tooling added — simple search-and-replace, verified by visual inspection

### Data Integrity
- **D-16:** `SettingsService.batchUpdate()` wraps the loop in `db.transaction()` — commits atomically or rolls back entirely
- **D-17:** Zod schemas defined in `server/services/settings.schema.ts`, co-located with settings service. Each setting key gets a typed schema definition
- **D-18:** `SettingsService.upsert()` validates value against Zod schema before write, returns typed result

### Claude's Discretion
- Exact file organization for composables (directory structure)
- Zod schema structure (one schema per key vs. grouped schemas)
- CSS generation caching strategy in the active.css endpoint
- Whether to add `definePageMeta` type-hints in admin.vue
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — 36 requirements for v2.0, ARCH-01~06 & DATA-01~02 are in this phase
- `.planning/ROADMAP.md` §Phase 1 — Success criteria for architecture refactoring

### Project Context
- `docs/project-vision.md` §已知问题与重构计划(一) — Detailed analysis of the dual config system, composables gap, CSS injection gap, and layout chain problem
- `docs/architecture.md` — Technical architecture, data flow, and directory structure

### Code Reference (AnZhiYu)
- `docs/anzhiyu-reference/hexo-theme-anzhiyu/_config.yml` — The 1343-line AnZhiYu config to be 100% mapped by admin pages
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useTheme.ts` (composables/) — Already uses `useState` + `$fetch` pattern. `useSiteSettings` can follow the same structure
- `ThemeManager.getActiveCSS()` — Generates `:root { ... }` CSS string from ThemeConfig. The new `/api/themes/active.css` endpoint calls this directly
- `CSSVariablesMap()` — Already maps ThemeConfig → CSS variable key-value pairs. No need to rewrite

### Established Patterns
- `useState()` for SSR-safe shared state (already used in useTheme, should be used in useSiteSettings)
- `$fetch()` for API calls (already used across composables and pages)
- Drizzle ORM with `onConflictDoUpdate` for upserts (used in SettingsService.upsert)

### Integration Points
- `layouts/frontend/default.vue` `<head>` section — Add `<link rel="stylesheet">` to load theme CSS
- `layouts/admin/default.vue` — Already has correct admin layout structure (flex h-screen + sidebar + main)
- `pages/admin.vue` — Missing layout declaration, needs `definePageMeta({ layout: 'admin-default' })`
- `server/api/themes/` — Existing theme API directory, add `active.css.get.ts` here
- `server/services/settings.service.ts` — Modify `batchUpdate()` to use transaction, `upsert()` to validate with Zod
- `server/core/theme/manager.ts` — Modify to stop scanning file system for config, accept DB-pushed config
</code_context>

<specifics>
## Specific Ideas

- ThemeCustomizer in admin saves → calls unified API → writes both tables → frontend sees change immediately via `/api/themes/active.css`
- useSiteSettings() should feel like "just destructure and use" — no manual fetch calls in any page or component
- useAdminSettings() should reduce each admin page's settings handling from ~50 lines to ~5 lines
</specifics>

<deferred>
## Deferred Ideas

- Settings cache layer (Nitro memory cache) — Phase 5 or v2.1
- CSRF protection — Only relevant if switching from Bearer token to cookie auth
- Rate limiting audit — Existing middleware may already cover this
</deferred>

---
*Phase: 01-architecture-refactoring*
*Context gathered: 2026-05-13*
