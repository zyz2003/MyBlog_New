# Phase 5+ Test Requirements

**Phase:** 00-test-arch
**Version:** 1.0
**Effective:** Phase 5 kickoff

---

## Overview

This document defines testing requirements for Phase 5-11 (frontend and full-stack features).

**Key additions for Phase 5+:**

- Component testing (Vue 3 + Vitest)
- E2E testing (Playwright)
- SSR testing requirements
- Coverage requirements (80%+ for core logic)

---

## Test Architecture Review

Phase 5+ uses the same four-layer architecture:

| Layer           | Focus                        | Tools                             |
| --------------- | ---------------------------- | --------------------------------- |
| L1: Contract    | Schema, types, API contracts | TypeScript, Zod, verify-schema.ts |
| L2: Unit        | Isolated functions/classes   | Vitest                            |
| L3: Integration | Module collaboration         | Vitest + test database            |
| L4: E2E         | User workflows               | Playwright                        |

---

## Component Testing (Vue 3)

### Setup

Components should be tested using Vitest with Vue 3 test utilities.

**File location:** `apps/site/tests/components/`

### Component Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '../../components/YourComponent.vue'

describe('YourComponent', () => {
  it('renders correctly with props', () => {
    const wrapper = mount(YourComponent, {
      props: {
        title: 'Test Title',
        count: 5,
      },
    })

    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('5')
  })

  it('emits events on interaction', async () => {
    const wrapper = mount(YourComponent)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeDefined()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('handles reactive state changes', async () => {
    const wrapper = mount(YourComponent, {
      props: {
        initialCount: 0,
      },
    })

    await wrapper.setProps({ initialCount: 10 })

    expect(wrapper.text()).toContain('10')
  })
})
```

### Component Test Requirements

| Requirement   | Description                                              |
| ------------- | -------------------------------------------------------- |
| Props         | Test all props with valid, invalid, and edge case values |
| Events        | Verify all emitted events with correct payloads          |
| Slots         | Test default and named slots                             |
| Composables   | Mock composables that have external dependencies         |
| CSS classes   | Verify critical CSS classes (for styling contracts)      |
| Accessibility | Test aria attributes and keyboard navigation             |

### Component Test Templates

Create: `apps/site/tests/components/[component].test.ts`

```typescript
/**
 * Component: [ComponentName]
 * Location: components/[path]/[ComponentName].vue
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import [ComponentName] from '../../components/[path]/[ComponentName].vue'

describe('[ComponentName]', () => {
  describe('Props', () => {
    it('renders with required props', () => {
      // Test required props
    })

    it('renders with optional props', () => {
      // Test optional props
    })

    it('handles prop validation errors', () => {
      // Test invalid prop types
    })
  })

  describe('Events', () => {
    it('emits [event-name] on [action]', async () => {
      // Test event emission
    })
  })

  describe('Slots', () => {
    it('renders default slot content', () => {
      // Test default slot
    })

    it('renders named slots', () => {
      // Test named slots
    })
  })

  describe('Accessibility', () => {
    it('has required aria attributes', () => {
      // Test aria attributes
    })

    it('supports keyboard navigation', async () => {
      // Test keyboard interaction
    })
  })
})
```

---

## E2E Testing (Playwright)

### Setup

Playwright for end-to-end browser testing.

**File location:** `apps/site/tests/e2e/`

### Installation (Phase 5 kickoff)

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login')
    await page.fill('[name="username"]', 'admin')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('creates a new article', async ({ page }) => {
    await page.goto('/admin/posts/new')

    // Fill article form
    await page.fill('[name="title"]', 'Test Article')
    await page.fill('[name="slug"]', 'test-article')
    await page.fill('[name="content"]', 'Article content here')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify redirect and success message
    await expect(page).toHaveURL('/admin/posts')
    await expect(page.locator('.alert-success')).toBeVisible()

    // Verify article appears in list
    await expect(page.locator('text=Test Article')).toBeVisible()
  })

  test('deletes an article', async ({ page }) => {
    await page.goto('/admin/posts')

    // Click delete button
    await page.click('button[aria-label="Delete article"]')

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Verify article removed
    await expect(page.locator('text=Test Article')).not.toBeVisible()
  })
})
```

### E2E Test Requirements

| Requirement          | Description                                     |
| -------------------- | ----------------------------------------------- |
| Authentication flows | Login, logout, session persistence              |
| CRUD operations      | Create, Read, Update, Delete workflows          |
| Form validation      | Error messages, field validation                |
| Navigation           | Router links, breadcrumbs, pagination           |
| Error states         | 404, 500, network errors                        |
| SSR verification     | Page renders correctly with JavaScript disabled |

### E2E Test Templates

Create: `apps/site/tests/e2e/[feature].e2e.ts`

```typescript
/**
 * E2E Tests: [Feature Name]
 * User Story: [Link to user story or description]
 */

import { test, expect } from '@playwright/test'

test.describe('[Feature Name]', () => {
  // Setup: Login and navigate to feature

  test('completes primary user workflow', async ({ page }) => {
    // Test the main user journey
  })

  test('handles error states', async ({ page }) => {
    // Test error scenarios
  })

  test('works without JavaScript (SSR)', async ({ page }) => {
    // Disable JavaScript and verify SSR
    await page.context().setOffline(true)
    // Or use Playwright's JavaScript disabling feature
  })
})
```

---

## SSR Testing Requirements

### SSR Verification Tests

For all public-facing pages (blog posts, homepage, etc.):

```typescript
import { test, expect } from '@playwright/test'

test.describe('SSR Verification', () => {
  test('homepage renders without JavaScript', async ({ page }) => {
    // Disable JavaScript
    await page.context().setOffline(true)

    await page.goto('/')

    // Verify critical content is server-rendered
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.article-list')).toBeVisible()
  })

  test('article page renders content without JavaScript', async ({ page }) => {
    await page.goto('/posts/test-article')

    // With JavaScript disabled, verify content is visible
    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Test Article')
  })
})
```

### SSR Checklist

| Page Type          | SSR Required | Notes            |
| ------------------ | ------------ | ---------------- |
| Homepage           | Yes          | Critical for SEO |
| Article list       | Yes          | Critical for SEO |
| Article detail     | Yes          | Critical for SEO |
| Category/tag pages | Yes          | Critical for SEO |
| Admin dashboard    | No           | Client-side only |
| Editor pages       | No           | Client-side only |

---

## Coverage Requirements

### Target Coverage

| Code Type         | Minimum Coverage | Priority |
| ----------------- | ---------------- | -------- |
| Service layer     | 80%              | Critical |
| Composables       | 80%              | Critical |
| Utility functions | 80%              | High     |
| Components        | 60%              | Medium   |
| Pages             | 40%              | Medium   |
| API endpoints     | 80%              | Critical |

### Coverage Configuration

Add to `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.vue', // Optional: exclude components from strict thresholds
      ],
    },
  },
})
```

### Running Coverage

```bash
# Run tests with coverage
pnpm test:coverage

