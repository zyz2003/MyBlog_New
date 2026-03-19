# Phase 4: API 层 - Research

**Researched:** 2026-03-19
**Domain:** Nitro Server API, JWT Authentication, Zod Validation, File Upload
**Confidence:** HIGH

## Summary

本 Phase 实现博客系统的完整 API 层，基于 Nuxt 3 内置的 Nitro 服务器。核心技术栈包括：

- **Nitro Server** - Nuxt 3 内置的服务端框架，提供自动路由、类型生成、热重载
- **h3** - Nitro 底层 HTTP 框架，提供事件处理、中间件、响应工具
- **Drizzle ORM** - 类型安全的 ORM，已在 Phase 3 完成
- **Zod** - TypeScript 优先的 Schema 验证库
- **jose** - 现代 JWT 库（替代 jsonwebtoken），支持 Web Crypto API
- **bcryptjs** - 密码哈希加密

**Primary recommendation:** 遵循 Nuxt 3 约定式路由模式，使用 `server/api/` 目录组织 API，`server/middleware/` 处理全局中间件，`server/utils/` 抽取复用逻辑。

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **API 路由组织:** 按资源分组：`/api/v1/posts`, `/api/v1/categories`, `/api/v1/tags`, `/api/v1/media`, `/api/v1/auth`
- **URL 版本化:** `/api/v1/...` 格式，为后续版本迭代预留空间
- **认证端点:** `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`
- **JWT Token 方案:** 登录后返回 token，后续请求携带 `Authorization: Bearer <token>`
- **JWT 过期时间:** 30 天
- **JWT secret:** 从环境变量读取
- **密码加密:** bcrypt，cost=10
- **密码重置:** 后台管理手动重置（管理员操作）
- **请求验证:** 使用 Zod 库进行 Schema 验证
- **中间件链:** `auth → validate → route` 标准流程
- **错误处理:** 统一错误中间件捕获所有错误
- **响应格式:**
  - 成功：`{ success: true, data: {...}, message?: string }`
  - 失败：`{ success: false, error: { code: string, message: string } }`
- **HTTP 状态码:** 200/201/400/401/404/500
- **列表分页:** Offset 分页 `?limit=10&offset=0`
- **查询参数筛选:** `?category=xxx&tag=xxx&status=draft&search=keyword`
- **列表响应格式:** `{ success: true, data: [], meta: { total, limit, offset } }`
- **文件上传:** Multipart/form-data 标准上传
- **存储方案:** 本地存储（`uploads/` 目录）+ 对象存储（阿里云 OSS/腾讯云 COS）可切换
- **配置存数据库，大文件存路径**
- **支持批量上传**
- **上传时生成缩略图 + 原图**
- **权限控制:** 简单登录检查，不需要细粒度角色权限
- **请求日志:** 记录 method, path, status, duration
- **简单限流:** 每 IP 每分钟 100 次请求
- **数据库事务:** 文章 + 标签关联操作时使用事务
- **内容存储:** 存储原始 Markdown，同时缓存渲染后的 HTML
- **Markdown 扩展:** 支持前端组件语法 `[组件名]`
- **代码高亮:** 使用 Shiki 库
- **草稿状态:** `status` 字段（draft/published）
- **Slug:** 标题自动生成（中文转拼音）+ 唯一性检查
- **发布时间:** `createdAt` 创建时间，`publishedAt` 发布时间分离
- **字数统计:** 保存时自动计算存入 `wordCount` 字段
- **置顶功能:** `isPinned` 字段 + `pinnedAt` 时间
- **删除:** 硬删除（物理删除）
- **并发控制:** 乐观锁（version 字段）
- **完整 SEO 字段:** title, description, keywords, ogImage
- **HTTP 缓存头:** 公开文章加 ETag/Last-Modified
- **用户头像:** 支持 Gravatar（邮箱哈希）和本地上传两种方式
- **浏览量统计:** 简单计数字段 + 预留第三方集成接口
- **LIKE 搜索:** `?q=keyword` 查询标题/内容
- **搜索防抖:** 500ms
- **Swagger 文档:** 需要生成 OpenAPI/Swagger UI 文档
- **CORS:** 开发阶段完全开放
- **批量操作:** 批量删除、批量发布/下架

### Claude's Discretion

