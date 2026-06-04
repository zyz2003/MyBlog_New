# Project State

> Last updated: 2026-06-01

## Current Phase

**Phase 01: Hero + Navbar Core Experience** — ✅ COMPLETED

### Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 01 | Hero + Navbar Core Experience | ✅ Completed |
| 02 | Article Page Enhancements | 🔲 Not Started |
| 03 | Sidebar & Widget System | 🔲 Not Started |
| 04 | Footer & Mobile Experience | 🔲 Not Started |
| 05 | Special Effects & Interactions | 🔲 Not Started |
| 06 | Search, Comments & Integrations | 🔲 Not Started |
| 07 | Architecture Refactoring | 🔲 Not Started |

### Phase 01 Completion Summary

| Plan | Description | Status |
|------|-------------|--------|
| 1-1 | Backend Hero config fields + Schema | ✅ Done |
| 1-2 | Full-screen Hero + Parallax + Scroll indicator | ✅ Done |
| 1-3 | Navbar scroll progress + Page name indicator | ✅ Done |

### Files Changed in Phase 01

| File | Change |
|------|--------|
| `server/services/settings.schema.ts` | Added heroFullScreenEnable, heroParallaxEnable, heroScrollIndicatorEnable, homeTopSubTitleSource, homeTopTypedOptions |
| `composables/frontend/site-settings.types.ts` | Added fields to HomepageConfig + defaults |
| `composables/frontend/useSiteSettings.ts` | Mapped new settings keys to homepage computed |
| `pages/admin/homepage.vue` | Added Hero config UI controls (fullscreen toggle, parallax, scroll indicator, subtitle source, typed options) |
| `components/blog/home/HomeTop.vue` | Full-screen mode, parallax background, typed subtitle, scroll-down indicator |
| `components/blog/header/BlogNavbar.vue` | Scroll progress bar, page name indicator, back-to-top with percentage |
| `pages/index.vue` | Pass new hero props to HomeTop |

## Next Phase

**Phase 02: Article Page Enhancements** — Ready to plan

Recommended: Phase 07 (Architecture Refactoring) can run in parallel with Phase 02.

## Blockers

None.
