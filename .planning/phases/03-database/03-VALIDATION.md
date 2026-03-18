# Phase 3: Database Layer - Validation Plan

## Nyquist Validation Architecture

### V1. Schema Definition Verification

| Requirement      | Validation Method             | Success Criteria                                    |
| ---------------- | ----------------------------- | --------------------------------------------------- |
| DB-03 Users      | Unit test + manual inspection | Table has all required fields with correct types    |
| DB-04 Posts      | Unit test + manual inspection | Table has all required fields, foreign key to users |
| DB-05 Categories | Unit test + manual inspection | Self-referencing foreign key works                  |
| DB-06 Tags       | Unit test + manual inspection | Table has unique constraint on slug                 |
| DB-07 PostTags   | Unit test + manual inspection | Composite primary key, cascade delete works         |
| DB-08 Media      | Unit test + manual inspection | All file metadata fields present                    |

### V2. Database Connection Verification

| Requirement       | Validation Method          | Success Criteria                      |
| ----------------- | -------------------------- | ------------------------------------- |
| DB-01 WAL Mode    | Manual verification + test | `PRAGMA journal_mode` returns "wal"   |
| DB-02 Drizzle ORM | Integration test           | Can insert and query data through ORM |

### V3. Migration Verification

| Requirement      | Validation Method | Success Criteria                          |
| ---------------- | ----------------- | ----------------------------------------- |
| DB-09 Migrations | Manual execution  | `drizzle-kit migrate` runs without errors |

### V4. Seed Data Verification

| Requirement | Validation Method        | Success Criteria                        |
| ----------- | ------------------------ | --------------------------------------- |
| DB-10 Seed  | Manual execution + query | Admin user and default categories exist |

---

## Test Files to Create

### 1. Schema Tests

```typescript
// packages/database/src/__tests__/schema.test.ts
;-users.test.ts -
  posts.test.ts -
  categories.test.ts -
  tags.test.ts -
  post_tags.test.ts -
  media.test.ts
```

### 2. Integration Tests

```typescript
// packages/database/src/__tests__/integration.test.ts
;-db - connection.test.ts - crud - operations.test.ts - relations.test.ts
```

### 3. Migration Tests

```typescript
// packages/database/src/__tests__/migrations.test.ts
;-migrations.test.ts
```

---

## Manual Verification Checklist

- [ ] Database file created at correct location
- [ ] WAL mode enabled (check .wal file exists)
- [ ] All tables created with correct schema
- [ ] Foreign key constraints working
- [ ] Indexes created for performance
- [ ] Seed data inserted correctly
- [ ] Migrations run successfully

---

## Acceptance Criteria

1. **DB-01**: `PRAGMA journal_mode` returns "wal"
2. **DB-02**: Can insert and query data using Drizzle ORM
3. **DB-03 to DB-08**: All schema files compile without TypeScript errors
4. **DB-09**: `drizzle-kit migrate` completes without errors
5. **DB-10**: Seed script inserts admin user and default categories

---

## Verification Commands

```bash
# Run all tests
pnpm --filter @my-blog/database test

# Check WAL mode
sqlite3 apps/site/data/blog.db "PRAGMA journal_mode;"

# Verify schema
sqlite3 apps/site/data/blog.db ".schema"

# Run migrations
pnpm --filter @my-blog/database db:migrate

# Run seed
pnpm --filter @my-blog/database db:seed
```