- 具体中间件实现细节
- 工具库选择（如 JWT 库选 jose 还是 jsonwebtoken）
- 图片处理库选择（sharp 等）
- 中文转拼音库选择
- Swagger 生成方案选择

### Deferred Ideas (OUT OF SCOPE)

- **归档功能:** 文章归档 API（按年/月归档统计）— 后续 Phase 实现
- **评论系统:** 可插拔设计，当前 Phase 不实现具体评论 API
- **定时发布:** `publishedAt` 字段支持未来时间，但定时任务触发是后续工作
- **全文搜索:** 当前使用 LIKE 搜索，后续可升级 SQLite FTS5
- **双 Token 模式:** 当前简单 JWT 30 天，后续可升级为 access+refresh 模式

## Standard Stack

### Core

| Library      | Version        | Purpose        | Why Standard                           |
| ------------ | -------------- | -------------- | -------------------------------------- |
| **Nitro**    | 2.x (built-in) | API 服务器框架 | Nuxt 3 内置，零配置，自动类型生成      |
| **h3**       | 1.x (built-in) | HTTP 工具层    | Nitro 底层框架，提供事件处理、中间件   |
| **Zod**      | 3.x            | Schema 验证    | TypeScript 优先，自动类型推导          |
| **jose**     | 5.x            | JWT 签名/验证  | 现代 Web Crypto API，替代 jsonwebtoken |
| **bcryptjs** | 2.x            | 密码哈希       | 纯 JS 实现，无原生依赖，cost=10        |

### Supporting

| Library                            | Version | Purpose      | When to Use                  |
| ---------------------------------- | ------- | ------------ | ---------------------------- |
| **drizzle-orm**                    | 0.x     | 数据库 ORM   | Phase 3 已安装，类型安全查询 |
| **pinyin-pro**                     | 3.x     | 中文转拼音   | 生成文章 slug                |
| **sharp**                          | 0.33.x  | 图片处理     | 缩略图生成，格式转换         |
| **shiki**                          | 1.x     | 代码高亮     | Markdown 渲染时高亮代码块    |
| **@web3-storage/multipart-parser** | 1.x     | 文件上传解析 | 处理 multipart/form-data     |

### Alternatives Considered

| Instead of     | Could Use    | Tradeoff                                                |
| -------------- | ------------ | ------------------------------------------------------- |
| jose           | jsonwebtoken | jose 更现代但 API 复杂；jsonwebtoken 更简单但已停止维护 |
| sharp          | jimp / gm    | sharp 性能最佳但需原生编译；jimp 纯 JS 但慢             |
| pinyin-pro     | node-pinyin  | pinyin-pro 更活跃，支持多音字；node-pinyin 较旧         |
| Zod            | Yup / Joi    | Zod TypeScript 支持最佳；Yup 更轻量                     |
| Nitro 内置存储 | Redis        | 内置存储简单够用；Redis 需额外部署但支持分布式          |

**Installation:**

```bash
cd apps/site
pnpm add zod jose bcryptjs pinyin-pro sharp shiki
pnpm add -D @types/bcryptjs
```

## Architecture Patterns

### Recommended Project Structure

