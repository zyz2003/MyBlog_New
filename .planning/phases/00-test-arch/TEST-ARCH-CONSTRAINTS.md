# Test Architecture Constraints

**Phase:** 00-test-arch
**Version:** 1.0
**Effective:** 2026-03-22

---

## Core Principle

> **Tests are verifiers, not accommodators.**
>
> When tests fail, fix the source code, not the tests.

---

## Four-Layer Test Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 4: E2E Tests (Playwright)                                     │
│ Verifies: Complete user workflows                                   │
│ Source of truth: User stories, acceptance criteria                  │
│ When fails: Fix application code, not tests                         │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 3: Integration Tests                                          │
│ Verifies: Module collaboration (API + Services + Database)          │
│ Source of truth: Interface contracts, Schema definitions            │
│ When fails: Fix interfaces/Schema, not tests                        │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 2: Unit Tests                                                 │
│ Verifies: Isolated function/class behavior                          │
│ Source of truth: Expected behavior, boundary conditions             │
│ When fails: Fix implementation logic, not tests                     │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 1: Contract Verification (Independent)                        │
│ Verifies: Schema integrity, API response format, type safety        │
│ Source of truth: REQUIREMENTS.md, business specifications           │
│ When fails: Fix formal definitions, NEVER verification scripts      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer Definitions

### Layer 1: Contract Verification

**Purpose:** Verify that formal definitions (Schema, types, API contracts) are correct and complete.

**What it verifies:**

- Database Schema matches business requirements
- TypeScript types are correct and complete
- API response formats match specifications
- Zod schemas validate correctly

**Source of truth:**

- `REQUIREMENTS.md` - Business requirements
- Database Schema files (`packages/database/src/schema/*.ts`)
- API specification documents

**When tests fail:**

- Fix the Schema definition
- Fix the type definitions
- Fix the API response utilities
- **NEVER** modify the verification script to match broken Schema

**Examples:**

- `schema-sync.test.ts` - Verifies test database helpers match formal Schema
- `verify-schema.ts` - Independent Schema verification script
- `tsconfig-heritage.test.ts` - Verifies TypeScript configuration inheritance

---

### Layer 2: Unit Tests

**Purpose:** Verify individual functions and classes behave correctly in isolation.

**What it verifies:**

- Single function logic (inputs → outputs)
- Class methods and state management
- Edge cases and boundary conditions
- Error handling within single units

**Source of truth:**

- Function documentation (JSDoc)
- Expected behavior specifications
- Edge case requirements

**When tests fail:**

- Fix the function implementation
- Fix the class logic
- Add missing error handling
- **NEVER** change test assertions to match broken behavior

**Examples:**

- `auth.service.test.ts` - Tests login, logout, hashPassword functions
- `post.service.test.ts` - Tests CRUD operations on posts
- `markdown.test.ts` - Tests markdown parsing utilities

---

### Layer 3: Integration Tests

**Purpose:** Verify that modules work together correctly.

**What it verifies:**

- API endpoints → Service layer → Database flow
- Middleware chain execution
- Plugin hook system
- Cross-module data flow

**Source of truth:**

- Interface contracts between modules
- Schema definitions (Layer 1 verified)
- API specifications

**When tests fail:**

- Fix interface mismatches
- Fix Schema definitions
- Fix middleware ordering
- **NEVER** mock away the failing integration

**Examples:**

- `api-contract.template.ts` - Tests API endpoint contracts
- `migration-idempotency.test.ts` - Tests database migration flow
- `schema-backward-compat.test.ts` - Tests Schema evolution

---

### Layer 4: E2E Tests (Phase 5+)

**Purpose:** Verify complete user workflows from start to finish.

**What it verifies:**

- User login → content creation → publish flow
- Admin dashboard operations
- Frontend page rendering (SSR)
- Cross-browser compatibility

**Source of truth:**

- User stories
- Acceptance criteria
- UX specifications

**When tests fail:**

- Fix the user flow in application code
- Fix SSR rendering issues
- Fix navigation/routing bugs
- **NEVER** skip flaky tests or add artificial waits

**Tools:** Playwright (Phase 5+)

---

## Violation Handling Process

### Detection

When you discover "tests pass but functionality is broken":

1. **Identify the root cause:**
   - Is the test verifying the wrong thing? → Fix test basis
   - Is the source code wrong? → Fix source code
   - Is the Schema wrong? → Fix Schema

