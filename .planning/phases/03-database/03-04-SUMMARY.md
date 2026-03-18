---
phase: 03
plan: 04
subsystem: database
tags:
  - media-schema
  - seed-data
  - bcryptjs
  - password-hashing
requires:
  - 03-01
  - 03-02
  - 03-03
provides:
  - media-table
  - utility-functions
  - seed-script
  - password-hashing
affects:
  - packages/database
tech-stack:
  added:
    - bcryptjs@2.4.3
    - @types/bcryptjs@2.4.6
  patterns:
    - UUID-based ID generation
    - bcrypt password hashing with salt rounds
    - Seed data script for development
key-files:
  created:
    - packages/database/src/schema/media.ts
    - packages/database/src/utils/id.ts
    - packages/database/src/utils/password.ts
    - packages/database/src/seed/index.ts
    - packages/database/src/__tests__/schema/media.test.ts
    - packages/database/src/__tests__/seed.test.ts
    - packages/database/drizzle/0002_kind_hydra.sql
  modified:
    - packages/database/src/schema/index.ts
    - packages/database/src/schema/users.ts
    - packages/database/package.json
    - packages/database/drizzle/meta/_journal.json
decisions:
  - Use crypto.randomUUID() for ID generation
  - Use bcryptjs with 10 salt rounds for password hashing
  - Admin placeholder password: CHANGE_ME_FIRST
  - 3 default categories: 技术，生活，随笔
  - 7 sample tags with colors and descriptions
  - 3 sample posts with tag associations
metrics:
  duration: TBD
  completed: 2026-03-18
---

# Phase 3 Plan 4: Media Schema and Seed Data Summary

## One-liner

Media library schema with extended fields (alt_text, thumbnail_path, folder_id), utility functions for ID generation and password hashing, and comprehensive seed data script.

## Overview

This plan completed the database layer by:

1. Creating media table schema with extended fields for frontend flexibility
2. Adding utility functions for ID generation and password hashing
3. Creating seed script with admin user, categories, tags, and sample posts
4. Adding comprehensive tests for media schema and utilities
5. Generating migration file for media table

## Tasks Completed

| Task | Name                      | Commit  | Files                                                |
| ---- | ------------------------- | ------- | ---------------------------------------------------- |
| 1    | Create media table Schema | c7ea1f2 | src/schema/media.ts                                  |
| 2    | Update schema index file  | c7ea1f2 | src/schema/index.ts                                  |
| 3    | Create utility functions  | a21aa8f | src/utils/id.ts, src/utils/password.ts               |
| 4    | Create seed data script   | a21aa8f | src/seed/index.ts                                    |
| 5    | Create unit tests         | a21aa8f | src/**tests**/schema/media.test.ts, seed.test.ts     |
| 6    | Generate migration        | c1961ec | drizzle/0002_kind_hydra.sql, meta/0002_snapshot.json |

## Implementation Details

### Media Schema (media.ts)