```
apps/site/
├── server/
│   ├── api/
│   │   └── v1/
│   │       ├── auth/
│   │       │   ├── login.post.ts      # POST /api/v1/auth/login
│   │       │   ├── logout.post.ts     # POST /api/v1/auth/logout
│   │       │   └── me.get.ts          # GET /api/v1/auth/me
│   │       ├── posts/
│   │       │   ├── index.get.ts       # GET /api/v1/posts (list)
│   │       │   ├── index.post.ts      # POST /api/v1/posts (create)
│   │       │   ├── [id].get.ts        # GET /api/v1/posts/:id
│   │       │   ├── [id].put.ts        # PUT /api/v1/posts/:id
│   │       │   └── [id].delete.ts     # DELETE /api/v1/posts/:id
│   │       ├── categories/
│   │       │   ├── index.get.ts       # GET /api/v1/categories
│   │       │   └── ...
│   │       ├── tags/
│   │       │   ├── index.get.ts       # GET /api/v1/tags
│   │       │   └── ...
│   │       ├── media/
│   │       │   ├── index.get.ts       # GET /api/v1/media
│   │       │   ├── index.post.ts      # POST /api/v1/media (upload)
│   │       │   └── [id].delete.ts     # DELETE /api/v1/media/:id
│   │       └── admin/                 # 需要管理员权限的 API
│   ├── middleware/
│   │   ├── auth.ts                    # JWT 认证中间件（全局）
│   │   ├── cors.ts                    # CORS 中间件
│   │   ├── logger.ts                  # 请求日志中间件
│   │   ├── rate-limit.ts              # 限流中间件
│   │   └── error.ts                   # 错误处理中间件
│   ├── utils/
│   │   ├── response.ts                # 统一响应格式化
│   │   ├── error.ts                   # 错误类定义
│   │   ├── validate.ts                # Zod 验证中间件工厂
│   │   ├── upload.ts                  # 文件上传处理
│   │   ├── slug.ts                    # slug 生成工具
│   │   └── markdown.ts                # Markdown 渲染工具
│   ├── schemas/
│   │   ├── auth.ts                    # 认证相关 Schema
│   │   ├── post.ts                    # 文章相关 Schema
│   │   ├── category.ts                # 分类相关 Schema
│   │   ├── tag.ts                     # 标签相关 Schema
│   │   ├── media.ts                   # 媒体相关 Schema
│   │   └── common.ts                  # 通用 Schema（分页、响应）
│   ├── services/
│   │   ├── post.service.ts            # 文章业务逻辑
│   │   ├── auth.service.ts            # 认证业务逻辑
│   │   ├── media.service.ts           # 媒体业务逻辑
│   │   └── storage.service.ts         # 存储服务（本地/对象存储）
│   └── plugins/
│       └── swagger.ts                 # Swagger/OpenAPI 生成
├── uploads/                           # 本地文件上传目录
│   ├── original/                      # 原图
│   └── thumbnails/                    # 缩略图
└── nuxt.config.ts                     # Nitro 配置
```

### Pattern 1: Route Handler Pattern

**What:** Nitro 路由处理器标准模式
**When to use:** 所有 API 端点
**Example:**

```typescript
// server/api/v1/posts/index.get.ts
// Source: https://nuxt.com/docs/guide/directory-structure/server
import { z } from 'zod'
import { db } from '@my-blog/database'
import { posts, categories, tags, postTags } from '@my-blog/database/schema'
import { eq, desc, like, and, or } from 'drizzle-orm'
import { createSuccessResponse, createPaginationResponse } from '~/server/utils/response'
import { validateQuery } from '~/server/utils/validate'

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'publishedAt', 'viewCount']).default('publishedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export default defineEventHandler(async (event) => {
  const query = await getQuery(event)
  const { limit, offset, category, tag, status, search, sort, order } = validateQuery(
    query,
    listQuerySchema
  )

  // Build query conditions
  const conditions = []
  if (status) conditions.push(eq(posts.status, status))
  if (category) conditions.push(eq(posts.categoryId, category))
  if (search) {
    conditions.push(or(like(posts.title, `%${search}%`), like(posts.content, `%${search}%`)))
  }

  // Get total count
  const total = await db.$count(posts, conditions.length ? and(...conditions) : undefined)

  // Execute query with relations
  const postList = await db.query.posts.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: {
      author: { columns: { id: true, username: true, avatar: true } },
      category: { columns: { id: true, name: true, slug: true } },
      postTags: { with: { tag: { columns: { id: true, name: true, slug: true } } } },
    },
    orderBy: order === 'desc' ? desc(posts[sort]) : posts[sort],
    limit,
    offset,
  })

  return createPaginationResponse(postList, { total, limit, offset })
})
```

### Pattern 2: Auth Middleware Pattern

**What:** JWT 认证中间件
**When to use:** 需要登录的 API 端点
**Example:**

```typescript
// server/middleware/auth.ts
// Source: https://h3.unjs.io/guide/middleware
import { jwtVerify } from 'jose'
import { HTTPError } from '~/server/utils/error'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me')

export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const path = event.path
  const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/register']
  const publicPrefixes = ['/api/v1/posts', '/api/v1/categories', '/api/v1/tags']

  if (publicPaths.includes(path)) return
  if (publicPrefixes.some((prefix) => path.startsWith(prefix) && !path.includes('/admin'))) {
    // Public routes - just attach user if token exists
    await optionalAuth(event)
    return
  }

  // Protected routes - require auth
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header')
  }

  const token = authHeader.slice(7)
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    // Attach user to context
    event.context.user = {
      id: payload.sub as string,
      role: payload.role as string,
    }
  } catch {
    throw new HTTPError(401, 'INVALID_TOKEN', 'Token verification failed')
  }
})

async function optionalAuth(event: any) {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) return

  try {
    const { payload } = await jwtVerify(authHeader.slice(7), JWT_SECRET)
    event.context.user = { id: payload.sub as string, role: payload.role as string }
  } catch {
    // Ignore invalid tokens for public routes
  }
}
```

