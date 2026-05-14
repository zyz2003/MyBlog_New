# Roadmap: 个人博客系统 v2.0 安知鱼完美复刻

## Overview

This roadmap covers the v2.0 milestone: fixing architectural debt first, then perfectly replicating the AnZhiYu Hexo theme's frontend components and backend configuration. The journey starts with a foundation phase that unifies the configuration system, adds composables, and fixes CSS injection -- because all subsequent UI work depends on these being correct. From there, we build outward: navigation shell, post experience with sidebar, search/comments, and finally backend configuration field completion.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Architecture Refactoring** - Fix the foundation: unified config, composables, CSS injection, layout chain, style system, data integrity
- [ ] **Phase 2: Frontend Core Shell** - Navbar, Footer, existing component audit, Archive page
- [ ] **Phase 3: Frontend Post Experience** - PostHeader, Copyright, AiSummary, Preloader, RightsideButtons, MusicPlayer, RightClickMenu, 5 sidebar widgets
- [ ] **Phase 4: Search & Comments** - SearchWidget, CommentWidget
- [ ] **Phase 5: Backend Configuration Complete** - All 10 admin pages field completion

## Phase Details

### Phase 1: Architecture Refactoring
**Goal**: The codebase has a single source of truth for settings, shared composables for frontend and admin, working CSS injection, correct layout inheritance, and data integrity guarantees
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, DATA-01, DATA-02
**Success Criteria** (what must be TRUE):
  1. Saving settings from ThemeCustomizer writes to both system_settings and theme_settings tables in one operation -- no dual-save workaround needed
  2. Any frontend page can call useSiteSettings() and receive the full site config without manual fetch calls, and the data is consistent between SSR and client hydration
  3. Any admin page can call useAdminSettings() to load and save settings in ~5 lines instead of ~50 lines of repeated fetch/save logic
  4. The frontend layout loads theme CSS from /api/themes/active.css and applies it dynamically -- theme color changes are visible immediately after save
  5. Batch settings updates succeed or fail atomically (no partial writes), and invalid setting values are caught by Zod validation with clear error messages
**Plans**: 6 plans
Plans:
- [ ] 01-01-PLAN.md — Data integrity: transaction-wrapped batch updates + Zod schema validation for settings (DATA-01, DATA-02)
- [ ] 01-02-PLAN.md — Theme config unification: DB-driven ThemeManager with saveConfig() dual-write (ARCH-01)
- [ ] 01-03-PLAN.md — Theme CSS injection: /api/themes/active.css endpoint + frontend layout link (ARCH-04)
- [ ] 01-04-PLAN.md — Composables: useSiteSettings() and useAdminSettings() (ARCH-02, ARCH-03)
- [ ] 01-05-PLAN.md — Layout chain fix (part 1): admin.vue layout inheritance + 14 child page cleanup (ARCH-05)
- [ ] 01-06-PLAN.md — Layout chain fix (part 2) + @apply to UnoCSS: remaining 8 pages + 6 @apply cleanups (ARCH-05, ARCH-06)

### Phase 2: Frontend Core Shell
**Goal**: Visitors see a navigation bar and footer that match the AnZhiYu theme exactly, the archive page works, and all existing components have been audited against the Pug templates
**Depends on**: Phase 1
**Requirements**: FNAV-01, FNAV-02, FNAV-03, FPAGE-01
**Success Criteria** (what must be TRUE):
  1. The top navigation bar shows Logo, menu items, social icons, and dark mode toggle, matching the AnZhiYu header/index.pug layout on both desktop and mobile viewports
  2. The footer displays copyright, badges, social bar, runtime counter, and link lists, matching footer.pug exactly
  3. The archive page displays posts in a timeline layout matching layout/archive.pug, grouped by year/month
  4. All 17 existing frontend components have been reviewed against their Pug template counterparts -- non-conforming components are either rewritten to match or deleted
**Plans**: TBD
**UI hint**: yes

### Phase 3: Frontend Post Experience
**Goal**: Readers experience a complete AnZhiYu-style post page with rich metadata, copyright notice, AI summary, loading animation, sidebar controls, music player, and right-click menu, plus 5 sidebar widgets
**Depends on**: Phase 2
**Requirements**: FPOST-01, FPOST-02, FPOST-03, FPOST-04, FPOST-05, FPOST-06, FPOST-07, FSIDE-01, FSIDE-02, FSIDE-03, FSIDE-04, FSIDE-05
**Success Criteria** (what must be TRUE):
  1. The post page header shows title, date, categories, tags, word count, and reading time, matching post-info.pug
  2. Below each post, a copyright block shows author, permalink, and license, matching post-copyright.pug
  3. An AI summary section appears on posts that have AI-generated summaries, matching ai-info.pug
  4. The page loading animation (fullpage or pace mode) and right-side button group (scroll-to-top, dark toggle, TOC toggle) both function as in the AnZhiYu theme
  5. All 5 sidebar widgets (Announce, Archive, Categories, WeChat, RecentComments) render and display data, matching their respective Pug widget templates
**Plans**: TBD
**UI hint**: yes

### Phase 4: Search & Comments
**Goal**: Visitors can search posts and leave/read comments using the same integrations AnZhiYu supports
**Depends on**: Phase 2
**Requirements**: FPAGE-02, FPAGE-03
**Success Criteria** (what must be TRUE):
  1. The search widget supports local search and (optionally) Algolia, matching third-party/search/ templates
  2. The comment widget supports at least Twikoo and Waline, with UI matching third-party/comments/ templates
**Plans**: TBD
**UI hint**: yes

### Phase 5: Backend Configuration Complete
**Goal**: Every AnZhiYu _config.yml field is available in the admin UI -- no missing configuration options
**Depends on**: Phase 1
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08, ADMIN-09, ADMIN-10
**Success Criteria** (what must be TRUE):
  1. The homepage settings page contains all fields from the _config.yml homepage section (post_meta, cover, category, peoplecanvas, etc.) and saving them persists correctly
  2. The sidebar settings page contains all fields from the _config.yml aside/sidebar section (site_data, menus_items, tags_cloud, display_mode, card_* configs) and saving them persists correctly
  3. All remaining admin pages (SEO, global, post, comment, code, analytics, effects, theme) have their missing fields added and functional -- every _config.yml key that the AnZhiYu theme uses is present in the corresponding admin page
  4. Configuration coverage reaches 100% of the 1343-line _config.yml (no orphaned keys that the theme actually reads)
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Architecture Refactoring | 0/6 | Planned | - |
| 2. Frontend Core Shell | 0/? | Not started | - |
| 3. Frontend Post Experience | 0/? | Not started | - |
| 4. Search & Comments | 0/? | Not started | - |
| 5. Backend Configuration Complete | 0/? | Not started | - |

---
*Roadmap created: 2026-05-13*
*Last updated: 2026-05-14 — Phase 1 split into 6 plans (layout chain split for files_modified limit)*
*Granularity: fine*
*Coverage: 36/36 requirements mapped*
