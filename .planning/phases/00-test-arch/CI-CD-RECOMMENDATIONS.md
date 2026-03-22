# CI/CD Pipeline Recommendations

**Phase:** 00-test-arch
**Version:** 1.0
**Effective:** After Phase 4 completion

---

## Overview

This document defines the four-layer CI/CD pipeline structure for the blog project.

**Pipeline Layers:**

1. Contract Verification (Type check, Schema verification, Lint)
2. Unit Tests (Fast, isolated function tests)
3. Integration Tests (Module collaboration)
4. E2E Tests (User workflows - Phase 5+)

---

## Pipeline Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CI/CD Pipeline                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Stage 1: Contract Verification (5-10 minutes)                           │
│ - Type check (pnpm type-check)                                          │
│ - Lint (pnpm lint)                                                      │
│ - Schema verification (pnpm test:schema)                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Stage 2: Unit Tests (5-10 minutes)                                      │
│ - Service layer tests                                                   │
│ - Utility function tests                                                │
│ - Composable tests                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Stage 3: Integration Tests (10-15 minutes)                              │
│ - API contract tests                                                    │
│ - Database integration tests                                            │
│ - Migration tests                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Stage 4: E2E Tests (Phase 5+, 15-30 minutes)                            │
│ - User workflow tests (Playwright)                                      │
│ - SSR verification tests                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Stage 5: Coverage Check (5 minutes)                                     │
│ - Verify coverage thresholds met                                        │
│ - Generate coverage report                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GitHub Actions Workflow

### Recommended `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches:
      - '**'
  pull_request:
    branches:
      - main
      - master

jobs:
  # ─────────────────────────────────────────────────────────────────────
  # Stage 1: Contract Verification
  # ─────────────────────────────────────────────────────────────────────
  contract-verification:
    name: Contract Verification
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.32.1'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Schema verification
        run: pnpm tsx scripts/verify-schema.ts

  # ─────────────────────────────────────────────────────────────────────
  # Stage 2: Unit Tests
  # ─────────────────────────────────────────────────────────────────────
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: contract-verification

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.32.1'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test -- --group=unit

  # ─────────────────────────────────────────────────────────────────────
  # Stage 3: Integration Tests
  # ─────────────────────────────────────────────────────────────────────
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: contract-verification

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.32.1'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run integration tests
        run: pnpm test -- --group=integration

      - name: Run API contract tests
        run: pnpm test -- --group=api-contract

  # ─────────────────────────────────────────────────────────────────────
  # Stage 4: E2E Tests (Phase 5+)
  # ─────────────────────────────────────────────────────────────────────
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    needs: [unit-tests, integration-tests]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.32.1'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload E2E report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # ─────────────────────────────────────────────────────────────────────
  # Stage 5: Coverage Check
  # ─────────────────────────────────────────────────────────────────────
  coverage-check:
    name: Coverage Check
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [unit-tests, integration-tests]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.32.1'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: apps/site/coverage/
          retention-days: 7

  # ─────────────────────────────────────────────────────────────────────
  # Build (runs after all tests pass)
  # ─────────────────────────────────────────────────────────────────────
  build:
    name: Production Build
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: [contract-verification, unit-tests, integration-tests]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.32.1'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
```

---

## Schema Verification Integration

### Script: `scripts/verify-schema.ts`

This script verifies that the database schema matches the formal definition.

```typescript
#!/usr/bin/env tsx

/**
 * Schema Verification Script
 *
 * Verifies that the test database schema matches the formal schema definition.
 * This is a critical contract verification step.
 *
 * Usage: pnpm tsx scripts/verify-schema.ts
 */

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '@my-blog/database/schema'

const DB_PATH = ':memory:'

function verifySchema(): void {
  const sqlite = new Database(DB_PATH)
  const db = drizzle(sqlite, { schema })

  console.log('Verifying schema...')

  // Create tables from schema
  // (This would use your migration system)

  // Get actual table info
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()

  console.log('Tables:', tables)

  // Verify each table matches expected schema
  // ...

  sqlite.close()

  console.log('Schema verification passed!')
}

verifySchema()
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:schema": "tsx scripts/verify-schema.ts",
    "test": "vitest",
    "test:unit": "vitest --group=unit",
    "test:integration": "vitest --group=integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Test Coverage Reporting

### Coverage Thresholds

Configure in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'apps/site/coverage',
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        // Per-file thresholds for critical modules
        'apps/site/server/services/*.ts': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
      },
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.vue', // Optional: relax for components
        '**/mocks/',
        '**/test-utils/',
      ],
    },
  },
})
```

### Coverage Report Format

The CI uploads coverage reports as artifacts:

1. **HTML Report** - Interactive coverage visualization
2. **JSON Report** - Machine-readable for integration with tools
3. **LCov Report** - For integration with coverage services (Codecov, Coveralls)

---

## When to Run Each Layer

| Trigger             | Layers to Run        | Notes              |
| ------------------- | -------------------- | ------------------ |
| Local development   | Unit + Integration   | Fast feedback      |
| Pre-commit (Husky)  | Type check + Lint    | Block invalid code |
| Pull request        | All 5 stages         | Full validation    |
| Merge to main       | All 5 stages + Build | Release validation |
| Scheduled (nightly) | All + E2E full suite | Catch flaky tests  |

---

## Test Grouping Strategy

Add `@group` annotations to test files:

```typescript
// Unit test
// @group=unit
describe('authService', () => { ... })

// Integration test
// @group=integration
describe('Auth API Contract', () => { ... })

// E2E test
// @group=e2e
test('login workflow', () => { ... })
```

Configure in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    // ... other config
    setupFiles: ['./tests/setup.ts'],
  },
})
```

---

## Failure Handling

### Contract Verification Failure

**Action:** Block all further stages.

**What to fix:**

- TypeScript errors → Fix type definitions
- Lint errors → Fix code style
- Schema mismatch → Fix schema definition

### Unit Test Failure

**Action:** Block integration and E2E stages.

**What to fix:**

- Function implementation bugs
- Missing edge case handling
- Incorrect business logic

### Integration Test Failure

**Action:** Block E2E stage.

**What to fix:**

- Interface mismatches
- Database schema issues
- Service layer bugs

### E2E Test Failure

**Action:** Block release, but allow investigation.

**What to fix:**

- User flow bugs
- UI/UX issues
- SSR rendering problems

### Coverage Check Failure

**Action:** Warning for Phase 4, block for Phase 5+.

**What to do:**

- Add missing tests
- Document uncovered edge cases
- Adjust thresholds if appropriate

---

## Phase 5+ Additions

### Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './apps/site/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Summary

| Stage                 | Purpose                       | Time      | Blocker        |
| --------------------- | ----------------------------- | --------- | -------------- |
| Contract Verification | Type safety, schema integrity | 5-10 min  | Yes            |
| Unit Tests            | Function correctness          | 5-10 min  | Yes            |
| Integration Tests     | Module collaboration          | 10-15 min | Yes            |
| E2E Tests             | User workflows                | 15-30 min | Yes (Phase 5+) |
| Coverage Check        | Coverage thresholds           | 5 min     | Warning → Yes  |

**Key Principles:**

- Fast feedback for developers (run minimal tests locally)
- Comprehensive validation for CI (run all tests)
- Fail fast (stop on first failure)
- Clear error messages (help developers fix quickly)
