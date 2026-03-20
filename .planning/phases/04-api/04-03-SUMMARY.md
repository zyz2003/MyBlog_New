# Phase 4 Plan 03 Summary: JWT Authentication Middleware

**Execution Date:** 2026-03-20
**Status:** Complete

---

## Overview

实现了 JWT 认证中间件，为 API 层提供完整的身份验证功能。

---

## Tasks Completed

### Task 1: Create JWT Authentication Middleware

**Files Created:**

| File                                             | Purpose        | Exports                                                                                                 |
| ------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/site/server/middleware/auth.ts`            | JWT 认证中间件 | `default` (middleware), `generateToken`, `optionalAuth`, `requireAuth`, `requireRole`, `requireAnyRole` |
| `apps/site/tests/server/middleware/auth.test.ts` | 测试文件       | 10 个测试用例                                                                                           |

**JWT Configuration:**

- **Algorithm:** HS256
- **Expiry:** 30 days
- **Secret:** Environment variable `JWT_SECRET` (fallback: 'change-me-in-production')

**Middleware Features:**

- **Public paths:** `/api/v1/auth/login`, `/api/v1/auth/register`
- **Public prefixes (GET only):** `/api/v1/posts`, `/api/v1/categories`, `/api/v1/tags`, `/api/v1/media`
- **Protected prefixes (always):** `/api/v1/admin`, `/api/v1/users`

**Helper Functions:**

| Function                       | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| `generateToken(user)`          | Generate JWT token for a user                        |
| `optionalAuth(event)`          | Attach user if valid token, ignore if not            |
| `requireAuth(event)`           | Require authentication, throw 401 if missing/invalid |
| `requireRole(event, role)`     | Require specific role, throw 403 if not matched      |
| `requireAnyRole(event, roles)` | Require any of the specified roles                   |

**User Context Interface:**

```typescript
interface UserContext {
  id: string
  username: string
  role: 'admin' | 'author' | 'editor'
  email?: string
}
```

---

## Test Results

```
Test Files  1 passed (1)
Tests       10 passed (10)
```

**Test Coverage:**

- ✅ `generateToken` - 2 tests
  - Should generate a valid JWT token
  - Should generate tokens with different values for different users
- ✅ `optionalAuth` - 4 tests
  - Should attach user for valid token
  - Should not attach user for missing token
  - Should not attach user for invalid token
  - Should not throw for expired token
- ✅ `requireAuth` - 3 tests
  - Should return user for valid token
  - Should throw UNAUTHORIZED for missing token
  - Should throw INVALID_TOKEN for invalid token
- ✅ Token payload - 1 test
  - Should include all user fields in token (id, username, role, email, exp, iat)

**Cumulative Tests:**

- Response utilities: 20 tests
- Validation utilities: 25 tests
- Authentication middleware: 10 tests
- Database helpers: 5 tests
- **Total: 60 tests**

---

## Files Modified

| File                                             | Change                   |
| ------------------------------------------------ | ------------------------ |
| `apps/site/server/middleware/auth.ts`            | Created - JWT middleware |
| `apps/site/tests/server/middleware/auth.test.ts` | Created - Auth tests     |
| `apps/site/package.json`                         | Added `jose` dependency  |

---

## Usage Examples

### Generate Token (Login)

```typescript
import { generateToken } from '~/server/middleware/auth'

// After verifying credentials
const token = await generateToken({
  id: user.id,
  username: user.username,
  role: user.role,
  email: user.email,
})

// Return token to client
return createSuccessResponse({ token }, 'Login successful')
```

### Optional Authentication (Public Routes)

```typescript
import { optionalAuth } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  await optionalAuth(event)

  // event.context.user is set if valid token, undefined otherwise
  const posts = await getPosts()

  // Personalize content if user is logged in
  if (event.context.user) {
    // Show personalized recommendations
  }

  return createSuccessResponse(posts)
})
```

### Require Authentication (Protected Routes)

```typescript
import { requireAuth } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Safe to access user
  // event.context.user.id, .username, .role

  return createSuccessResponse({ message: `Hello, ${user.username}!` })
})
```

### Require Specific Role (Admin Routes)

```typescript
import { requireRole } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  // User has admin role
  // Perform admin action
})
```

### Require Any Role

```typescript
import { requireAnyRole } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  await requireAnyRole(event, ['admin', 'author'])

  // User has admin or author role
  // Perform action
})
```

---

## Error Responses

### Missing Authentication

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Invalid Token

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```

### Insufficient Role

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Role 'admin' required"
  }
}
```

---

## Artifacts Created

| Artifact     | Path                                       |
| ------------ | ------------------------------------------ |
| This summary | `.planning/phases/04-api/04-03-SUMMARY.md` |

---

## Next Steps

Proceed to Plan 04: Error handler + logger + rate-limit middleware

---

## Commit

```bash
feat(04-03): add JWT authentication middleware
```