### Pattern 3: Zod Validation Middleware

**What:** 请求体验证中间件
**When to use:** POST/PUT 请求
**Example:**

```typescript
// server/utils/validate.ts
// Source: https://zod.dev/
import { z, ZodError } from 'zod'
import { HTTPError } from './error'

export function validateBody<T extends z.ZodType>(body: unknown, schema: T): z.infer<T> {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      throw new HTTPError(400, 'VALIDATION_ERROR', 'Request validation failed', fieldErrors)
    }
    throw error
  }
}

export function validateQuery<T extends z.ZodType>(query: unknown, schema: T): z.infer<T> {
  return validateBody(query, schema)
}

export function validateParams<T extends z.ZodType>(params: unknown, schema: T): z.infer<T> {
  return validateBody(params, schema)
}
```

### Pattern 4: Unified Response Format

**What:** 统一响应格式化
**When to use:** 所有 API 响应
**Example:**

```typescript
// server/utils/response.ts
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}

interface PaginationResponse<T> {
  success: true
  data: T[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return { success: true, data, message }
}

export function createPaginationResponse<T>(
  data: T[],
  meta: { total: number; limit: number; offset: number }
): PaginationResponse<T> {
  return { success: true, data, meta }
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>
): ErrorResponse {
  return { success: false, error: { code, message, details } }
}
```

### Pattern 5: File Upload Pattern

**What:** multipart/form-data 文件上传处理
**When to use:** 媒体上传 API
**Example:**

```typescript
// server/api/v1/media/index.post.ts
import { readMultipartFormData } from 'h3'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  await requireAuth(event) // Require login

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'No files uploaded' })
  }

  const uploadedFiles = []
  for (const part of formData) {
    if (!part.filename) continue

    const fileId = nanoid()
    const ext = part.filename.split('.').pop() || 'jpg'
    const filename = `${fileId}.${ext}`

    // Save original
    const originalPath = join(process.cwd(), 'uploads', 'original', filename)
    await mkdir(dirname(originalPath), { recursive: true })
    await writeFile(originalPath, part.data)

    // Generate thumbnail
    const thumbnailPath = join(process.cwd(), 'uploads', 'thumbnails', filename)
    await mkdir(dirname(thumbnailPath), { recursive: true })
    await sharp(part.data).resize(300, 200, { fit: 'cover' }).toFile(thumbnailPath)

    // Save to database
    const media = await db
      .insert(mediaTable)
      .values({
        id: fileId,
        filename,
        originalName: part.filename,
        path: originalPath,
        url: `/uploads/original/${filename}`,
        thumbnailPath: `/uploads/thumbnails/${filename}`,
        mimeType: part.type || 'application/octet-stream',
        size: part.data.length,
        uploadedBy: event.context.user.id,
      })
      .returning()

    uploadedFiles.push(media[0])
  }

  return createSuccessResponse(uploadedFiles)
})
```

### Anti-Patterns to Avoid

- **直接返回数据库对象:** 总是格式化响应，过滤敏感字段（如 passwordHash）
- **在路由中写业务逻辑:** 业务逻辑应该放在 `server/services/` 中
- **缺少事务处理:** 文章 + 标签关联操作必须使用事务
- **硬编码错误信息:** 使用统一的错误类和错误码
- **手动拼接 SQL:** 始终使用 Drizzle ORM 的类型安全查询
- **忽略并发控制:** 更新操作检查 version 字段防止覆盖

## Don't Hand-Roll

