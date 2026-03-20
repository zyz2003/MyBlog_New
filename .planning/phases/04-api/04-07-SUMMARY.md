---
phase: 04-api
plan: 07
status: complete
completed_at: '2026-03-20T21:00:00.000Z'
requirements:
  - API-05
---

# Plan 07: Auth API - me and register

## Objective

实现认证 API：获取当前用户、用户注册

## Files Created

1. **`apps/site/server/api/v1/auth/me.get.ts`** - GET /api/v1/auth/me
   - 需要 JWT 认证（受保护的路由）
   - 从 event.context.user 返回当前用户信息
   - 返回 { success: true, data: { user } }

2. **`apps/site/server/api/v1/auth/register.post.ts`** - POST /api/v1/auth/register
   - 使用 validateBodySync + registerSchema 验证请求体
   - 检查用户名是否已存在
   - 使用 bcrypt 加密密码
   - 创建用户并返回 201

## Files Modified

1. **`apps/site/server/utils/error.ts`**
   - 添加 `HTTPError.CONFLICT()` 静态方法（409）
   - 添加 `CONFLICT` 错误代码常量

## Verification

- [x] me.get.ts created
- [x] register.post.ts created
- [x] Tests pass (120/120)
- [x] TypeScript type check passed
- [x] ESLint passed

## Test Coverage

- GET /api/v1/auth/me with valid token returns current user
- GET /api/v1/auth/me without token returns 401
- POST /api/v1/auth/register creates user and returns 201
- POST /api/v1/auth/register with duplicate username returns 409
- POST /api/v1/auth/register with duplicate email returns 409

## Commit

```
44782a9 fix(04-07): add HTTPError.CONFLICT method for duplicate user handling
```

## Notes

- Plan 07 在执行过程中发现 HTTPError.CONFLICT 方法缺失
- 已添加该方法并修复 eslint 问题
- 所有 120 个测试通过
