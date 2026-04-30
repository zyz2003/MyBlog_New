---
phase: 05-theme
plan: 02
subsystem: core
tags: [theme-manager, default-theme, nitro-plugin, css-variables]
dependencies:
  requires: [05-01]
  provides: [ThemeManager, themeManager, default-theme, register-themes-plugin]
  affects: [05-03]
tech_stack:
  added: []
  patterns: [singleton manager, DB persistence, Nitro plugin, CSS Variables generation]
key_files:
  created:
    - apps/site/server/core/theme/manager.ts
    - apps/site/server/plugins/register-themes.ts
    - themes/default/config.json
    - themes/default/layout.vue
    - themes/default/styles.css
  modified:
    - apps/site/server/core/theme/index.ts
decisions:
  - "Used RawThemeJson interface to handle config.json shape (meta + config fields combined)"
  - "Path traversal protection via alphanumeric validation on theme directory names"
metrics:
  duration: ~8m
  completed: 2026-04-30
  tasks_completed: 2
  tasks_total: 2
---

# Phase 5 Plan 02: ThemeManager + Default Theme Summary

ThemeManager singleton for theme lifecycle management and default theme assets.

## Tasks Completed

### Task 1: Create ThemeManager class
- Created `apps/site/server/core/theme/manager.ts` with full ThemeManager implementation
- scanThemes() discovers themes from themes/ directory with path traversal protection
- loadTheme() loads and caches theme configs from disk
- activate() persists active theme to DB and dispatches hook events
- getActive()/getActiveCSS() for retrieving active theme and CSS Variables
- loadFromDb() loads active theme on startup, falls back to 'default'
- validateConfig() checks required fields (colors, fonts, spacing, borderRadius, layout)
- generateCSS() produces :root CSS Variables from ThemeConfig
- Updated barrel export to include ThemeManager and themeManager

### Task 2: Create default theme + Nitro registration plugin
- Created `themes/default/config.json` with complete theme configuration
- Created `themes/default/layout.vue` with header, main content, sidebar, footer sections
- Created `themes/default/styles.css` with CSS Variables and article/button utility classes
- Created `apps/site/server/plugins/register-themes.ts` Nitro plugin for auto-registration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type narrowing issue**
- **Found during:** Task 1
- **Issue:** `validateConfig` type guard narrowed `parsed` to `ThemeConfig`, stripping meta fields (name, version, author)
- **Fix:** Changed to `boolean` return type, added `RawThemeJson` interface, added `extractMeta`/`extractConfig` helper methods
- **Files modified:** `apps/site/server/core/theme/manager.ts`

**2. [Rule 1 - Bug] Fixed variable naming conflict**
- **Found during:** Task 1
- **Issue:** `const raw` used for both `fs.readFileSync` result and `parsed as RawThemeJson` cast
- **Fix:** Renamed file reading variable to `fileContent`
- **Files modified:** `apps/site/server/core/theme/manager.ts`

## Verification

- TypeScript compilation (`tsc --noEmit`) passes without errors
- config.json is valid JSON with all required fields
- layout.vue and styles.css exist in themes/default/
- register-themes.ts Nitro plugin exists
- ThemeManager has all required methods

## Key Decisions

- Used `RawThemeJson` interface to handle the combined meta+config shape of config.json files
- Path traversal protection via `/^[a-zA-Z0-9_-]+$/` regex on theme directory names

## Commits

- `cb6a660`: feat(05-02): create ThemeManager and default theme