| Problem      | Don't Build          | Use Instead             | Why                                      |
| ------------ | -------------------- | ----------------------- | ---------------------------------------- |
| JWT 签名验证 | 自己实现 HMAC        | jose                    | 安全敏感，容易出错，jose 支持 Web Crypto |
| 密码哈希     | 自己实现加密算法     | bcryptjs                | 密码学复杂，bcrypt 是行业标准            |
| Schema 验证  | 手动 if 判断检查     | Zod                     | 类型推导，统一错误处理，可复用           |
| 图片处理     | 自己调用 ImageMagick | sharp                   | 性能最佳，API 简洁，支持格式多           |
| 中文转拼音   | 自己实现拼音映射     | pinyin-pro              | 多音字处理，词组识别，维护活跃           |
| 代码高亮     | 自己写正则匹配       | shiki                   | VS Code 同源，主题丰富，准确             |
| 唯一 ID 生成 | 时间戳+ 随机数       | nanoid                  | 碰撞概率更低，URL 安全                   |
| 事务管理     | 手动 BEGIN/COMMIT    | drizzle-orm transaction | 类型安全，自动回滚，API 简洁             |
| CORS 处理    | 手动设置 headers     | h3 cors 中间件          | 处理预检请求，标准实现                   |
| 限流         | 自己记录 IP 计数     | h3-rate-limiter         | 支持 Redis 后端，分布式友好              |

**Key insight:** 这些库都经过生产验证，自己实现的成本远高于使用库，且安全性和可靠性无法保证。

## Common Pitfalls

### Pitfall 1: JWT Secret 硬编码

**What goes wrong:** JWT secret 硬编码在代码中，泄露后无法撤销
**Why it happens:** 开发时为了方便直接写死
**How to avoid:** 从环境变量读取，`.env` 文件加入 `.gitignore`
**Warning signs:** 代码中出现 `'my-secret-key'` 等字面量

### Pitfall 2: 密码明文存储

**What goes wrong:** 用户密码未哈希直接存数据库
**Why it happens:** 忘记调用 bcrypt.hash()
**How to avoid:** 在 Service 层统一处理，创建/更新用户时检查密码是否已哈希
**Warning signs:** 数据库中能看到可读密码

### Pitfall 3: SQL 注入

**What goes wrong:** 用户输入直接拼接到 SQL 中
**Why it happens:** 使用模板字符串拼接查询
**How to avoid:** 始终使用 Drizzle ORM 的参数化查询
**Warning signs:** 代码中出现 `` `SELECT * FROM ${table}` ``

### Pitfall 4: 事务未提交/回滚

**What goes wrong:** 部分操作成功，部分失败，数据不一致
**Why it happens:** 忘记 await 或 try-catch 中未调用 rollback
**How to avoid:** 使用 `db.transaction(async (tx) => {...})` 模式，异常自动回滚
**Warning signs:** 多表操作没有事务包裹

### Pitfall 5: 文件上传无限制

**What goes wrong:** 攻击者上传超大文件耗尽磁盘
**Why it happens:** 未设置文件大小限制
**How to avoid:** 中间件检查 `Content-Length`，sharp 限制尺寸
**Warning signs:** 上传接口没有大小校验

### Pitfall 6: N+1 查询问题

**What goes wrong:** 查询文章列表后，循环查询每篇文章的标签
**Why it happens:** 没有使用 Drizzle 的 relations
**How to avoid:** 使用 `db.query.posts.findMany({ with: { postTags: true } })`
**Warning signs:** 循环中执行数据库查询

### Pitfall 7: 中文 Slug 乱码

**What goes wrong:** 中文标题生成的 slug 是 `%E4%B8%AD%E6%96%87` 形式
**Why it happens:** 使用 encodeURIComponent 而非拼音转换
**How to avoid:** 使用 `pinyin-pro` 转换为拼音后 slugify
**Warning signs:** URL 中包含 `%` 编码字符

### Pitfall 8: 缓存未失效

**What goes wrong:** 文章更新后，缓存还是旧版本
**Why it happens:** 未清理或更新缓存
**How to avoid:** 使用 Nitro 存储 API，更新时删除旧 key
**Warning signs:** 修改后刷新多次才生效

## Code Examples

### Authentication Service

```typescript
// server/services/auth.service.ts
// Source: https://github.com/panva/jose
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { db } from '@my-blog/database'
import { users } from '@my-blog/database/schema'
import { eq } from 'drizzle-orm'
import { HTTPError } from '~/server/utils/error'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me')
const BCRYPT_COST = 10
const TOKEN_EXPIRY = '30d'

export async function login(username: string, password: string) {
  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user) {
    throw new HTTPError(401, 'INVALID_CREDENTIALS', 'Username or password is incorrect')
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new HTTPError(401, 'INVALID_CREDENTIALS', 'Username or password is incorrect')
  }

  // Generate JWT
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)

  // Update last login
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      lastLoginIp: 'TODO: get from request',
    })
    .where(eq(users.id, user.id))

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  }
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.sub as string,
      role: payload.role as string,
    }
  } catch {
    throw new HTTPError(401, 'INVALID_TOKEN', 'Token verification failed')
  }
}
```

