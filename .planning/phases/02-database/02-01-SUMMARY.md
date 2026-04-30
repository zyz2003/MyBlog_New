---
phase: 02-database
plan: 02-01
subsystem: database
tags: [drizzle, sqlite, schema, orm]
depends_on: []
provides: [schema-definitions, drizzle-config]
affects: [02-02, 02-03, api-layer, services]
tech_stack:
  added: [drizzle-orm, better-sqlite3, drizzle-kit, @types/better-sqlite3]
  patterns: [sqlite-table, relations, composite-primary-key, foreign-key-cascade]
key_files:
  created:
    - apps/site/drizzle.config.ts
    - apps/site/server/db/schema/posts.ts
    - apps/site/server/db/schema/users.ts
    - apps/site/server/db/schema/media.ts
    - apps/site/server/db/schema/settings.ts
    - apps/site/server/db/schema/sessions.ts
    - apps/site/server/db/schema/index.ts
  modified:
    - apps/site/package.json
    - .gitignore
decisions:
  - "Integer auto-increment PKs without explicit autoIncrement (SQLite default)"
  - "Cascade delete on junction tables (postCategories, postTags) and sessions only"
  - "Categories self-reference uses no cascade (manual tree management)"
  - "JSON fields use text mode: json for Drizzle serialization"
metrics:
  duration: ~5m
  completed: "2026-04-30"
  tasks: 2
  files: 8
---

# Phase 2 Plan 01: Dependencies + Schema Definitions Summary

Drizzle ORM with 11 SQLite table schemas across 6 domain-organized files.

## Tasks Completed

### Task 1: Install dependencies and configure drizzle-kit
- Installed `drizzle-orm` (v0.45.2) and `better-sqlite3` (v12.9.0) as runtime dependencies
- Installed `drizzle-kit` (v0.31.10) and `@types/better-sqlite3` (v7.6.13) as dev dependencies
- Created `apps/site/drizzle.config.ts` pointing to `./server/db/schema` and `./server/db/migrations`
- Updated `.gitignore` to exclude `*.sqlite`, `*.sqlite-wal`, `*.sqlite-shm`, `database/`

### Task 2: Create all 11 table schemas with relations
- **posts.ts** (92 lines): posts, categories, tags, postCategories, postTags + 3 relation definitions
- **users.ts** (16 lines): users table with role (admin/editor/author) and status (active/inactive) enums
- **media.ts** (22 lines): media table with storage type (local/oss/cos/s3) enum
- **settings.ts** (28 lines): themeSettings, pluginSettings, systemSettings tables with JSON columns
- **sessions.ts** (12 lines): sessions table with cascade delete to users
- **index.ts** (16 lines): re-exports all 11 tables and 3 relation definitions
- Removed `.gitkeep` from `apps/site/server/db/`

## Schema Design

| Table | PK | Timestamps | Special |
|-------|-----|------------|---------|
| posts | integer | createdAt, updatedAt | deletedAt (soft delete) |
| categories | integer | createdAt | parentId (self-ref, no cascade) |
| tags | integer | createdAt | - |
| post_categories | composite (postId, categoryId) | - | cascade delete both FKs |
| post_tags | composite (postId, tagId) | - | cascade delete both FKs |
| users | integer | createdAt, updatedAt | role/status enums |
| media | integer | createdAt | FK to users, storageType enum |
| theme_settings | integer | createdAt, updatedAt | JSON config |
| plugin_settings | integer | updatedAt | JSON config |
| system_settings | integer | updatedAt | JSON value |
| sessions | integer | createdAt | FK to users, cascade delete |

## Relations

- posts -> users (author, many-to-one)
- posts -> categories (via postCategories, many-to-many)
- posts -> tags (via postTags, many-to-many)
- categories -> categories (parent self-reference, one-to-many)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
