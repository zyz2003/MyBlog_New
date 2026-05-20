# Phase 1: Architecture Refactoring - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase is a recovery phase for the existing half-migrated settings and theme architecture.
It does not add new user-facing capabilities. It only reduces split configuration paths and
stabilizes the real runtime model for:

- frontend site settings consumption
- admin settings page load/save behavior
- theme configuration save/read/injection flow

Out of scope for this phase:

- navbar/footer/archive implementation
- search/comments
- post experience enhancements
- broad admin field completion beyond what is required to stabilize settings flow

</domain>

<decisions>
## Implementation Decisions

### Frontend Settings Consumption
- **D-01:** Frontend pages and components must use `useSiteSettings()` as the single configuration read path.
- **D-02:** Frontend code must stop calling `/api/settings` directly from pages or blog components. Existing exceptions such as the homepage page and `BannerGroup.vue` must be migrated in this phase.

### Admin Settings Consolidation
- **D-03:** This phase will migrate **2-3 key admin settings pages**, not all settings pages.
- **D-04:** The first migration target is the homepage settings page. After that, planning should choose 1-2 additional high-value pages from the most duplicated settings pages, likely `general` and/or `display`.
- **D-05:** The goal is to establish a repeatable `useAdminSettings()` pattern, not to finish every admin settings page in one pass.

### Theme Domain Ownership
- **D-06:** Theme configuration belongs to the **theme domain**, not the generic settings domain.
- **D-07:** `/api/themes/*` is the only developer-facing primary entry point for theme save/read flows.
- **D-08:** If `system_settings.themeConfig` remains, it is compatibility or mirror data only and must not be treated as the primary mental model for theme persistence.

### Settings Read Semantics
- **D-09:** This phase must do more than replace duplicated code with hooks; it must also improve the semantics of settings retrieval.
- **D-10:** `useAdminSettings(category)` should move toward a model where its reads better reflect the category it claims to manage, instead of permanently remaining a full-store fetch wrapper with local flattening.
- **D-11:** This phase should not fully redesign the entire settings API, but it should reduce the mismatch between the hook abstraction and the actual retrieval behavior.

### the agent's Discretion
- Prioritize the smallest set of changes that collapse duplicate paths without broad API churn.
- If one additional admin settings page must be chosen after `homepage.vue`, prefer the page with the highest duplication and widest downstream reuse.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope And Recovery Baseline
- `.planning/PROJECT.md` - current recovered project baseline and phase framing
- `.planning/REQUIREMENTS.md` - reset requirements for recovery and phase 1
- `.planning/ROADMAP.md` - current recovery-first roadmap
- `docs/project-vision.md` - project vision, architecture pain points, config mapping, and target system behavior

### Settings And Theme Runtime
- `apps/site/composables/frontend/useSiteSettings.ts` - current frontend settings read hook
- `apps/site/composables/admin/useAdminSettings.ts` - current admin settings load/save hook
- `apps/site/pages/index.vue` - current homepage direct `/api/settings` consumer that must be migrated
- `apps/site/components/blog/BannerGroup.vue` - secondary direct `/api/settings` frontend consumer that must be migrated
- `apps/site/pages/admin/homepage.vue` - largest remaining manual settings page
- `apps/site/pages/admin/sidebar.vue` - current migrated example using `useAdminSettings()`
- `apps/site/pages/admin/themes.vue` - theme admin page and current theme-domain entry point
- `apps/site/server/api/themes/[name]/config.post.ts` - canonical theme config save endpoint
- `apps/site/server/core/theme/manager.ts` - source of truth for theme save behavior and CSS generation
- `apps/site/server/api/themes/active.css.get.ts` - runtime theme CSS output endpoint
- `apps/site/layouts/frontend/default.vue` - current frontend layout that injects active theme CSS

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useSiteSettings()` - already exists and is already adopted by several blog components, so it should be extended rather than replaced.
- `useAdminSettings()` - already exists and can serve as the base abstraction for admin settings page migration.
- `ThemeManager.saveConfig()` - already provides a central theme save path and should remain the core theme persistence mechanism.
- `sidebar.vue` - already demonstrates one migrated admin settings page using `useAdminSettings()`.

### Established Patterns
- Settings pages commonly flatten `GET /api/settings` results into a local `Record<string, unknown>`, then batch-save via `PUT /api/settings`.
- Theme runtime styling is already applied through `/api/themes/active.css` in the frontend layout.
- Theme saving and generic settings saving are currently both present, which creates a split mental model that this phase must collapse.

### Integration Points
- Frontend homepage migration touches `index.vue` and any child components still independently fetching settings.
- Admin settings consolidation should anchor on `homepage.vue`, then copy the same pattern into 1-2 additional high-value settings pages.
- Theme validation must connect admin save -> theme API -> `ThemeManager.saveConfig()` -> active CSS endpoint -> frontend layout consumption.

</code_context>

<specifics>
## Specific Ideas

- Recovery should be treated as a structural cleanup phase, not a feature phase.
- The most valuable immediate result is reducing the number of active configuration read/write paths, even if a full settings API redesign is deferred.

</specifics>

<deferred>
## Deferred Ideas

- Full migration of every admin settings page
- Any Phase 2 frontend shell work
- Any Phase 3 search/comments/post enhancement work
- Broad settings API redesign beyond what is required to reduce abstraction mismatch in this phase

</deferred>

---

*Phase: 1-Architecture Refactoring*
*Context gathered: 2026-05-18*
