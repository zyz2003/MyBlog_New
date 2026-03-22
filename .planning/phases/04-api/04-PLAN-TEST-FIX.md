---
phase: 04-api
plan: TEST-FIX
type: fix
wave: 3
depends_on: []
autonomous: false
priority: critical
---

# 测试验证体系修复计划

## 问题描述

**严重问题：** 测试文件一直在修改以"匹配"正式文件，而不是验证正式文件是否正确。

### 问题表现

1. **测试文件手动创建** - 测试数据库结构是手动编写的，不是从正式 Schema 生成
2. **测试迁就正式文件** - 如果正式文件有 bug，测试会修改自身来"通过"
3. **无法发现真实问题** - 测试通过不代表功能正确
4. **技术债务累积** - Phase 1-4 都存在类似问题

### 具体案例

| 测试文件                                  | 正式 Schema                 | 问题       |
| ----------------------------------------- | --------------------------- | ---------- |
| post.service.test.ts 创建 `posts_tags` 表 | 正式 Schema 是 `post_tags`  | 表名不一致 |
| 测试文件缺少 `avatar` 字段                | users.ts 有 `avatar`        | 字段缺失   |
| 测试文件缺少 `parent_id`                  | categories.ts 有 `parentId` | 字段缺失   |
| 测试文件 `post_tags` 无 `created_at`      | post_tags.ts 有 `createdAt` | 字段缺失   |

## 修复方案

### 第一层：立即修复（Phase 4 执行期间）

#### Task 1: 创建 Schema 验证测试

**文件：** `apps/site/tests/schema-validation.test.ts`

```typescript
/**
 * Schema Validation Tests
 *
 * 验证正式数据库 Schema 可以被正确导入和使用
 * 这些测试确保测试文件使用的 Schema 与正式 Schema 一致
 */

import { describe, it, expect } from 'vitest'
import * as schema from '@my-blog/database/schema'

describe('Database Schema Validation', () => {
  it('exports all required tables', () => {
    expect(schema.users).toBeDefined()
    expect(schema.posts).toBeDefined()
    expect(schema.categories).toBeDefined()
    expect(schema.tags).toBeDefined()
    expect(schema.postTags).toBeDefined()
    expect(schema.media).toBeDefined()
  })

  it('users table has required columns', () => {
    const columns = schema.users
    expect(columns.id).toBeDefined()
    expect(columns.username).toBeDefined()
    expect(columns.email).toBeDefined()
    expect(columns.passwordHash).toBeDefined()
    expect(columns.avatar).toBeDefined() // 之前测试文件缺失
    expect(columns.bio).toBeDefined()
    expect(columns.website).toBeDefined()
  })

  it('postTags table has correct structure', () => {
    const columns = schema.postTags
    expect(columns.postId).toBeDefined()
    expect(columns.tagId).toBeDefined()
    expect(columns.createdAt).toBeDefined()
  })

  it('categories table has parent hierarchy', () => {
    const columns = schema.categories
    expect(columns.parentId).toBeDefined() // 之前测试文件缺失
  })
})
```

#### Task 2: 重构测试文件使用正式 Schema 创建数据库

**文件：** `apps/site/tests/db.ts` (新建)

```typescript
/**
 * Test Database Utilities
 *
 * 使用正式 Schema 自动创建测试数据库结构
 * 不再手动编写 CREATE TABLE 语句
 */

import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '@my-blog/database/schema'

let testDb: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getTestDatabase() {
  if (!testDb) {
    const client = createClient({
      url: 'file::memory:?cache=shared',
    })
    testDb = drizzle(client, { schema })
  }
  return testDb
}

export async function resetTestDatabase() {
  // 使用正式 Schema 重新创建数据库
  const db = getTestDatabase()
  // Drizzle 会自动根据 Schema 创建表结构
  return db
}
```

#### Task 3: 更新 post.service.test.ts

使用正式 Schema 而不是手动创建表：

```typescript
// 删除手动 CREATE TABLE 语句
// 改用 schema 自动创建

import { getTestDatabase, resetTestDatabase } from '../../db'
import * as schema from '@my-blog/database/schema'
import { migrate } from 'drizzle-orm/libsql/migrator'

beforeAll(async () => {
  const db = getTestDatabase()
  // 使用正式 Schema 创建表结构
  // 这样确保测试数据库与生产数据库结构完全一致
})
```

### 第二层：中期修复（Phase 4 完成后）

#### Task 4: 创建集成测试框架

**文件：** `apps/site/tests/integration/posts.test.ts`

