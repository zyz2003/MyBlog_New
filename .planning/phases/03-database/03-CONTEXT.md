# Phase 3: Database Layer - Context

**Gathered:** 2026-03-18 (Updated)
**Status:** Ready for execution

<domain>
## Phase Boundary

完成数据库 Schema 设计、Drizzle ORM 配置和迁移脚本，为博客系统提供完整的数据存储能力。

**交付物:**

- SQLite 数据库连接配置（WAL 模式）
- Drizzle ORM 集成和类型定义
- 完整数据库 Schema（users, posts, categories, tags, post_tags, media）
- 数据库迁移脚本（支持回滚）
- 种子数据（管理员用户、默认分类、示例文章、示例标签）

</domain>

<decisions>
## Implementation Decisions

### Schema 设计

#### 用户表 (users)

- **字段**: id, username, email, password_hash, role, status, avatar, bio, website, last_login_at, last_login_ip, created_at
- **role 枚举**: admin, author, editor
- **status 枚举**: active, banned
- **唯一约束**: username UNIQUE, email UNIQUE

#### 文章表 (posts)

- **字段**: id, title, slug, content, excerpt, status, author_id, category_id, cover_image, seo_title, seo_description, view_count, like_count, published_at, created_at, updated_at
- **status 枚举**: draft, reviewing, published, archived
- **唯一约束**: slug UNIQUE
- **外键**: author_id → users(id), category_id → categories(id)

#### 分类表 (categories)

- **字段**: id, name, slug, description, parent_id, created_at
- **层级限制**: 最多 2 级（parent_id 允许 NULL，但子分类不能再有子分类）
- **唯一约束**: slug UNIQUE
- **外键**: parent_id → categories(id) ON DELETE SET NULL

#### 标签表 (tags)

- **字段**: id, name, slug, description, color, created_at
- **唯一约束**: slug UNIQUE
- **说明**: color 字段供前端展示使用，可选

#### 文章标签关联表 (post_tags)

- **字段**: id, post_id, tag_id, created_at
- **唯一约束**: (post_id, tag_id) 联合唯一
- **外键**: post_id → posts(id) ON DELETE CASCADE, tag_id → tags(id) ON DELETE CASCADE

#### 媒体表 (media)

- **字段**: id, filename, path, mime_type, size, alt_text, thumbnail_path, folder_id, uploaded_at
- **说明**: alt_text、thumbnail_path、folder_id 为扩展字段，前端可选择性使用

### 数据库连接配置

#### 连接方式

- **数据库路径**: 固定路径 `apps/site/data/blog.db`
- **连接模式**: 连接池（drizzle-orm + better-sqlite3 pool）
- **WAL 模式**: 启用（PRAGMA journal_mode = WAL）

#### 错误处理

- **重试策略**: 失败后重试 3 次，每次间隔 100ms
- **错误日志**: 打印详细错误日志到控制台

#### SQL 日志

- **日志策略**: 慢查询日志（阈值 >100ms）
- **开发环境**: 开启所有 SQL 日志
- **生产环境**: 仅慢查询日志

### 索引策略

**常用查询字段创建索引:**

- users: username, email
- posts: slug, status, author_id, created_at, category_id
- categories: slug
- tags: slug
- post_tags: post_id, tag_id

### 外键删除策略（Claude's Discretion）

- **posts 表**: author_id ON DELETE CASCADE（删除用户时级联删除文章）
- **categories 表**: parent_id ON DELETE SET NULL（删除父分类时子分类置为顶层）
- **post_tags 表**: post_id/tag_id ON DELETE CASCADE（删除文章或标签时级联删除关联）
- **media 表**: 无外键依赖

### 审计字段（Claude's Discretion）

- **所有表**: created_at, updated_at（基础时间戳）
- **posts 表**: 额外增加 published_at
- **users 表**: 额外增加 last_login_at

### 唯一约束（Claude's Discretion）

- **users**: username, email
- **posts**: slug
- **categories**: slug
- **tags**: slug
- **post_tags**: (post_id, tag_id) 联合唯一

### CHECK 约束（Claude's Discretion）

- **posts.status**: CHECK(status IN ('draft', 'reviewing', 'published', 'archived'))
- **users.role**: CHECK(role IN ('admin', 'author', 'editor'))
- **users.status**: CHECK(status IN ('active', 'banned'))
- **media.size**: CHECK(size >= 0)

### 迁移脚本策略

- **命名规范**: 时间戳命名（如 `20260318120000_create_users.ts`）
- **回滚策略**: 完整回滚（每个迁移必须定义 down() 函数）
- **数据分离**: 统一种子文件，通过环境变量控制加载（NODE_ENV=development 加载示例数据）

### 种子数据内容

- **管理员账户**: username: admin, email: admin@example.com, password: [占位符，首次启动强制修改]
- **默认分类**: 3 个预设分类
  - 技术（slug: tech）
  - 生活（slug: life）
  - 随笔（slug: essays）
- **示例文章**: 3-5 篇示例文章，填充不同分类便于测试
- **示例标签**: 5-8 个预设标签（JavaScript, Vue, Nuxt, Tutorial, Life 等）

### 软删除策略

- **策略**: 物理删除，不需要软删除功能

### Claude's Discretion

以下区域由 Claude 在规划/实施时自行决定（已在上方记录具体决策）：

- 外键删除策略的具体设计
- 审计字段的完整设计
- 唯一约束的完整设计
- CHECK 约束的完整设计
- 数据分离的具体实现方式

</decisions>

<code_context>

## Existing Code Insights

### 项目当前状态

- **Monorepo 结构**: pnpm workspace 已配置
- **packages/database**: 骨架已创建，依赖已安装（drizzle-orm, better-sqlite3）
- **packages/core**: 已完成 ThemeManager 和 HookRegistry（Phase 2）

### 复用资产

- **TypeScript 基础**: 严格模式配置完成
- **包结构**: tsup 构建配置已完成

### 集成点

- 插件配置存储需要与 SQLite 数据库集成（Phase 2 决策：混合存储）
- 数据库连接配置需要与 Nuxt 3 应用集成
- 迁移脚本需要与 CI/CD 集成

</code_context>

<specifics>
## Specific Ideas

- 数据库设计需要预留扩展性（如评论、SEO 等未来功能）
- 所有 Schema 必须使用 TypeScript 类型定义
- 标签的 color 字段、媒体的 alt_text 等扩展字段"留备用，前端可选择性展示"
- 方便后续维护和扩展

</specifics>

<deferred>
## Deferred Ideas

- 评论系统 Schema — 未来 Phase
- 多语言国际化支持 — v1 仅支持中文，Schema 预留 i18n 字段
- 用户关注/粉丝关系表 — 未来社交功能 Phase

</deferred>

---

_Phase: 03-database_
_Context gathered: 2026-03-17, Updated: 2026-03-18_