### Post Service with Transaction

```typescript
// server/services/post.service.ts
// Source: https://orm.drizzle.team/docs/transactions
import { db } from '@my-blog/database'
import { posts, postTags } from '@my-blog/database/schema'
import { eq, and } from 'drizzle-orm'
import { HTTPError } from '~/server/utils/error'

export async function createPost(data: {
  title: string
  content: string
  authorId: string
  categoryId?: string
  tagIds?: string[]
  status?: 'draft' | 'published'
}) {
  // Generate slug
  const slug = await generateSlug(data.title)

  // Calculate word count
  const wordCount = countWords(data.content)

  // Use transaction for post + tags
  const [newPost] = await db.transaction(async (tx) => {
    // Create post
    const [post] = await tx
      .insert(posts)
      .values({
        ...data,
        slug,
        wordCount,
      })
      .returning()

    // Create post-tag relations
    if (data.tagIds?.length) {
      await tx.insert(postTags).values(data.tagIds.map((tagId) => ({ postId: post.id, tagId })))
    }

    return [post]
  })

  return getPostWithRelations(newPost.id)
}

export async function updatePost(
  id: string,
  data: Partial<{
    title: string
    content: string
    categoryId?: string
    tagIds?: string[]
    status?: 'draft' | 'published'
  }>
) {
  // Get current post for version check
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) })
  if (!existing) {
    throw new HTTPError(404, 'POST_NOT_FOUND', 'Post not found')
  }

  // Generate new slug if title changed
  const updates: any = { ...data }
  if (data.title && data.title !== existing.title) {
    updates.slug = await generateSlug(data.title)
  }

  // Calculate word count if content changed
  if (data.content) {
    updates.wordCount = countWords(data.content)
  }

  await db.transaction(async (tx) => {
    // Update post
    await tx
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(posts.id, id), eq(posts.version, existing.version)))

    // Update tags
    if (data.tagIds !== undefined) {
      // Delete old relations
      await tx.delete(postTags).where(eq(postTags.postId, id))
      // Create new relations
      if (data.tagIds.length) {
        await tx.insert(postTags).values(data.tagIds.map((tagId) => ({ postId: id, tagId })))
      }
    }
  })

  return getPostWithRelations(id)
}
```

### Validation Schemas

```typescript
// server/schemas/post.ts
// Source: https://zod.dev/
import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  isPinned: z.boolean().default(false),
})

export const updatePostSchema = createPostSchema.partial()

export const postQuerySchema = z.object({
  id: z.string(),
})

export const listPostsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'publishedAt', 'viewCount']).default('publishedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})
```

## State of the Art

| Old Approach          | Current Approach         | When Changed   | Impact                               |
| --------------------- | ------------------------ | -------------- | ------------------------------------ |
| jsonwebtoken          | jose                     | 2023+          | 更好的 Web Crypto 支持，Tree-shaking |
| express + body-parser | Nitro + h3               | 2022+ (Nuxt 3) | 零配置，自动类型生成                 |
| Sequelize/TypeORM     | Drizzle ORM              | 2023+          | 更轻量，类型推导更好                 |
| class-validator       | Zod                      | 2022+          | 更简洁的 API，更好的 TS 支持         |
| multer                | h3 readMultipartFormData | 2024+          | 内置支持，无需额外依赖               |
| node-crypto           | bcryptjs                 | 2020+          | 无原生依赖，跨平台一致               |
| node-imagemagick      | sharp                    | 2020+          | 性能提升 5-10 倍                     |
| manual pagination     | cursor/offset helpers    | 2024+          | 统一分页逻辑，减少重复代码           |

**Deprecated/outdated:**

- **jsonwebtoken:** 已停止维护，存在安全漏洞风险 → 使用 jose
- **multer:** Express 专用，Nitro 环境不兼容 → 使用 h3 内置解析
- **express-validator:** 额外依赖，Zod 更轻量 → 使用 Zod
- **bcrypt (native):** 原生编译问题 → 使用 bcryptjs