2. **Document the violation:**
   - Add to `.planning/phases/XXX/ISSUES.md`
   - Mark as "Test Architecture Violation"
   - Include: what was wrong, how fixed, prevention

### Prevention

**Before writing any test:**

1. Identify the **source of truth** for this test
2. Write the test based on the source of truth, NOT current implementation
3. If test fails, the source of truth tells you what to fix

**Rule:** If you can't identify the source of truth, don't write the test yet.

### Fix Priority

When a test fails:

```
1. Is Layer 1 (Contract) failing?
   → Fix Schema/types/formal definitions IMMEDIATELY
   → This is highest priority - broken contracts affect everything

2. Is Layer 2 (Unit) failing?
   → Fix the function/class implementation

3. Is Layer 3 (Integration) failing?
   → Fix interface contracts or module implementations

4. Is Layer 4 (E2E) failing?
   → Fix the user flow or UI implementation
```

---

## Test File Naming Conventions

| Pattern         | Location              | Example                                                |
| --------------- | --------------------- | ------------------------------------------------------ |
| `*.test.ts`     | Unit tests            | `apps/site/tests/server/services/auth.service.test.ts` |
| `*.test.ts`     | Integration tests     | `apps/site/tests/server/api/auth-contract.test.ts`     |
| `*.test.ts`     | Contract verification | `apps/site/tests/schema-sync.test.ts`                  |
| `*.e2e.ts`      | E2E tests (Phase 5+)  | `apps/site/tests/e2e/login.e2e.ts`                     |
| `*.template.ts` | Test templates        | `apps/site/tests/server/api-contract.template.ts`      |
| `verify-*.ts`   | Independent scripts   | `scripts/verify-schema.ts`                             |

---

## Anti-Patterns to Avoid

### ❌ Test Accommodation

```typescript
// WRONG: Test accommodates broken Schema
const EXPECTED_COLUMNS = ['id', 'username', 'email', 'bug_field'] // Bug in Schema
expect(columns).toEqual(EXPECTED_COLUMNS) // Test "passes" but validates bug

// RIGHT: Test verifies correct Schema
const EXPECTED_COLUMNS = ['id', 'username', 'email', 'created_at'] // Correct spec
expect(columns).toEqual(EXPECTED_COLUMNS) // Test fails → fix Schema
```

### ❌ Mocking Away Problems

```typescript
// WRONG: Mock hides integration issue
vi.mock('@my-blog/database', () => ({
  db: { insert: vi.fn().mockResolvedValue({}) }, // Ignores real Schema
}))

// RIGHT: Test real integration
import { db } from '@my-blog/database'
// Test against real database with real Schema
```

### ❌ Flaky Test Workarounds

```typescript
// WRONG: Artificial wait hides race condition
await page.waitForTimeout(1000) // Hope it works

// RIGHT: Wait for specific condition
await expect(page.getByText('Success')).toBeVisible()
```

---

## Requirements Traceability

Each test should trace back to requirements:

```
Test: auth-contract.test.ts → login function tests
Requirement: API-05 (Authentication API)
Verification: Business logic correctly implements login
```

See `REQUIREMENTS.md` for full requirement IDs.

---

## Phase-Specific Requirements

### Phase 1-4 (Backend Focus)

- **Layer 1:** 100% Schema verification coverage
- **Layer 2:** 80%+ unit test coverage for service layer
- **Layer 3:** API contract tests for all endpoints
- **Layer 4:** Not required yet (Phase 5+)

### Phase 5-11 (Full Stack)

- **Layer 1:** Maintain Phase 1-4 coverage
- **Layer 2:** 80%+ coverage for all business logic
- **Layer 3:** Integration tests for all module boundaries
- **Layer 4:** E2E tests for all user workflows (Playwright)

---

## Summary

| Principle                     | Action                                         |
| ----------------------------- | ---------------------------------------------- |
| Tests verify, not accommodate | When test fails, fix source code               |
| Four layers, clear boundaries | Know which layer your test belongs to          |
| Source of truth first         | Write tests based on specs, not implementation |
| Document violations           | Track and learn from test architecture issues  |
| Prevent, don't react          | Identify source of truth before writing tests  |

---

**Approved:** Pending human review
**Next Review:** Phase 5 kickoff
