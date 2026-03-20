---
phase: 04-api
plan: 06
type: execute
status: completed
completed_at: 2026-03-20
---

# Phase 4 Plan 06: 认证 API（登录、登出）- 执行总结

## 概述

实现了完整的用户认证 API，包括登录和登出功能。

**Purpose:** 提供用户认证功能，用户可以使用用户名和密码登录获取 JWT token，并通过登出来使 token 失效。

**Output:** 1 个服务文件，2 个 API 端点，完整的测试覆盖

---

## 执行的任务

### Task 1: Create auth service ✅

**文件:** `apps/site/server/services/auth.service.ts`

**交付内容:**

- `hashPassword(password: string): Promise<string>` - 使用 bcrypt 加密密码（cost=10）
- `verifyPassword(password: string, hash: string): Promise<boolean>` - 验证密码
- `login(username: string, password: string): Promise<{ token, user }>` - 用户登录
- `logout(token: string): Promise<void>` - 登出（将 token 加入黑名单）
- `generateToken(user): Promise<string>` - 生成 JWT token（30 天有效期）
- `isTokenBlacklisted(token: string): boolean` - 检查 token 是否在黑名单中
- `setDatabaseInstance(db)` / `resetDatabaseInstance()` - 测试支持函数

**测试:** 15 个测试用例全部通过

- hashPassword 返回 bcrypt hash（非明文）
- hashPassword 为相同密码生成不同 hash
- verifyPassword 正确密码返回 true
- verifyPassword 错误密码返回 false
- verifyPassword 空密码返回 false
- generateToken 生成有效 JWT token
- generateToken 支持不带 email
- isTokenBlacklisted 正确识别黑名单
- login 返回 token 和 user
- login 不存在的用户抛 401
- login 错误密码抛 401
- login 被禁用的用户抛 401
- logout 将 token 加入黑名单
- logout 可处理多次登出

### Task 2: Create login/logout endpoints ✅

**文件:**

- `apps/site/server/api/v1/auth/login.post.ts`
- `apps/site/server/api/v1/auth/logout.post.ts`

**login.post.ts:**

- 使用 `readBody` 解析请求体
- 使用 `validateBodySync` 验证 loginSchema
- 调用 `auth.service.login()` 进行认证
- 返回 `{ success: true, data: { token, user }, message: 'Login successful' }`

**logout.post.ts:**

- 使用 `requireAuth` 要求认证
- 从 Authorization header 提取 token
- 调用 `auth.service.logout()` 将 token 加入黑名单
- 返回 `{ success: true, message: 'Logged out successfully' }`

**测试:** 10 个测试用例全部通过

- loginSchema 接受有效数据
- loginSchema 拒绝空用户名
- loginSchema 拒绝空密码
- loginSchema 拒绝短密码
- loginSchema 拒绝特殊字符用户名
- login endpoint 返回 token 和 user
- login endpoint 错误密码抛 401
- logout endpoint 黑名单 token
- logout endpoint 返回成功消息
- JWT token 生成正常

---

## 文件清单

### 创建的文件

| 文件                                                   | 行数 | 描述             |
| ------------------------------------------------------ | ---- | ---------------- |
| `apps/site/server/services/auth.service.ts`            | 200+ | 认证服务核心逻辑 |
| `apps/site/server/api/v1/auth/login.post.ts`           | 35   | 登录 API 端点    |
| `apps/site/server/api/v1/auth/logout.post.ts`          | 30   | 登出 API 端点    |
| `apps/site/tests/server/services/auth.service.test.ts` | 210  | 服务层测试       |
| `apps/site/tests/server/api/auth.test.ts`              | 140  | API 逻辑测试     |

### 修改的文件

| 文件                                 | 修改内容                                         |
| ------------------------------------ | ------------------------------------------------ |
| `apps/site/server/utils/validate.ts` | 添加 `readBody` 导入，简化 `validateRequestBody` |
| `apps/site/package.json`             | 添加 `bcryptjs` 依赖                             |

---

## 验证结果

### 测试通过情况

```
Test Files: 9 passed (9)
Tests: 105 passed (105)
Duration: ~2s
```

**新增测试:** 25 个（auth.service.test.ts 15 个 + auth.test.ts 10 个）

### 类型检查

```bash
pnpm type-check # ✅ 通过
```

---

## 需求满足情况

### Must-haves (全部完成)

- ✅ User can login with username and password to receive JWT token
- ✅ Invalid credentials return 401 with clear error message
- ✅ Logout invalidates the token session
- ✅ Password is never returned in any response

### Artifacts (全部完成)

- ✅ `auth.service.ts` - 提供认证业务逻辑，导出 login, logout, hashPassword, verifyPassword
- ✅ `login.post.ts` - POST /api/v1/auth/login endpoint

### Key Links (全部完成)

- ✅ `auth.service.ts` → `jose.SignJWT` - token generation
- ✅ `auth.service.ts` → `bcryptjs.compare` - password verification

---

## 技术实现细节

### JWT 配置

```typescript
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me-in-production')
const JWT_EXPIRY = '30d'
```

### Bcrypt 配置

```typescript
const BCRYPT_COST = 10
```

### Token 黑名单

使用 in-memory Set 存储已登出的 token。生产环境中建议使用 Redis 存储，设置 TTL 与 token 过期时间一致。

### 数据库集成

- login 时更新用户的 lastLoginAt 和 updatedAt 字段
- 支持测试模式：通过 `setDatabaseInstance()` 注入测试数据库

---

## API 使用示例

### 登录

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

### 登出

```bash
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 安全考虑

1. **密码加密**: 使用 bcrypt 加密，cost=10
2. **密码验证**: 统一错误消息 "Invalid username or password" 防止用户名枚举
3. **Token 过期**: JWT 30 天过期
4. **Token 黑名单**: 登出后立即将 token 加入黑名单
5. **敏感字段保护**: 密码永远不会在任何响应中返回

---

## 下一步

- [ ] 实现注册 API（register.post.ts）
- [ ] 实现获取当前用户信息 API（me.get.ts）
- [ ] 实现密码重置功能
- [ ] 将 token 黑名单持久化到 Redis

---

**API-05 需求完成** ✅
