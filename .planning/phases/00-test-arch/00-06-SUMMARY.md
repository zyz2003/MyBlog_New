---
phase: 00-test-arch
plan: 06
subsystem: test-architecture
tags:
  - test-architecture
  - test-templates
  - ci-cd
  - phase-5-prep
requires: []
provides:
  - test-architecture-constraints
  - unit-test-template
  - integration-test-template
  - phase-5-test-requirements
  - ci-cd-pipeline-spec
affects:
  - .github/workflows/ci.yml
tech-stack:
  added:
    - Vitest (existing, formalized patterns)
    - Playwright (Phase 5+)
    - @vue/test-utils (Phase 5+)
  patterns:
    - four-layer-test-architecture
    - test-as-verifier-not-accommodator
    - contract-first-testing
key-files:
  created:
    - .planning/phases/00-test-arch/TEST-ARCH-CONSTRAINTS.md
    - .planning/phases/00-test-arch/PHASE-5-TEST-REQUIREMENTS.md
    - .planning/phases/00-test-arch/CI-CD-RECOMMENDATIONS.md
    - apps/site/tests/unit.template.test.ts
    - apps/site/tests/integration.template.test.ts
    - apps/site/tests/api-contract.template.test.ts (referenced, created in Plan 05)
  modified:
    - .github/workflows/ci.yml
decisions:
  - Four-layer test architecture adopted (Contract, Unit, Integration, E2E)
  - Test templates use commented code for placeholders (avoids lint errors)
  - E2E tests deferred to Phase 5 (frontend development)
  - Coverage thresholds: 80% for service layer, 60% for components
  - SSR testing required only for public-facing pages
metrics:
  duration_minutes: ~90
  completed_date: 2026-03-22
  tasks_completed: 4
  files_created: 5
  files_modified: 1
---

# Phase 00 Plan 06: Test Architecture Constraints & Phase 5+ Test Requirements Summary

## Overview

This plan established the test architecture constraints and testing standards that will govern Phase 5-11 (frontend and full-stack development). The core principle is: **Tests are verifiers, not accommodators.**

## One-Liner

Established four-layer test architecture (Contract → Unit → Integration → E2E), created test templates, defined Phase 5+ testing requirements (Component, E2E, SSR), and updated CI/CD pipeline with five-stage verification.

---

## Tasks Completed

| #   | Task                                              | Status | Commit  |
| --- | ------------------------------------------------- | ------ | ------- |
| 1   | Create TEST-ARCH-CONSTRAINTS.md                   | Done   | 969fe98 |
| 2   | Create test templates (unit, integration)         | Done   | 969fe98 |
| 3   | Create PHASE-5-TEST-REQUIREMENTS.md               | Done   | 188d82d |
| 4   | Create CI-CD-RECOMMENDATIONS.md + update workflow | Done   | 188d82d |

---

## Deliverables

### 1. TEST-ARCH-CONSTRAINTS.md

**Four-Layer Test Architecture:**

| Layer           | Verifies                     | Source of Truth                   | When Fails             |
| --------------- | ---------------------------- | --------------------------------- | ---------------------- |
| L1: Contract    | Schema, types, API contracts | REQUIREMENTS.md, business specs   | Fix formal definitions |
| L2: Unit        | Isolated functions/classes   | Expected behavior, JSDoc          | Fix implementation     |
| L3: Integration | Module collaboration         | Interface contracts, Schema       | Fix interfaces/Schema  |
| L4: E2E         | User workflows               | User stories, acceptance criteria | Fix application code   |

**Key Principles:**

- When tests fail, fix source code, not tests
- Identify source of truth before writing tests
- Document violations to prevent recurrence

**Anti-Patterns Defined:**

- Test accommodation (changing tests to match bugs)
- Mocking away integration problems
- Artificial waits hiding race conditions

### 2. Test Templates

**unit.template.test.ts:**

- Standard describe/it structure
- Happy path, edge cases, boundary conditions
- Error handling test patterns
- Business logic test patterns
- Commented placeholders to avoid lint errors

**integration.template.test.ts:**

- Database setup/teardown helpers
- Service → Database integration patterns
- API → Service → Database patterns
- Middleware → Handler patterns
- Shared test data seeding

**api-contract.template.test.ts:**

- Created in Plan 05, referenced here
- Standard API response format validation
- Pagination, filtering, sorting tests
- Error format consistency tests

### 3. PHASE-5-TEST-REQUIREMENTS.md

**Component Testing (Vue 3):**

- Tools: Vitest + @vue/test-utils
- Test: Props, events, slots, accessibility
- Location: `apps/site/tests/components/`

**E2E Testing (Playwright):**

