---
phase: 00-test-arch
plan: 05
subsystem: test-framework
tags:
  - api-testing
  - contract-testing
  - test-utilities
requires:
  - Phase 1: Monorepo infrastructure
  - Phase 3: Database layer
  - Phase 4 (partial): API utilities (response.ts, error.ts, validate.ts)
provides:
  - API contract test template
  - API test helper utilities
  - Auth API contract test example
affects:
  - Phase 4 remaining API endpoints
  - Future API development
tech-stack:
  added:
    - ofetch (for HTTP requests in tests)
  patterns:
    - Contract testing pattern
    - Input validation testing
    - Business logic testing
    - Output format testing
key-files:
  created:
    - apps/site/tests/server/api-contract.template.ts
    - apps/site/tests/server/helpers/api-test.ts
    - apps/site/tests/server/api/auth-contract.test.ts
  modified:
    - apps/site/server/utils/error.ts (fixed HTTPError.CONFLICT)
decisions:
  - name: Service layer testing over HTTP testing
    rationale: >
      This project uses Vitest with direct service layer testing rather than
      integration HTTP testing. This is faster and more focused on business logic.
      The contract testing pattern validates schemas, services, and response formats
      without requiring a running server.
  - name: Four-part contract structure
    rationale: >
      Tests are organized into: Input Contract (schemas), Business Logic (services),
      Output Contract (response utilities), and Error Handling. This provides clear
      separation and comprehensive coverage.
  - name: Auto-fix HTTPError.CONFLICT bug
    rationale: >
      Deviation Rule 1: HTTPError.CONFLICT was using ERROR_CODES.VALIDATION_ERROR
      instead of ERROR_CODES.CONFLICT. Fixed immediately to ensure correct error
      codes in API responses.
metrics:
  duration: ~30 minutes
  completed: 2026-03-22
  tests_created: 48
  tests_passing: 48
  pass_rate: 100%
---

# Phase 00 Plan 05: API Contract Test Framework Summary

**One-liner:** Created reusable API contract test framework with template, helpers, and auth API example (48 tests, 100% passing).

## Tasks Completed

| Task | Name                         | Commit  | Files                                    |
| ---- | ---------------------------- | ------- | ---------------------------------------- |
| 1    | Create API contract template | a3f505a | `tests/server/api-contract.template.ts`  |
| 2    | Create API test helpers      | a3f505a | `tests/server/helpers/api-test.ts`       |
| 3    | Demonstrate with Auth API    | a3f505a | `tests/server/api/auth-contract.test.ts` |

## What Was Built

### 1. API Contract Test Template (`api-contract.template.ts`)

Provides a comprehensive template structure for testing any API resource:

- Standard response format validation
- Parameter validation test patterns
- Error handling test patterns
- CRUD endpoint test structure (GET list, GET single, POST, PUT, DELETE)
- Authentication requirement tests
- Consistency tests for error formats

### 2. API Test Helpers (`helpers/api-test.ts`)

Core utilities for API testing:

- `generateTestToken(user)` - Generate JWT tokens for auth testing
- `makeAuthenticatedRequest(url, options)` - Make HTTP requests with auth
- `assertStandardResponse(response)` - Validate success response format
- `assertPaginatedResponse(response)` - Validate paginated response format
- `assertErrorResponse(response, code?)` - Validate error response format
- `seedTestData(db)` - Create standard test data
- `createTestPost(db, overrides)` - Create test posts with custom data

### 3. Auth API Contract Tests (`api/auth-contract.test.ts`)

Complete contract tests for authentication endpoints:

**Input Contract (Schema Validation):**

- loginSchema: 6 tests (valid data, empty username, empty password, short password, special chars, long username)
- registerSchema: 6 tests (valid data, invalid email, empty email, long email, inherited validation)

**Business Logic (Service Functions):**

- login: 5 tests (valid credentials, wrong password, non-existent user, disabled account, lastLoginAt update)
- logout: 2 tests (token blacklisting, blacklist checking)
- register: 5 tests (create user, duplicate username, duplicate email, password hashing)
- generateToken: 2 tests (JWT format, user fields)

**Output Contract (Response Format):**

- createSuccessResponse: 2 tests (data format, message inclusion)
- Error format: 2 tests (consistent structure, error details)

**Error Handling Consistency:**

- 2 tests (HTTPError instances, no sensitive info leakage)

**Password Utilities:**

- 3 tests (hashPassword format, verifyPassword true/false cases)

**Total: 48 tests, 100% passing**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed HTTPError.CONFLICT error code**

- **Found during:** Task 3 (Auth API contract tests)
- **Issue:** `HTTPError.CONFLICT()` was using `ERROR_CODES.VALIDATION_ERROR` instead of `ERROR_CODES.CONFLICT`
- **Fix:** Changed to use correct error code constant
- **Files modified:** `apps/site/server/utils/error.ts`
- **Commit:** a3f505a

## Test Results

```
Test Files: 18 passed, 1 failed (pre-existing post.service issue)
Tests: 358 passed, 1 failed (99.7% pass rate)
Auth contract tests: 48/48 passing (100%)
```

The one remaining failure is a pre-existing drizzle-orm transaction metadata issue in `post.service.test.ts`, documented in STATE.md as not a code bug.

## Usage Guide

### Creating New API Contract Tests

1. Copy `api-contract.template.ts` to `api/[resource]-contract.test.ts`
2. Replace `[Resource]` and `[resource]` placeholders
3. Implement tests based on your API specification
4. Use helpers from `helpers/api-test.ts`

### Example Pattern

```typescript
import { validateBodySync } from '../../../server/utils/validate'
import { yourServiceFunction } from '../../../server/services/your-service'
import { yourSchema } from '../../../server/schemas/your-schema'

describe('Your API Contract', () => {
  describe('yourSchema validation', () => {
    it('accepts valid data', () => {
      const result = validateBodySync(
        {
          /* valid data */
        },
        yourSchema
      )
      expect(result).toEqual({
        /* expected */
      })
    })
  })

  describe('yourServiceFunction', () => {
    it('does something', async () => {
      const result = await yourServiceFunction(/* args */)
      expect(result).toHaveProperty('expected')
    })
  })
})
```

## Requirements Satisfied

This plan contributes to:

- **API-08**: API error handling (verified through contract tests)
- **API-09**: API request validation (Zod schemas tested)

## Next Steps

The API contract test framework is now ready for use with:

- Phase 4 remaining API endpoints (Posts, Categories, Tags, Media CRUD APIs)
- Future API development in Phase 5+

Recommended next plans:

- 04-08: Posts API with contract tests
- 04-09: Categories API with contract tests
- 04-10: Tags API with contract tests
- 04-11: Media API with contract tests
