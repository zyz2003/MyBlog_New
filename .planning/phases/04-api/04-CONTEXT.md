# Phase 4: API 层 - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

实现 Nitro API 路由、中间件、服务层 — 为前台和后台提供数据接口。

**包含：**

- 文章、分类、标签、媒体、用户认证的 CRUD API
- 认证中间件、错误处理中间件、日志中间件
- 文件上传、图片处理
- API 验证和响应格式化

**不包含：**

- 后台管理 UI（Phase 5）
- 前台博客页面（Phase 6）
- 评论系统（可插拔，第三方服务或后续内置）
- 归档功能（已记录为待办，后续 Phase 实现）

</domain>

<decisions>
## Implementation Decisions

### API 路由组织

- 按资源分组：`/api/v1/posts`, `/api/v1/categories`, `/api/v1/tags`, `/api/v1/media`, `/api/v1/auth`
- URL 版本化：`/api/v1/...` 格式，为后续版本迭代预留空间
- 认证端点：`POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`

### 认证设计

- JWT Token 方案：登录后返回 token，后续请求携带 `Authorization: Bearer <token>`
- JWT 过期时间：30 天
- JWT secret 从环境变量读取
- 密码加密：bcrypt，cost=10
- 密码重置：后台管理手动重置（管理员操作）

### 请求验证

- 使用 Zod 库进行 Schema 验证
- 每个 API 定义独立的 schema（如 `createPostSchema`, `updatePostSchema`）
- 中间件链：`auth → validate → route` 标准流程

### 错误处理

- 统一错误中间件捕获所有错误
- 响应格式：
  - 成功：`{ success: true, data: {...}, message?: string }`
  - 失败：`{ success: false, error: { code: string, message: string } }`
- 自定义错误码：如 `POST_NOT_FOUND`, `VALIDATION_ERROR`, `UNAUTHORIZED`
- HTTP 状态码配合使用：200/201/400/401/404/500

### 列表分页与筛选

- Offset 分页：`?limit=10&offset=0`
- 查询参数筛选：`?category=xxx&tag=xxx&status=draft&search=keyword`
- 查询参数排序：`?sort=createdAt&order=desc`
- 列表响应格式：`{ success: true, data: [], meta: { total, limit, offset } }`

### 文件上传

- Multipart/form-data 标准上传
- 可插拔存储：本地存储（`uploads/` 目录）+ 对象存储（阿里云 OSS/腾讯云 COS）可切换
- 配置存数据库，大文件存路径
- 支持批量上传
- 上传时生成缩略图 + 原图

### 权限控制

- 简单登录检查：后台 API 要求登录即可
- 不需要细粒度角色权限（博客主自己管理）
- 基于 JWT 的认证中间件

### 日志与限流

- 请求日志：记录 method, path, status, duration
- 简单限流：每 IP 每分钟 100 次请求

### 数据库事务

- 文章 + 标签关联操作时使用事务（创建/更新文章时同时操作 posts 和 post_tags 表）

### 内容存储

- 存储原始 Markdown
- 性能优先：同时缓存渲染后的 HTML
- Markdown 扩展：支持前端组件语法 `[组件名]`
- 代码高亮：使用 Shiki 库（基于 VS Code 主题）

### 文章功能

- 草稿状态：`status` 字段（draft/published）
- Slug：标题自动生成（中文转拼音）+ 唯一性检查
- 发布时间：`createdAt` 创建时间，`publishedAt` 发布时间分离
- 字数统计：保存时自动计算存入 `wordCount` 字段
- 置顶功能：`isPinned` 字段 + `pinnedAt` 时间
- 删除：硬删除（物理删除）
- 并发控制：乐观锁（version 字段）

### SEO 与分享

- 完整 SEO 字段：title, description, keywords, ogImage
- 社交媒体分享：预留扩展点，支持分享卡片预览
- RSS/Atom Feed：需要实现

### 缓存

- HTTP 缓存头：公开文章加 ETag/Last-Modified

### 第三方集成

- 用户头像：支持 Gravatar（邮箱哈希）和本地上传两种方式
- 浏览量统计：简单计数字段 + 预留第三方集成接口
- API Key 存储：加密存储

### 搜索

- LIKE 搜索：`?q=keyword` 查询标题/内容
- 搜索防抖：500ms

### 评论系统

- 可插拔设计：第三方评论（Twikoo/Valine/Disqus）或内置评论
- 当前 Phase 不实现评论 API

### 归档功能

- 按年/月归档统计
- 已记录为待办事项，后续 Phase 实现

### Swagger 文档

- 需要生成 OpenAPI/Swagger UI 文档

### CORS

- 开发阶段完全开放

### 批量操作

- 批量删除、批量发布/下架

### 备份

- 手动导出数据库为 JSON/SQL

### 配置存储

- 主题配置、插件配置：混合存储（配置存数据库，大文件存路径）

### 预览

- 草稿预览：后台内预览，不生成公开链接

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- `packages/database/src/schema/*` — 完整 Schema 定义（users, posts, categories, tags, media, postTags）
- `packages/database/src/db.ts` — 数据库连接实例，带重试逻辑
- `packages/database/src/index.ts` — 统一的导出入口
- `apps/site/composables/useTheme.ts` — 主题 composables（唯一现有 composable）

### Established Patterns

- Drizzle ORM 类型定义：`type User = typeof users.$inferSelect`
- 数据库实例获取：`db.get()` 懒加载模式
- 工作区包别名：`@my-blog/database` → `packages/database/src/index.ts`

### Integration Points

- API 目录空白：`apps/site/server/` 等待实现
- 中间件目录空白：`apps/site/middleware/` 等待实现
- 数据库连接：通过 `@my-blog/database` 包导入

</code_context>

<specifics>
## Specific Ideas

- "后台是博客主自己管理，不需要细粒度的角色权限 — 简单登录检查就够了"
- "评论系统可以接第三方服务，不一定要自己实现"
- "访问性能优先" — 内容存储方案要兼顾性能
- "保证观感的同时，兼具性能" — SEO 元数据决策原则
- "可插拔存储" — 图片存储要支持本地和对象存储切换
- "可插拔评论" — 评论系统要支持第三方和内置切换

</specifics>

<deferred>
## Deferred Ideas

- **归档功能**：文章归档 API（按年/月归档统计）— 后续 Phase 实现（已记录为 todo）
- **评论系统**：可插拔设计，当前 Phase 不实现具体评论 API
- **定时发布**：`publishedAt` 字段支持未来时间，但定时任务触发是后续工作
- **全文搜索**：当前使用 LIKE 搜索，后续可升级 SQLite FTS5
- **双 Token 模式**：当前简单 JWT 30 天，后续可升级为 access+refresh 模式

</deferred>

---

_Phase: 04-api_
_Context gathered: 2026-03-19_