# View HTML report
open apps/site/coverage/index.html
```

---

## Phase-Specific Requirements

### Phase 5: Admin Dashboard

| Feature       | Test Requirements             |
| ------------- | ----------------------------- |
| Login/Logout  | E2E test for auth flow        |
| Article CRUD  | Component + E2E tests         |
| Media library | Component + integration tests |
| Settings      | Component tests for forms     |

**Minimum tests:**

- 10+ component tests
- 5+ E2E workflows
- 80% service layer coverage

### Phase 6: Frontend Blog

| Feature            | Test Requirements     |
| ------------------ | --------------------- |
| Homepage           | SSR test + E2E test   |
| Article list       | SSR test + E2E test   |
| Article detail     | SSR test + E2E test   |
| Category/tag pages | SSR test + E2E test   |
| Search             | Component + E2E tests |

**Minimum tests:**

- 10+ component tests
- 10+ E2E workflows
- SSR verification for all public pages

### Phase 7: Theme System

| Feature                | Test Requirements     |
| ---------------------- | --------------------- |
| Theme switching        | Component + E2E tests |
| CSS variable injection | Unit tests            |
| Theme preview          | Component tests       |

**Minimum tests:**

- 5+ unit tests for theme utilities
- 5+ component tests
- 3+ E2E tests

### Phase 8-11: Extensions

Follow the same pattern:

- Component tests for UI
- Unit tests for utilities
- Integration tests for module boundaries
- E2E tests for user workflows

---

## Test File Organization

```
apps/site/tests/
├── server/                    # Backend tests (Phase 4)
│   ├── api/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   └── helpers/
├── components/                # Component tests (Phase 5+)
│   ├── layouts/
│   ├── admin/
│   ├── modules/
│   └── ui/
├── composables/               # Composable tests (Phase 5+)
│   └── useXxx.test.ts
├── e2e/                       # E2E tests (Phase 5+)
│   ├── auth.e2e.ts
│   ├── admin.e2e.ts
│   └── blog.e2e.ts
├── integration/               # Integration tests
│   └── [feature]-integration.test.ts
├── unit.template.test.ts      # Unit test template
├── integration.template.test.ts # Integration test template
└── api-contract.template.test.ts # API contract template
```

---

## Continuous Integration

### CI Pipeline (Phase 5+)

```yaml
jobs:
  contract-verification:
    # Type check, Schema verification
    run: pnpm type-check && pnpm test:schema

  unit-tests:
    # Fast, isolated unit tests
    run: pnpm test -- --group=unit

  component-tests:
    # Vue component tests
    run: pnpm test -- --group=component

  integration-tests:
    # Module collaboration tests
    run: pnpm test -- --group=integration

  e2e-tests:
    # Full user workflow tests
    run: pnpm test:e2e

  coverage-check:
    # Verify coverage thresholds
    run: pnpm test:coverage
```

---

## Summary

| Test Type   | When to Write           | Tools                    | Location                              |
| ----------- | ----------------------- | ------------------------ | ------------------------------------- |
| Unit        | For all business logic  | Vitest                   | `tests/server/`, `tests/composables/` |
| Component   | For reusable components | Vitest + @vue/test-utils | `tests/components/`                   |
| Integration | For module boundaries   | Vitest + test db         | `tests/integration/`                  |
| E2E         | For user workflows      | Playwright               | `tests/e2e/`                          |
| SSR         | For public pages        | Playwright (no-JS mode)  | `tests/e2e/`                          |

**Golden Rule:** Tests verify, they don't accommodate. When tests fail, fix the source code.