```typescript
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name'), // Optional
  path: text('path').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'), // Optional dimensions
  height: integer('height'), // Optional dimensions
  // Extended fields per CONTEXT.md
  altText: text('alt_text'), // Accessibility
  thumbnailPath: text('thumbnail_path'), // Thumbnail generation
  folderId: text('folder_id'), // Folder organization
  // Audit fields
  uploadedBy: text('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

### Utility Functions

**id.ts** - UUID v4 generation:

```typescript
export function generateId(): string {
  return randomUUID()
}
```

**password.ts** - bcrypt hashing:

```typescript
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hash: string): Promise<boolean>
```

### Seed Data (DB-10)

**Admin User:**

- Username: `admin`
- Email: `admin@example.com`
- Password: `CHANGE_ME_FIRST` (placeholder, must be changed)
- Role: `admin`

**3 Default Categories:**

1. 技术 (tech) - 技术文章和教程
2. 生活 (life) - 生活随笔和感悟
3. 随笔 (essays) - 读书笔记和随笔

**7 Sample Tags:**

- JavaScript, TypeScript, Vue, Nuxt, Node.js (tech)
- 生活感悟，读书笔记 (lifestyle)
- All with color codes and descriptions

**3 Sample Posts:**

1. Hello World - 博客开篇 (tech category, Nuxt tag)
2. Nuxt 3 入门教程 (tech category, JS/TS/Vue/Nuxt tags)
3. 2026 年的第一篇随笔 (life category, 生活感悟 tag)

## Verification Results

### Tests (31/31 passing)

**Media Schema Tests (6 tests):**

- ✓ has correct fields
- ✓ has required fields marked as notNull
- ✓ has optional fields
- ✓ has indexes defined
- ✓ has foreign key to users
- ✓ exports correct types

**Seed Utility Tests (6 tests):**

- ✓ generateId generates a valid UUID
- ✓ generateId generates unique IDs
- ✓ hashPassword returns a valid bcrypt hash
- ✓ verifyPassword returns true for correct password
- ✓ verifyPassword returns false for incorrect password
- ✓ hashes are unique for same password

**All Tests:**

```
Test Files  8 passed (8)
Tests       31 passed (31)
Duration    979ms
```

### Type Check

```bash
pnpm type-check
# PASSED - No errors
```

### Migration Files

- 0000_slippery_doctor_strange.sql (users, categories)
- 0001_whole_stick.sql (posts, tags, post_tags)
- 0002_kind_hydra.sql (media) - NEW

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Added bcryptjs dependency**

- **Found during:** Task 3 - Creating password utility
- **Issue:** bcryptjs not in package.json dependencies
- **Fix:** Added bcryptjs@2.4.3 and @types/bcryptjs@2.4.6
- **Files modified:** packages/database/package.json

**2. [Rule 3 - Blocking] Fixed db.insert access pattern**

- **Found during:** Task 4 - TypeScript compilation
- **Issue:** `db.insert()` doesn't exist - db is a wrapper object with `.get()` method
- **Fix:** Changed to `db.get().insert()` throughout seed script
- **Files modified:** packages/database/src/seed/index.ts

**3. [Rule 1 - Bug] Fixed vitest expect matcher**

- **Found during:** Task 5 - Test execution
- **Issue:** `startsWith` is not a valid vitest expect matcher
- **Fix:** Changed to `toMatch(/^\$2a\$/)` regex pattern
- **Files modified:** packages/database/src/**tests**/seed.test.ts

**4. [Rule 1 - Bug] Fixed optional field test assertion**

- **Found during:** Task 5 - Test execution
- **Issue:** `notNull` returns `false` for optional fields, not `undefined`
- **Fix:** Changed assertion from `toBeUndefined()` to `toBe(false)`
- **Files modified:** packages/database/src/**tests**/schema/media.test.ts

**5. [Rule 3 - Blocking] Added vitest types to tsconfig**

- **Found during:** Task 5 - Type checking
- **Issue:** import.meta.vitest not recognized
- **Fix:** Added `"types": ["vitest/globals"]` to tsconfig.json
- **Files modified:** packages/database/tsconfig.json

**6. [Rule 3 - Blocking] Updated users.ts with media relations**

- **Found during:** Task 2 - Schema integration
- **Issue:** users.ts had commented-out media relations placeholder
- **Fix:** Added proper import and media relation
- **Files modified:** packages/database/src/schema/users.ts

## Requirements Fulfilled

| Requirement | Description                             | Status |
| ----------- | --------------------------------------- | ------ |
| DB-08       | Media table schema with extended fields | ✅     |
| DB-09       | Utility functions (ID, password)        | ✅     |
| DB-10       | Seed data script                        | ✅     |

## Key Decisions

1. **Extended fields optional**: alt_text, thumbnail_path, folder_id are optional - frontend can choose to use them
2. **Placeholder password**: Admin password is `CHANGE_ME_FIRST` - must be changed on first login
3. **bcrypt salt rounds**: Using 10 rounds (bcrypt default) for password hashing
4. **UUID for IDs**: Using crypto.randomUUID() for consistent, collision-resistant IDs
5. **ON DELETE SET NULL**: Media uploaded_by set to NULL when user deleted (preserves media)

## Known Limitations

1. **better-sqlite3 native bindings**: May need rebuild on some platforms (pnpm rebuild better-sqlite3)
2. **Migration execution**: Database file not created until first run of seed script or migration
3. **Drizzle-kit version**: Warning about outdated version - functionality not affected

## Next Steps

- Plan 03-05: Database Migration and Testing
  - Run migrations against actual database
  - Verify seed script execution
  - End-to-end database testing

## References

- [Drizzle ORM Relations](https://orm.drizzle.team/docs/relations)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [crypto.randomUUID()](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)
