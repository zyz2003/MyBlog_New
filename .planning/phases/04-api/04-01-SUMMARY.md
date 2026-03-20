# Phase 4 Plan 01 Summary: Unified Response Format + Error Utilities

**Execution Date:** 2026-03-20
**Status:** Complete

---

## Overview

创建了统一的 API 响应格式和错误处理工具类，为所有 API 端点提供一致的响应格式和错误类型。

---

## Tasks Completed

### Task 1: Create Unified Response and Error Utilities

**Files Created:**

| File                                            | Purpose          | Exports                                                                    |
| ----------------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `apps/site/server/utils/response.ts`            | 统一响应格式工具 | `createSuccessResponse`, `createErrorResponse`, `createPaginationResponse` |
| `apps/site/server/utils/error.ts`               | HTTP 错误类      | `HTTPError`, `ERROR_CODES`, `isHTTPError`                                  |
| `apps/site/tests/server/utils/response.test.ts` | 测试文件         | 20 个测试用例                                                              |

**Response Utilities (`response.ts`):**

- `createSuccessResponse<T>(data: T, message?: string)` - 成功响应
- `createErrorResponse(code: string, message: string, details?)` - 错误响应
- `createPaginationResponse<T>(data: T[], pagination)` - 分页响应（自动计算 totalPages 和 currentPage）

**Error Utilities (`error.ts`):**

- `HTTPError` 类 - 继承 Error，包含 statusCode, code, message, details
- 预定义错误代码常量：`ERROR_CODES`
- 静态工厂方法：
  - `HTTPError.UNAUTHORIZED()` - 401
  - `HTTPError.INVALID_TOKEN()` - 401
  - `HTTPError.TOKEN_EXPIRED()` - 401
  - `HTTPError.FORBIDDEN()` - 403
  - `HTTPError.VALIDATION_ERROR()` - 400
  - `HTTPError.BAD_REQUEST()` - 400
  - `HTTPError.NOT_FOUND()` - 404
  - `HTTPError.RESOURCE_NOT_FOUND(resource)` - 404
  - `HTTPError.RATE_LIMIT_EXCEEDED()` - 429
  - `HTTPError.SERVER_ERROR()` - 500
  - `HTTPError.INTERNAL_ERROR()` - 500
  - `HTTPError.DATABASE_ERROR()` - 500
- `isHTTPError(error)` - 类型守卫

---

## Test Results

```
Test Files  2 passed (2)
Tests       25 passed (25)
```

**Response Utilities Tests (20 个):**

- ✅ createSuccessResponse - 4 tests
- ✅ createErrorResponse - 3 tests
- ✅ createPaginationResponse - 3 tests
- ✅ HTTPError - 10 tests

**Database Tests (5 个):**

- ✅ Database helpers - 5 tests

---

## Files Modified

| File                                            | Change                                  |
| ----------------------------------------------- | --------------------------------------- |
| `apps/site/server/utils/response.ts`            | Created - Unified response utilities    |
| `apps/site/server/utils/error.ts`               | Created - HTTPError class and constants |
| `apps/site/tests/server/utils/response.test.ts` | Created - Comprehensive tests           |

---

## Usage Examples

### Success Response

```typescript
import { createSuccessResponse } from '~/server/utils/response'

export default defineEventHandler(() => {
  return createSuccessResponse({ id: 1, name: 'Article' }, 'Article created')
})

// Returns:
// { success: true, message: 'Article created', data: { id: 1, name: 'Article' } }
```

### Error Response

```typescript
import { createErrorResponse } from '~/server/utils/response'

export default defineEventHandler(() => {
  return createErrorResponse('NOT_FOUND', 'Article not found')
})

// Returns:
// { success: false, error: { code: 'NOT_FOUND', message: 'Article not found' } }
```

### Throw HTTPError

```typescript
import { HTTPError } from '~/server/utils/error'

export default defineEventHandler(async () => {
  const article = await getArticleById(id)
  if (!article) {
    throw HTTPError.NOT_FOUND('Article')
  }
  return article
})
```

### Pagination Response

```typescript
import { createPaginationResponse } from '~/server/utils/response'

export default defineEventHandler(async () => {
  const articles = await getArticles({ limit: 10, offset: 0 })
  const total = await countArticles()

  return createPaginationResponse(articles, { total, limit: 10, offset: 0 })
})

// Returns:
// {
//   success: true,
//   data: [...],
//   meta: {
//     total: 100,
//     limit: 10,
//     offset: 0,
//     totalPages: 10,
//     currentPage: 1
//   }
// }
```

---

## Artifacts Created

| Artifact     | Path                                       |
| ------------ | ------------------------------------------ |
| This summary | `.planning/phases/04-api/04-01-SUMMARY.md` |

---

## Next Steps

Proceed to Plan 02: Zod validation utilities + schemas

---

## Commit

```
a62e1a6 feat(04-01): create unified response format and error utilities
```
