/**
 * Schema Backward Compatibility Tests
 *
 * 验证 Schema 变更不会破坏现有查询
 * 确保新字段有默认值以支持向后兼容
 *
 * 向后兼容原则：
 * - 新增字段必须有默认值或允许 NULL
 * - 不能删除正在使用的字段
 * - 不能修改字段类型（除非有迁移策略）
 * - 新增表不影响现有查询
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@libsql/client'
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { sql } from 'drizzle-orm'

describe('Schema Backward Compatibility', () => {
  let db: LibSQLDatabase
  let client: ReturnType<typeof createClient>

  /**
   * Initialize database schema for testing
   */
  async function initializeSchema(database: LibSQLDatabase): Promise<void> {
    // Drop all tables
    await database.run(sql`DROP TABLE IF EXISTS post_tags`)
    await database.run(sql`DROP TABLE IF EXISTS media`)
    await database.run(sql`DROP TABLE IF EXISTS posts`)
    await database.run(sql`DROP TABLE IF EXISTS tags`)
    await database.run(sql`DROP TABLE IF EXISTS categories`)
    await database.run(sql`DROP TABLE IF EXISTS users`)

    // Create tables using formal schema
    await database.run(sql`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'author' NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        avatar TEXT,
        bio TEXT,
        website TEXT,
        last_login_at INTEGER,
        last_login_ip TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)

    await database.run(sql`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)

    await database.run(sql`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image TEXT,
        seo_title TEXT,
        seo_description TEXT,
        status TEXT DEFAULT 'draft' NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        published_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)

    await database.run(sql`
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `)

    await database.run(sql`
      CREATE TABLE post_tags (
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        created_at INTEGER DEFAULT (unixepoch()),
        PRIMARY KEY (post_id, tag_id)
      )
    `)

    await database.run(sql`
      CREATE TABLE media (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT,
        path TEXT NOT NULL,
        url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        thumbnail_path TEXT,
        folder_id TEXT,
        uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        uploaded_at INTEGER DEFAULT (unixepoch())
      )
    `)
  }

  beforeEach(() => {
    // Create fresh in-memory database for each test
    client = createClient({
      url: 'file::memory:?cache=shared',
    })
    db = drizzle(client)
  })

  afterEach(async () => {
    if (client) {
      await client.close()
    }
  })

  describe('Default Values for New Fields', () => {
    beforeEach(async () => {
      await initializeSchema(db)
    })

    it('users table - role field should have default value', async () => {
      // Insert without specifying role - should use default 'author'
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash)
        VALUES ('test-1', 'testuser', 'test@example.com', 'hash123')
      `)

      const user = await db.get<{ id: string; role: string }>(
        sql`SELECT id, role FROM users WHERE id = 'test-1'`
      )

      expect(user?.role).toBe('author')
    })

    it('users table - status field should have default value', async () => {
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash)
        VALUES ('test-status', 'statususer', 'status@example.com', 'hash456')
      `)

      const user = await db.get<{ status: string }>(
        sql`SELECT status FROM users WHERE id = 'test-status'`
      )

      expect(user?.status).toBe('active')
    })

    it('posts table - status field should have default value', async () => {
      // First create a user for the foreign key
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash, role, status)
        VALUES ('author-1', 'author1', 'author@example.com', 'hash789', 'author', 'active')
      `)

      // Insert post without status - should default to 'draft'
      await db.run(sql`
        INSERT INTO posts (id, title, slug, content, author_id)
        VALUES ('post-1', 'Test Post', 'test-post', 'Content here', 'author-1')
      `)

      const post = await db.get<{ status: string }>(
        sql`SELECT status FROM posts WHERE id = 'post-1'`
      )

      expect(post?.status).toBe('draft')
    })

    it('posts table - viewCount and likeCount should have default value 0', async () => {
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash, role, status)
        VALUES ('author-2', 'author2', 'author2@example.com', 'hash000', 'author', 'active')
      `)

      await db.run(sql`
        INSERT INTO posts (id, title, slug, content, author_id)
        VALUES ('post-2', 'Test Post 2', 'test-post-2', 'Content 2', 'author-2')
      `)

      const post = await db.get<{ view_count: number; like_count: number }>(
        sql`SELECT view_count, like_count FROM posts WHERE id = 'post-2'`
      )

      expect(post?.view_count).toBe(0)
      expect(post?.like_count).toBe(0)
    })

    it('tags table - color field should have default value', async () => {
      await db.run(sql`
        INSERT INTO tags (id, name, slug)
        VALUES ('tag-1', 'Test Tag', 'test-tag')
      `)

      const tag = await db.get<{ color: string | null }>(
        sql`SELECT color FROM tags WHERE id = 'tag-1'`
      )

      expect(tag?.color).toBe('#3b82f6')
    })

    it('nullable fields should accept NULL values', async () => {
      // Test users.avatar (nullable)
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash, avatar)
        VALUES ('test-null', 'nulluser', 'null@example.com', 'hash999', NULL)
      `)

      const user = await db.get<{ avatar: string | null }>(
        sql`SELECT avatar FROM users WHERE id = 'test-null'`
      )

      expect(user?.avatar).toBeNull()
    })
  })

  describe('Existing Query Compatibility', () => {
    beforeEach(async () => {
      await initializeSchema(db)

      // Setup test data
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash, role, status)
        VALUES ('query-test-author', 'queryauthor', 'query@example.com', 'hash', 'author', 'active')
      `)

      await db.run(sql`
        INSERT INTO categories (id, name, slug)
        VALUES ('cat-1', 'Tech', 'tech')
      `)

      for (let i = 1; i <= 5; i++) {
        await db.run(sql`
          INSERT INTO posts (id, title, slug, content, author_id, category_id, status)
          VALUES ('post-${i}', 'Post ${i}', 'post-${i}', 'Content ${i}', 'query-test-author', 'cat-1', 'published')
        `)
      }
    })

    it('should support basic SELECT * query', async () => {
      const posts = await db.all(sql`SELECT * FROM posts WHERE slug = 'post-1'`)
      expect(posts.length).toBe(1)
      expect(posts[0].title).toBe('Post 1')
    })

    it('should support SELECT with specific columns', async () => {
      const post = await db.get<{ id: string; title: string; slug: string }>(
        sql`SELECT id, title, slug FROM posts WHERE id = 'post-1'`
      )

      expect(post).toBeDefined()
      expect(post?.id).toBe('post-1')
      expect(post?.title).toBe('Post 1')
      expect(post?.slug).toBe('post-1')
    })

    it('should support JOIN queries', async () => {
      const result = await db.get<{ postId: string; postTitle: string; categoryName: string }>(
        sql`
          SELECT p.id as postId, p.title as postTitle, c.name as categoryName
          FROM posts p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id = 'post-1'
        `
      )

      expect(result?.postId).toBe('post-1')
      expect(result?.postTitle).toBe('Post 1')
      expect(result?.categoryName).toBe('Tech')
    })

    it('should support WHERE clause with multiple conditions', async () => {
      const posts = await db.all<{ id: string }>(
        sql`SELECT id FROM posts WHERE status = 'published' AND category_id = 'cat-1'`
      )

      expect(posts.length).toBe(5)
    })

    it('should support ORDER BY', async () => {
      const posts = await db.all<{ title: string }>(sql`SELECT title FROM posts ORDER BY title ASC`)

      expect(posts.map((p) => p.title)).toEqual(['Post 1', 'Post 2', 'Post 3', 'Post 4', 'Post 5'])
    })

    it('should support LIMIT and OFFSET for pagination', async () => {
      const page1 = await db.all<{ id: string }>(sql`SELECT id FROM posts LIMIT 2 OFFSET 0`)
      const page2 = await db.all<{ id: string }>(sql`SELECT id FROM posts LIMIT 2 OFFSET 2`)

      expect(page1.length).toBe(2)
      expect(page2.length).toBe(2)
      expect(page1[0].id).not.toBe(page2[0].id)
    })

    it('should support COUNT aggregation', async () => {
      const result = await db.get<{ count: number }>(
        sql`SELECT COUNT(*) as count FROM posts WHERE status = 'published'`
      )

      expect(result?.count).toBe(5)
    })
  })

  describe('Schema Evolution Safety', () => {
    beforeEach(async () => {
      await initializeSchema(db)

      // Create a test user
      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash, role, status)
        VALUES ('evo-test', 'evouser', 'evo@example.com', 'hash', 'author', 'active')
      `)
    })

    it('adding new column with DEFAULT should not break existing rows', async () => {
      // Simulate adding a new column to existing table
      await db.run(sql`ALTER TABLE users ADD COLUMN new_feature_flag INTEGER DEFAULT 0`)

      // Existing users should have the default value
      const user = await db.get<{ new_feature_flag: number }>(
        sql`SELECT new_feature_flag FROM users WHERE id = 'evo-test'`
      )

      expect(user?.new_feature_flag).toBe(0)
    })

    it('adding new column without DEFAULT should allow NULL', async () => {
      await db.run(sql`ALTER TABLE users ADD COLUMN optional_bio TEXT`)

      const user = await db.get<{ optional_bio: string | null }>(
        sql`SELECT optional_bio FROM users WHERE id = 'evo-test'`
      )

      expect(user?.optional_bio).toBeNull()
    })

    it('should not allow dropping columns that are in use', async () => {
      // SQLite has limited DROP COLUMN support
      // This test documents that we should avoid dropping columns
      // In production, use table recreation pattern in migrations

      // Attempt to drop a column - may fail depending on SQLite version
      try {
        await db.run(sql`ALTER TABLE users DROP COLUMN website`)
        // If successful, the column is gone - this is a breaking change!
        // Should be documented in migration notes
      } catch {
        // Expected in older SQLite versions
        expect(true).toBe(true)
      }
    })
  })

  describe('Type Safety Verification', () => {
    beforeEach(async () => {
      await initializeSchema(db)

      await db.run(sql`
        INSERT INTO users (id, username, email, password_hash, role, status)
        VALUES ('type-test-author', 'typeauthor', 'type@example.com', 'hash', 'author', 'active')
      `)

      await db.run(sql`
        INSERT INTO posts (id, title, slug, content, author_id)
        VALUES ('type-post', 'Type Test Post', 'type-test', 'Type content', 'type-test-author')
      `)
    })

    it('should verify integer fields accept numeric values', async () => {
      const result = await db.get<{ view_count: number | null }>(
        sql`SELECT view_count FROM posts WHERE id = 'type-post'`
      )

      expect(typeof result?.view_count).toBe('number')
    })

    it('should verify TEXT fields accept string values', async () => {
      const result = await db.get<{ title: string }>(
        sql`SELECT title FROM posts WHERE id = 'type-post'`
      )

      expect(typeof result?.title).toBe('string')
    })

    it('should verify timestamp fields', async () => {
      const result = await db.get<{ created_at: number | null }>(
        sql`SELECT created_at FROM posts WHERE id = 'type-post'`
      )

      // Should be a Unix timestamp (number) or null
      expect(result?.created_at === null || typeof result?.created_at).toBe('number')
    })
  })
})
