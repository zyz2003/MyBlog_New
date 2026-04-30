---
phase: 07-admin-posts
plan: 01
subsystem: admin
tags: [auth, layout, sidebar, login, middleware]
key_files:
  created:
    - apps/site/stores/auth.ts
    - apps/site/composables/useAuth.ts
    - apps/site/middleware/admin-auth.ts
    - apps/site/components/admin/common/Sidebar.vue
    - apps/site/components/admin/common/Navbar.vue
    - apps/site/components/admin/common/Breadcrumb.vue
    - apps/site/layouts/admin.vue
    - apps/site/layouts/auth.vue
    - apps/site/pages/admin/login.vue
    - apps/site/pages/admin.vue
  modified: []
decisions:
  - "Layouts in layouts/ directory (Nuxt standard), not components/layouts/"
  - "User info persisted in localStorage for page refresh survival"
  - "Parent pages/admin.vue applies middleware only, child pages specify their own layout"
metrics:
  duration: ~15min
  completed: "2026-04-30T12:45:00Z"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 7 Plan 01: Admin Layout + Auth Summary

JWT auth composable with localStorage persistence, Pinia auth store, admin layout with collapsible sidebar (8 nav links), navbar with user dropdown, dynamic breadcrumbs, and login page with form validation.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Auth composable + Pinia store + middleware | 00015f8 | stores/auth.ts, composables/useAuth.ts, middleware/admin-auth.ts |
| 2 | Admin layout components + login page | ef7080d | layouts/admin.vue, layouts/auth.vue, pages/admin/login.vue, Sidebar/Navbar/Breadcrumb |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] User info persistence on page refresh**
- **Found during:** Task 1
- **Issue:** The refresh endpoint only returns a new token, not user info. On page refresh, user info would be lost.
- **Fix:** Store user info in localStorage alongside token during login. Restore from localStorage on initAuth().
- **Files modified:** composables/useAuth.ts
- **Commit:** 00015f8

**2. [Rule 1 - Bug] Layout system approach**
- **Found during:** Task 2
- **Issue:** Plan specified `components/layouts/` but Nuxt 3 auto-discovers layouts from `layouts/` directory only.
- **Fix:** Used standard `layouts/` directory for admin.vue and auth.vue layouts. Parent `pages/admin.vue` applies middleware only (no layout), child pages specify their own layout via `definePageMeta`.
- **Files modified:** layouts/admin.vue, layouts/auth.vue, pages/admin.vue
- **Commit:** ef7080d

## Known Stubs

None — all components are wired to real auth APIs.

## Pre-existing Issues

- Type error in `apps/site/server/services/article.service.ts` line 165: `string` not assignable to `'draft' | 'published' | 'scheduled'`. This is a pre-existing issue from Phase 6, not caused by this plan.

## Self-Check: PASSED

- All 10 created files exist
- Both commits (00015f8, ef7080d) verified in git log
- No new type errors introduced
