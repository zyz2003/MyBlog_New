---
phase: 04-api
plan: 08
subsystem: api
tags: drizzle-orm, sqlite, pinyin-pro, shiki, vitest

# Dependency graph
requires:
  - phase: 03-database
    provides: Database schema with posts, tags, categories, users tables
  - phase: 04-api-plan-01
    provides: Unified response format and error utilities
  - phase: 04-api-plan-03
    provides: JWT authentication middleware
provides:
  - Post service with transaction support for CRUD operations
  - Slug generation utility for Chinese titles using pinyin-pro
  - Markdown rendering utility with Shiki syntax highlighting
affects:
  - 04-09: Posts API endpoints will use post.service
  - 04-10: Posts API create/update/delete will use post.service

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service layer pattern with db.transaction for atomic operations
    - TDD approach for service layer testing
    - Utility functions for slug generation and markdown rendering

key-files:
  created: []
  modified:
    - apps/site/server/services/post.service.ts
    - apps/site/tests/server/services/post.service.test.ts

key-decisions:
  - 'Deferred contentHtml caching feature pending schema migration'
  - 'Fixed drizzle-orm update by filtering undefined values'

patterns-established:
  - 'Service layer uses db.transaction for post+tag atomic operations'
  - 'Slug generation uses pinyin-pro for Chinese character conversion'
  - 'Markdown rendering uses Shiki for VS Code-quality highlighting'

requirements-completed:
  - API-02

# Metrics
duration: 15min
completed: 2026-03-22
---

# Phase 04 Plan 08: Post Service + Slug/Markdown Utilities Summary

**Post service with transaction support, Chinese slug generation, and Markdown rendering**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-22T07:00:00Z
- **Completed:** 2026-03-22T07:15:57Z
- **Tasks:** 2 (both completed with bug fix)
- **Files modified:** 2

## Accomplishments

- Post service with createPost, updatePost, deletePost, getPostById, listPosts functions
- All 15 post service tests passing (after bug fix)
- 26 slug utility tests passing (existing implementation)
- 24 markdown utility tests passing (existing implementation)
- Total: 65 tests passing for this plan

## Task Commits

Each task was committed atomically:

1. **Task 1: Create post service** - `0e44ac1` (fix) - Fixed drizzle-orm update bug
2. **Task 2: Create slug and markdown utilities** - No commit needed (files already existed with passing tests)

**Plan metadata:** Pending final commit

_Note: Task 1 had a pre-existing bug that was fixed during execution_

## Files Created/Modified

- `apps/site/server/services/post.service.ts` - Post business logic with transaction support (fixed bug)
- `apps/site/tests/server/services/post.service.test.ts` - 15 tests for post service (updated to reflect schema constraints)
- `apps/site/server/utils/slug.ts` - Chinese to pinyin slug generation (existing, 26 tests pass)
- `apps/site/server/utils/markdown.ts` - Markdown to HTML rendering with Shiki (existing, 24 tests pass)

## Decisions Made

**Deferred contentHtml caching feature:** The plan mentioned "Markdown content can be optionally cached as HTML" but the posts table schema doesn't have a `contentHtml` column. Adding this would require:

1. Schema migration to add the column
2. Database migration file
3. Re-running migrations

This was deferred as a schema change (Rule 4 - architectural) that should be done in a dedicated migration plan rather than as part of service layer implementation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed drizzle-orm update error**

- **Found during:** Task 1 (Post service test execution)
- **Issue:** `updatePost` was spreading `data` object directly into update, including undefined values. Drizzle-orm 0.29.5 throws "Cannot read properties of undefined (reading 'name')" when processing undefined values in update query. Additionally, code was trying to write `contentHtml` field which doesn't exist in schema.
- **Fix:**
  - Explicitly filter and only include defined fields in update data
  - Removed `contentHtml` from create/update operations until schema migration adds the column
- **Files modified:** `apps/site/server/services/post.service.ts`, `apps/site/tests/server/services/post.service.test.ts`
- **Verification:** All 15 post.service tests now passing (was 14/15 failing)
- **Committed in:** `0e44ac1`

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Bug fix was necessary for correctness. contentHtml caching deferred pending schema migration - does not affect core post CRUD functionality.

## Issues Encountered

- Drizzle-orm 0.29.5 has issues with undefined values in update operations - workaround is to explicitly filter fields
- The `contentHtml` field was referenced in code but never added to schema - this is a gap between plan design and schema implementation

## Next Phase Readiness

- Post service is ready for use by API endpoints (04-09, 04-10)
- Slug utility available for any feature needing URL-friendly identifiers
- Markdown utility available for content rendering
- contentHtml caching can be added in future schema migration when performance optimization is needed

---

_Phase: 04-api_
_Completed: 2026-03-22_