- Multi-browser: Chrome, Firefox, Safari
- Authentication flows, CRUD workflows
- Form validation, navigation, error states
- Location: `apps/site/tests/e2e/`

**SSR Testing:**

- Required: Homepage, Article list, Article detail, Category/tag pages
- Not required: Admin dashboard, Editor pages
- Method: Playwright with JavaScript disabled

**Coverage Requirements:**

| Code Type     | Minimum | Priority |
| ------------- | ------- | -------- |
| Service layer | 80%     | Critical |
| Composables   | 80%     | Critical |
| Utilities     | 80%     | High     |
| Components    | 60%     | Medium   |
| Pages         | 40%     | Medium   |
| API endpoints | 80%     | Critical |

### 4. CI-CD-RECOMMENDATIONS.md

**Five-Stage Pipeline:**

```
Stage 1: Contract Verification (5-10 min)
  → pnpm lint, pnpm type-check, pnpm test:schema

Stage 2: Unit Tests (5-10 min)
  → pnpm test -- --group=unit

Stage 3: Integration Tests (10-15 min)
  → pnpm test -- --group=integration
  → pnpm test -- --group=api-contract

Stage 4: E2E Tests (15-30 min, Phase 5+)
  → pnpm test:e2e (currently disabled)

Stage 5: Coverage Check (5 min)
  → pnpm test:coverage
```

**Test Grouping Strategy:**

- `@group=unit` - Unit tests
- `@group=integration` - Integration tests
- `@group=api-contract` - API contract tests
- `@group=e2e` - E2E tests (Phase 5+)

### 5. CI/CD Workflow Updated

`.github/workflows/ci.yml` now includes:

- All five pipeline stages
- Proper job dependencies (`needs`)
- E2E stage disabled until Phase 5 (`if: false`)
- Artifact uploads for coverage and E2E reports
- Timeout configurations per stage

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Key Decisions

1. **Four-layer architecture adopted** - Clear separation between contract, unit, integration, and E2E tests.

2. **Commented placeholders in templates** - Avoids ESLint errors while providing clear structure for developers to fill in.

3. **E2E tests deferred to Phase 5** - No frontend exists yet, so E2E testing would be premature.

4. **Differentiated coverage thresholds** - Critical business logic (services, composables) requires 80%+, while UI components have more flexible 60% target.

5. **SSR testing scoped to public pages** - Admin dashboard is client-side only, focusing SSR efforts on SEO-critical pages.

---

## Files Created/Modified

### Created

- `.planning/phases/00-test-arch/TEST-ARCH-CONSTRAINTS.md` (782 lines)
- `.planning/phases/00-test-arch/PHASE-5-TEST-REQUIREMENTS.md` (446 lines)
- `.planning/phases/00-test-arch/CI-CD-RECOMMENDATIONS.md` (563 lines)
- `apps/site/tests/unit.template.test.ts` (176 lines)
- `apps/site/tests/integration.template.test.ts` (230 lines)

### Modified

- `.github/workflows/ci.yml` (240 lines, added 4 new job stages)

---

## Impact on Future Phases

### Phase 5 (Admin Dashboard)

- Component tests for all Vue components
- E2E tests for admin workflows (login, CRUD)
- 80% coverage for composables and services

### Phase 6 (Frontend Blog)

- SSR verification for all public pages
- E2E tests for user journeys
- Component tests for blog components

### Phase 7-11

- Follow established four-layer architecture
- Maintain coverage thresholds
- Add E2E tests for new user workflows

---

## Verification

### Self-Check

| Claim                               | Verification            | Status |
| ----------------------------------- | ----------------------- | ------ |
| TEST-ARCH-CONSTRAINTS.md exists     | File created            | PASSED |
| PHASE-5-TEST-REQUIREMENTS.md exists | File created            | PASSED |
| CI-CD-RECOMMENDATIONS.md exists     | File created            | PASSED |
| unit.template.test.ts exists        | File created            | PASSED |
| integration.template.test.ts exists | File created            | PASSED |
| ci.yml updated                      | 5 stages added          | PASSED |
| Commits created                     | git log shows 2 commits | PASSED |

**Self-Check Result:** PASSED

---

## Next Steps

1. **Phase 4 completion** - Continue with remaining API plans (04-08 through 04-16)

2. **Phase 5 kickoff** - When starting Phase 5:
   - Install Playwright: `pnpm add -D @playwright/test`
   - Install @vue/test-utils: `pnpm add -D @vue/test-utils`
   - Create first component tests
   - Create first E2E tests for auth flow

3. **CI/CD integration** - Ensure GitHub Actions has proper secrets and permissions for:
   - Playwright browser installation
   - Coverage report uploads
   - Artifact retention

---

**Plan Author:** Claude Code
**Human Reviewer:** Approved
**Date Completed:** 2026-03-22
