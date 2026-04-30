---
phase: 05-theme
plan: 03
subsystem: api
tags: [api-routes, pinia, composable, css-injection]
dependencies:
  requires: [05-02]
  provides: [theme-api-routes, useThemeStore, useTheme]
  affects: []
tech_stack:
  added: []
  patterns: [REST API, Pinia store, composable, CSS Variables injection]
key_files:
  created:
    - apps/site/server/api/themes/index.get.ts
    - apps/site/server/api/themes/active.get.ts
    - apps/site/server/api/themes/[name]/activate.post.ts
    - apps/site/stores/theme.ts
    - apps/site/composables/useTheme.ts
  modified: []
decisions: []
metrics:
  duration: ~5m
  completed: 2026-04-30
  tasks_completed: 2
  tasks_total: 2
---

# Phase 5 Plan 03: Theme API + Store + Composable Summary

Theme API routes, Pinia store, and useTheme composable with CSS Variables client-side injection.

## Tasks Completed

### Task 1: Create theme API routes
- GET /api/themes (auth-protected) — returns all themes with metadata and active status
- GET /api/themes/active (public) — returns active theme config and CSS Variables
- POST /api/themes/:name/activate (auth-protected) — switches active theme
- All routes follow existing plugin API patterns

### Task 2: Create theme Pinia store and useTheme composable
- Pinia store with fetchThemes/fetchActiveTheme/activateTheme actions
- useTheme composable with CSS Variables injection into document.head
- Style element with id `theme-css-variables` for deduplication
- Auto-loads active theme on first client-side use
- switchTheme() provides one-step theme switching with CSS update
- SSR-safe: CSS injection is client-only

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript compilation (`tsc --noEmit`) passes without errors
- All 5 files created successfully
- API routes follow existing plugin API patterns
- Pinia store follows existing plugin store pattern
- Composable follows existing usePlugin pattern with added CSS injection

## Key Decisions

None - followed existing patterns from plugin system.

## Commits

- `9ccc331`: feat(05-03): create theme API routes, store, and composable