## Open Questions

1. **Swagger 生成方案选择**
   - 选项 1: `swagger-ui-express` + 手动编写 OpenAPI JSON
   - 选项 2: `@asteasolutions/zod-to-openapi` 从 Zod schema 自动生成
   - 推荐：选项 2，Zod schema 为唯一事实来源，减少维护成本

2. **对象存储集成方案**
   - 选项 1: 阿里云 OSS SDK
   - 选项 2: AWS S3 SDK (兼容 MinIO/COS)
   - 推荐：选项 2，使用 `@aws-sdk/client-s3`，兼容多家服务

3. **缓存策略**
   - 当前：使用 Nitro 内置存储（内存/文件系统）
   - 后续：是否需要 Redis 支持分布式缓存
   - 推荐：当前 Phase 使用内置存储，预留 Redis 切换接口

4. **图片处理时机**
   - 选项 1: 上传时立即生成所有尺寸缩略图
   - 选项 2: 按需生成（首次请求时生成并缓存）
   - 推荐：选项 1，简单可靠，避免请求延迟

## Validation Architecture

### Test Framework

| Property           | Value                                          |
| ------------------ | ---------------------------------------------- |
| Framework          | Vitest (Nuxt 3 内置)                           |
| Config file        | `apps/site/vitest.config.ts` (待创建 - Wave 0) |
| Quick run command  | `pnpm -r test --filter=@my-blog/site`          |
| Full suite command | `pnpm test`                                    |

### Phase Requirements → Test Map

| Req ID | Behavior       | Test Type   | Automated Command                 | File Exists? |
| ------ | -------------- | ----------- | --------------------------------- | ------------ |
| API-01 | Nitro 路由配置 | unit        | `pnpm test server/api`            | ❌ Wave 0    |
| API-02 | 文章 CRUD API  | integration | `pnpm test posts.test.ts`         | ❌ Wave 0    |
| API-03 | 分类标签 API   | integration | `pnpm test categories.test.ts`    | ❌ Wave 0    |
| API-04 | 媒体上传 API   | integration | `pnpm test media.test.ts`         | ❌ Wave 0    |
| API-05 | JWT 认证 API   | integration | `pnpm test auth.test.ts`          | ❌ Wave 0    |
| API-06 | 插件管理 API   | integration | `pnpm test plugins.test.ts`       | ❌ Wave 0    |
| API-07 | 主题切换 API   | integration | `pnpm test themes.test.ts`        | ❌ Wave 0    |
| API-08 | 错误处理中间件 | unit        | `pnpm test error-handler.test.ts` | ❌ Wave 0    |
| API-09 | Zod 请求验证   | unit        | `pnpm test validation.test.ts`    | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `pnpm -r test --filter=@my-blog/site`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/site/vitest.config.ts` — Vitest 配置
- [ ] `apps/site/tests/server/` — 服务器测试目录
- [ ] `apps/site/tests/server/helpers.ts` — 测试工具（模拟请求、认证）
- [ ] Framework install: Vitest 已随 Nuxt 3 内置

## Sources

### Primary (HIGH confidence)

- [Nuxt 3 Server Directory](https://nuxt.com/docs/guide/directory-structure/server) - API 路由约定
- [h3 Documentation](https://h3.unjs.io/) - HTTP 工具层 API
- [Nitro Guide](https://nitro.unjs.io/guide) - Nitro 服务器框架
- [Drizzle ORM Docs](https://orm.drizzle.team/) - ORM 查询和事务
- [Zod Documentation](https://zod.dev/) - Schema 验证
- [jose GitHub](https://github.com/panva/jose) - JWT 库

### Secondary (MEDIUM confidence)

- WebSearch: Nuxt 3 Nitro API patterns 2025
- WebSearch: Drizzle ORM SQLite examples
- WebSearch: Sharp image processing Node.js

### Tertiary (LOW confidence)

- WebSearch: Nitro OpenAPI/Swagger integration (需要验证具体实现方案)
- WebSearch: h3 rate limiting middleware (需要验证是否有官方库)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - 基于官方文档和项目 CLAUDE.md 约定
- Architecture: HIGH - 遵循 Nuxt 3 约定式目录结构
- Pitfalls: HIGH - 基于常见开发陷阱和最佳实践

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (3 months - Nitro/Nuxt APIs are stable)
