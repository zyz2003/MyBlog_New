# Phase 3: Database Layer - Technical Research

## Research Goals

1. SQLite 最佳实践（WAL 模式、并发处理）
2. Drizzle ORM 在 Nuxt 3 中的集成方式
3. Schema 设计模式和关联关系处理
4. 迁移脚本生成和执行策略

---

## 1. SQLite Database Configuration

### WAL Mode Benefits

Write-Ahead Logging (WAL) 模式相比传统 DELETE 模式的优势：

- **并发读取**: 允许多个读取者同时访问数据库，不会阻塞写入
- **性能提升**: 写入操作不阻塞读取，适合博客系统"读多写少"的场景
- **崩溃恢复**: 更好的崩溃恢复能力

### Configuration Code

```typescript
// packages/database/src/db.ts
import { Database } from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export function createDatabase(dbPath: string) {
  const db = new Database(dbPath)

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')

  // Optional: Increase cache size for better performance
  db.pragma('cache_size = -64000') // 64MB cache

  return drizzle(db, { schema })
}

export const db = createDatabase('./data/blog.db')
```

### Important Notes

- WAL 模式会生成额外的 `.wal` 和 `.shm` 文件
- 部署时需要确保这些文件可以被创建
- 备份时需要复制所有三个文件（.db, .wal, .shm）

---

## 2. Drizzle ORM Integration

### Package Setup

```json
{
  "name": "@my-blog/database",
  "version": "0.1.0",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts",
    "./drizzle": "./drizzle.config.ts"
  },
  "dependencies": {
    "drizzle-orm": "^0.29.0",
    "better-sqlite3": "^9.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

### Drizzle Kit Configuration

```typescript
// packages/database/drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/blog.db',
  },
} satisfies Config
```

### Usage in Nuxt App

```typescript
// apps/site/plugins/database.ts
import { db } from '@my-blog/database'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      db,
    },
  }
})
```

---

## 3. Schema Design Patterns

### Users Table (DB-03)

```typescript
// packages/database/src/schema/users.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'editor', 'author'] })
    .default('author')
    .notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### Posts Table (DB-04)

```typescript
// packages/database/src/schema/posts.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  status: text('status', { enum: ['draft', 'published', 'archived'] })
    .default('draft')
    .notNull(),
  authorId: text('author_id').references(() => users.id),
  categoryId: text('category_id').references(() => categories.id),
  viewCount: integer('view_count').default(0),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
```

### Categories Table (DB-05) - Self-referencing

```typescript
// packages/database/src/schema/categories.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: text('parent_id').references((): ReturnType<typeof categories.id> => categories.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
```

### Tags Table (DB-06)

```typescript
// packages/database/src/schema/tags.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  color: text('color'), // Optional tag color for UI
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
```

### Post-Tags Junction Table (DB-07) - Many-to-Many

```typescript
// packages/database/src/schema/post_tags.ts
import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core'
import { posts } from './posts'
import { tags } from './tags'

export const postTags = sqliteTable(
  'post_tags',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
  })
)

export type PostTag = typeof postTags.$inferSelect
export type NewPostTag = typeof postTags.$inferInsert
```

### Media Table (DB-08)

```typescript
// packages/database/src/schema/media.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name'),
  path: text('path').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadedBy: text('uploaded_by').references(() => users.id),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
```

---

## 4. Migration Scripts (DB-09)

### Drizzle Kit Commands

```bash
# Generate migrations from schema changes
pnpm --filter @my-blog/database drizzle-kit generate:sqlite

# Push schema to database (development only)
pnpm --filter @my-blog/database drizzle-kit push:sqlite

# Run migrations
pnpm --filter @my-blog/database drizzle-kit migrate

# Studio for database visualization
pnpm --filter @my-blog/database drizzle-kit studio
```

### Migration File Structure

```
packages/database/
├── drizzle/
│   ├── meta/
│   │   ├── _journal.json
│   │   └── *.json  # Snapshot files
│   └── *.sql       # Migration SQL files
└── src/
    └── schema/
```

### Programmatic Migration Runner

```typescript
// packages/database/src/migrate.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { createDatabase } from './db'

export function runMigrations(dbPath: string = './data/blog.db') {
  const db = createDatabase(dbPath)
  migrate(db, { migrationsFolder: './drizzle' })
}
```

---

## 5. Seed Data (DB-10)

### Seed Script Structure

```typescript
// packages/database/src/seed/index.ts
import { db } from '../db'
import { users, categories, tags } from '../schema'
import { generateId } from '../utils/id'
import { hashPassword } from '../utils/password'

export async function seed() {
  // Create admin user
  const adminId = generateId()
  const hashedPassword = await hashPassword('admin123')

  await db.insert(users).values({
    id: adminId,
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  })

  // Create default categories
  await db.insert(categories).values([
    { id: generateId(), name: '技术', slug: 'tech', description: '技术文章' },
    { id: generateId(), name: '生活', slug: 'life', description: '生活随笔' },
    { id: generateId(), name: '阅读', slug: 'reading', description: '读书笔记' },
  ])

  // Create sample tags
  await db.insert(tags).values([
    { id: generateId(), name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
    { id: generateId(), name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
    { id: generateId(), name: 'Vue', slug: 'vue', color: '#4fc08d' },
  ])

  console.log('Seed data inserted successfully!')
}
```

### Seed Command

```json
{
  "scripts": {
    "seed": "tsx src/seed/index.ts"
  }
}
```

---

## 6. Best Practices and Considerations

### ID Generation

使用 UUID 或自定义 ID 生成器，避免使用 SQLite 的 AUTOINCREMENT：

```typescript
// packages/database/src/utils/id.ts
import { randomUUID } from 'crypto'

export function generateId(): string {
  return randomUUID()
}
```

### Password Hashing

使用 bcrypt 或 argon2 进行密码哈希：

```typescript
// packages/database/src/utils/password.ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### Soft Deletes

考虑添加软删除支持：

```typescript
export const posts = sqliteTable('posts', {
  // ... other fields
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})
```

### Indexes

为常用查询字段添加索引：

```typescript
import { index } from 'drizzle-orm/sqlite-core'

export const posts = sqliteTable(
  'posts',
  {
    // ... fields
  },
  (table) => ({
    slugIdx: index('posts_slug_idx').on(table.slug),
    authorIdIdx: index('posts_author_idx').on(table.authorId),
    statusIdx: index('posts_status_idx').on(table.status),
  })
)
```

---

## 7. Testing Strategy

### Unit Tests for Schema

```typescript
// packages/database/src/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest'
import { users, posts, categories } from '../schema'

describe('Schema', () => {
  it('users table has correct fields', () => {
    expect(users.id).toBeDefined()
    expect(users.username).toBeDefined()
    expect(users.email).toBeDefined()
  })
})
```

### Integration Tests

```typescript
// packages/database/src/__tests__/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Database } from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { users } from '../schema'

describe('Database Integration', () => {
  let db: ReturnType<typeof drizzle>
  let database: Database

  beforeEach(() => {
    database = new Database(':memory:')
    db = drizzle(database, { schema })
  })

  it('can insert and query users', () => {
    // Test implementation
  })
})
```

---

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://github.com/drizzle-team/drizzle-kit-mirror)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