```typescript
/**
 * API Integration Tests
 *
 * 测试真实的 API 端点，而不是直接调用服务层
 * 这是端到端验证，确保整个系统正常工作
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupNuxtApp, teardownNuxtApp, $fetch } from '../utils/nuxt-test-helper'

describe('Posts API Integration', () => {
  beforeAll(async () => {
    await setupNuxtApp()
  })

  afterAll(async () => {
    await teardownNuxtApp()
  })

  it('GET /api/v1/posts returns list', async () => {
    const response = await $fetch('/api/v1/posts')
    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
  })

  it('POST /api/v1/posts/create requires authentication', async () => {
    await expect(
      $fetch('/api/v1/posts/create', {
        method: 'POST',
        body: { title: 'Test' },
      })
    ).rejects.toThrow('401')
  })
})
```

#### Task 5: 添加 API 响应验证测试

**文件：** `apps/site/tests/integration/api-validation.test.ts`

```typescript
/**
 * API Response Validation Tests
 *
 * 验证 API 响应格式符合统一标准
 */

import { describe, it, expect } from 'vitest'
import { createSuccessResponse, createErrorResponse } from '../../server/utils/response'

describe('API Response Format', () => {
  it('createSuccessResponse has correct format', () => {
    const response = createSuccessResponse({ data: 'test' }, 'Success')
    expect(response).toHaveProperty('success', true)
    expect(response).toHaveProperty('data')
    expect(response).toHaveProperty('message', 'Success')
  })

  it('createErrorResponse has correct format', () => {
    const response = createErrorResponse(400, 'VALIDATION_ERROR', 'Invalid input')
    expect(response).toHaveProperty('success', false)
    expect(response).toHaveProperty('error')
    expect(response.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(response.error).toHaveProperty('message', 'Invalid input')
  })
})
```

### 第三层：长期保障（Phase 5 开始前）

#### Task 6: 建立 CI/CD 验证流程

**文件：** `.github/workflows/verify-schema.yml`

```yaml
name: Verify Database Schema

on:
  push:
    paths:
      - 'packages/database/src/schema/**'
      - 'packages/database/drizzle.config.ts'

jobs:
  verify-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Generate migrations
        run: cd packages/database && pnpm drizzle-kit generate:sqlite

      - name: Push schema to verify
        run: cd packages/database && pnpm drizzle-kit push:sqlite

      - name: Run schema tests
        run: pnpm test -- schema-validation
```

#### Task 7: 添加 E2E 测试框架（Playwright）

**文件：** `apps/site/e2e/posts.spec.ts`

```typescript
/**
 * E2E Tests for Posts Management
 *
 * 使用 Playwright 进行端到端测试
 * 模拟真实用户操作
 */

import { test, expect } from '@playwright/test'

test.describe('Posts Management', () => {
  test('user can create a new post', async ({ page }) => {
    await page.goto('/admin/posts/new')

    await page.fill('[name="title"]', 'Test Post')
    await page.fill('[name="content"]', '# Hello World')
    await page.click('button[type="submit"]')

    await expect(page.locator('.post-title')).toContainText('Test Post')
  })

  test('user can view post list', async ({ page }) => {
    await page.goto('/admin/posts')

    await expect(page.locator('.post-list')).toBeVisible()
    await expect(page.locator('.post-item')).toHaveCount.greaterThan(0)
  })
})
```

## 执行检查清单

### Phase 4 执行期间

- [ ] Task 1: Schema 验证测试创建
- [ ] Task 2: 测试数据库工具重构
- [ ] Task 3: post.service.test.ts 更新
- [ ] 验证：所有测试使用正式 Schema

### Phase 4 完成后

- [ ] Task 4: 集成测试框架
- [ ] Task 5: API 响应验证测试
- [ ] 验证：API 端点真正可用

### Phase 5 开始前

- [ ] Task 6: CI/CD 验证流程
- [ ] Task 7: E2E 测试框架
- [ ] 验证：完整用户流程可工作

## 验收标准

1. **Schema 一致性**：测试数据库结构 100% 匹配正式 Schema
2. **测试发现 bug**：如果正式文件有 bug，测试应该失败而不是"通过"
3. **集成测试覆盖**：所有 API 端点有集成测试
4. **CI/CD 自动化**：每次提交自动验证 Schema 和 API

## 风险提示

- **时间成本**：修复现有测试文件需要额外时间
- **测试失败增加**：修复初期测试失败数量可能增加
- **需要用户验证**：部分功能需要人工验证

## 下一步行动

1. 立即暂停 Phase 4 执行
2. 执行 Task 1-3 修复测试基础架构
3. 重新运行 Phase 4 剩余计划的测试
4. 验证修复效果后继续 Phase 4

---

**创建时间：** 2026-03-20
**优先级：** Critical
**状态：** Pending approval
