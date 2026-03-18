---
phase: 3
plan: 03
subsystem: database
tags:
  - schema
  - drizzle-orm
  - sqlite
  - posts
  - tags
dependency_graph:
  requires:
    - phase: 3
      plan: 01
      name: Database Package Setup
    - phase: 3
      plan: 02
      name: User and Category Schema
  provides:
    - Posts schema with full fields
    - Tags schema with extended fields
    - PostTags junction table
  affects:
    - users.ts (added posts relation)
    - categories.ts (added posts relation)
    - schema/index.ts (exports)
tech-stack:
  added:
    - drizzle-orm schema definitions
    - SQLite indexes
patterns:
  - Composite primary key for junction tables
  - Cascade delete for foreign keys
  - Many-to-many relations through junction table
key-files:
  created:
    - packages/database/src/schema/posts.ts
    - packages/database/src/schema/tags.ts
    - packages/database/src/schema/post_tags.ts
    - packages/database/src/__tests__/schema/posts.test.ts
    - packages/database/src/__tests__/schema/tags.test.ts
    - packages/database/src/__tests__/schema/post_tags.test.ts
    - packages/database/drizzle/0001_whole_stick.sql
  modified:
    - packages/database/src/schema/index.ts
    - packages/database/src/schema/users.ts
    - packages/database/src/schema/categories.ts
    - packages/database/drizzle/meta/_journal.json
decisions:
  - 'Status flow: draft → reviewing → published → archived (4 states)'
  - 'Foreign key on posts.author_id: ON DELETE CASCADE'
  - 'Foreign key on posts.category_id: ON DELETE SET NULL'
  - 'Composite primary key on post_tags: (post_id, tag_id)'
  - 'Extended fields on tags: description, color (optional for frontend)'
metrics:
  duration: TBD
  completed: 2026-03-18
  tests_added: 8
  tests_total: 19
---

# Phase 3 Plan 03: Posts and Tags Schema Summary

**One-liner:** Posts and Tags schema with full fields, many-to-many relations through post_tags junction table, cascade delete foreign keys, and performance indexes.

## Overview

This plan implemented the database schema for blog posts, tags, and their many-to-many relationship using Drizzle ORM with SQLite.

## Tasks Completed

### Task 1: Create Posts Schema (DB-04)

**File:** `packages/database/src/schema/posts.ts`

Created the posts table with:

- Core fields: id, title, slug, content, excerpt
- SEO fields: coverImage, seoTitle, seoDescription
- Status enum: draft, reviewing, published, archived
- Foreign keys: authorId (CASCADE delete), categoryId (SET NULL)
- Statistics: viewCount, likeCount
- Timestamps: publishedAt, createdAt, updatedAt
- Indexes: slug, author_id, status, category_id, created_at

### Task 2: Create Tags Schema (DB-06)

**File:** `packages/database/src/schema/tags.ts`

Created the tags table with:

- Core fields: id, name, slug (unique)
- Extended fields: description, color
- Timestamps: createdAt, updatedAt
- Index: slug

### Task 3: Create PostTags Schema (DB-07)

**File:** `packages/database/src/schema/post_tags.ts`

Created the junction table with:

- Composite primary key: (post_id, tag_id)
- Foreign keys: postId (CASCADE), tagId (CASCADE)
- Timestamp: createdAt
- Indexes: post_id, tag_id

### Task 4: Update Schema Index

**File:** `packages/database/src/schema/index.ts`

Updated exports to include:

- posts, tags, postTags schemas
- Updated schema object with all tables

### Task 5: Create Unit Tests

**Files:**

- `packages/database/src/__tests__/schema/posts.test.ts` (4 tests)
- `packages/database/src/__tests__/schema/tags.test.ts` (2 tests)
- `packages/database/src/__tests__/schema/post_tags.test.ts` (2 tests)

All tests verify field existence and constraint structure.

### Task 6: Generate Migration

**File:** `packages/database/drizzle/0001_whole_stick.sql`

Generated migration with 5 tables:

- users (13 columns, 4 indexes, 2 FKs)
- categories (7 columns, 3 indexes, 1 FK)
- posts (16 columns, 6 indexes, 2 FKs)
- tags (7 columns, 2 indexes, 0 FKs)
- post_tags (3 columns, 2 indexes, 2 FKs)

## Verification Results

```
pnpm type-check: ✓ Passed
pnpm test: ✓ 19 tests passed (100%)
```

## Commits

| Hash    | Message                                                            |
| ------- | ------------------------------------------------------------------ |
| 5f2f8d1 | feat(phase3-plan3): update schema relations and generate migration |
| a68e377 | test(phase3-plan3): add posts, tags, and post_tags schema tests    |
| 4627c24 | feat(phase3-plan3): add posts, tags, and post_tags schema          |

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

1. **Status flow**: draft → reviewing → published → archived (4 states for content workflow)
2. **Author cascade delete**: When a user is deleted, their posts are also deleted (CASCADE)
3. **Category set null**: When a category is deleted, posts become uncategorized (SET NULL)
4. **Composite primary key**: post_tags uses (post_id, tag_id) as composite PK
5. **Extended tag fields**: description and color fields for frontend customization

## Next Steps

- Plan 03-04: Media Schema
- Plan 03-05: Database Migration and Testing
