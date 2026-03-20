/**
 * Post Service Tests
 *
 * Tests for post.service.ts covering:
 * - createPost with transaction support
 * - updatePost with tag relations
 * - deletePost
 * - getPostById with relations
 * - listPosts with pagination and filters
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import * as schema from '@my-blog/database/schema'
import {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  listPosts,
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../server/services/post.service'
import { hashPassword } from '../../server/services/auth.service'

let testDb: ReturnType<typeof drizzle<typeof schema>>
let testClient: ReturnType<typeof createClient>

/**
 * Initialize test database before all tests
 */
beforeAll(async () => {
  testClient = createClient({
    url: 'file::memory:?cache=shared',
  })
  testDb = drizzle(testClient, { schema })
  setDatabaseInstance(testDb)

  // Create tables
  await testDb.run(sql`DROP TABLE IF EXISTS posts_tags`)
  await testDb.run(sql`DROP TABLE IF EXISTS posts`)
  await testDb.run(sql`DROP TABLE IF EXISTS tags`)
  await testDb.run(sql`DROP TABLE IF EXISTS categories`)
  await testDb.run(sql`DROP TABLE IF EXISTS users`)

  await testDb.run(sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'author' NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  await testDb.run(sql`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  await testDb.run(sql`
    CREATE TABLE posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      content_html TEXT,
      excerpt TEXT,
      cover_image TEXT,
      seo_title TEXT,
      seo_description TEXT,
      status TEXT DEFAULT 'draft' NOT NULL,
      author_id TEXT NOT NULL REFERENCES users(id),
      category_id TEXT REFERENCES categories(id),
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      published_at INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  await testDb.run(sql`
    CREATE TABLE tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  await testDb.run(sql`
    CREATE TABLE posts_tags (
      post_id TEXT NOT NULL REFERENCES posts(id),
      tag_id TEXT NOT NULL REFERENCES tags(id),
      PRIMARY KEY (post_id, tag_id)
    )
  `)
})

/**
 * Clean up after all tests
 */
afterAll(async () => {
  await testClient?.close()
  resetDatabaseInstance()
})

/**
 * Reset database between tests
 */
beforeEach(async () => {
  await testDb.run(sql`DELETE FROM posts_tags`)
  await testDb.run(sql`DELETE FROM posts`)
  await testDb.run(sql`DELETE FROM tags`)
  await testDb.run(sql`DELETE FROM categories`)
  await testDb.run(sql`DELETE FROM users`)

  // Insert test user
  const passwordHash = await hashPassword('password123')
  await testDb.insert(schema.users).values({
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: passwordHash,
    role: 'admin',
    status: 'active',
  })

  // Insert test category
  await testDb.insert(schema.categories).values({
    id: 'cat-1',
    name: 'Test Category',
    slug: 'test-category',
  })

  // Insert test tags
  await testDb.insert(schema.tags).values([
    { id: 'tag-1', name: 'Vue', slug: 'vue' },
    { id: 'tag-2', name: 'Nuxt', slug: 'nuxt' },
    { id: 'tag-3', name: 'TypeScript', slug: 'typescript' },
  ])
})

describe('Post Service', () => {
  describe('createPost', () => {
    it('creates a post with tags using transaction', async () => {
      const postData = {
        title: 'Test Post',
        content: '# Hello World\n\nThis is a test post.',
        excerpt: 'Test excerpt',
        authorId: 'user-1',
        categoryId: 'cat-1',
        status: 'published' as const,
      }

      const result = await createPost(postData, ['tag-1', 'tag-2'])

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.title).toBe('Test Post')
      expect(result.slug).toMatch(/test-post/)
      expect(result.content).toBe(postData.content)
      expect(result.contentHtml).toContain('<h1>Hello World</h1>')
    })

    it('generates unique slug for duplicate titles', async () => {
      const postData = {
        title: 'Duplicate Title',
        content: 'Content here',
        authorId: 'user-1',
        status: 'draft' as const,
      }

      const post1 = await createPost(postData)
      const post2 = await createPost(postData)

      expect(post1.slug).toBe('duplicate-title')
      expect(post2.slug).toMatch(/duplicate-title-\d+/)
      expect(post1.slug).not.toBe(post2.slug)
    })

    it('creates post without tags', async () => {
      const postData = {
        title: 'No Tags Post',
        content: 'Content',
        authorId: 'user-1',
        status: 'draft' as const,
      }

      const result = await createPost(postData)

      expect(result).toBeDefined()
      expect(result.tags).toEqual([])
    })
  })

  describe('updatePost', () => {
    it('updates a post and its tags', async () => {
      // Create initial post
      const postData = {
        title: 'Original Title',
        content: 'Original content',
        authorId: 'user-1',
        status: 'draft' as const,
      }
      const created = await createPost(postData, ['tag-1'])

      // Update post
      const updated = await updatePost(
        created.id,
        { title: 'Updated Title', content: 'Updated content' },
        ['tag-2', 'tag-3']
      )

      expect(updated.title).toBe('Updated Title')
      expect(updated.content).toBe('Updated content')
    })

    it('throws 404 when updating non-existent post', async () => {
      await expect(updatePost('non-existent-id', { title: 'New Title' })).rejects.toThrow(
        'Post not found'
      )
    })
  })

  describe('deletePost', () => {
    it('deletes a post', async () => {
      const postData = {
        title: 'To Delete',
        content: 'Content',
        authorId: 'user-1',
        status: 'draft' as const,
      }
      const created = await createPost(postData)

      const deleted = await deletePost(created.id)

      expect(deleted.id).toBe(created.id)

      // Verify post is deleted
      const found = await getPostById(created.id)
      expect(found).toBeNull()
    })

    it('throws 404 when deleting non-existent post', async () => {
      await expect(deletePost('non-existent-id')).rejects.toThrow('Post not found')
    })
  })

  describe('getPostById', () => {
    it('returns post with category and tags', async () => {
      const postData = {
        title: 'Get Post Test',
        content: 'Content',
        authorId: 'user-1',
        categoryId: 'cat-1',
        status: 'published' as const,
      }
      const created = await createPost(postData, ['tag-1', 'tag-2'])

      const found = await getPostById(created.id, {
        includeCategory: true,
        includeTags: true,
        includeAuthor: true,
      })

      expect(found).toBeDefined()
      expect(found?.category).toBeDefined()
      expect(found?.category?.name).toBe('Test Category')
      expect(found?.tags.length).toBe(2)
      expect(found?.author).toBeDefined()
      expect(found?.author?.username).toBe('testuser')
    })

    it('returns null for non-existent post', async () => {
      const found = await getPostById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('listPosts', () => {
    it('returns paginated list of posts', async () => {
      // Create multiple posts
      for (let i = 1; i <= 5; i++) {
        await createPost({
          title: `Post ${i}`,
          content: `Content ${i}`,
          authorId: 'user-1',
          status: 'published' as const,
        })
      }

      const result = await listPosts({ limit: 2, offset: 0 })

      expect(result.items.length).toBe(2)
      expect(result.total).toBe(5)
      expect(result.limit).toBe(2)
      expect(result.offset).toBe(0)
    })

    it('filters posts by status', async () => {
      await createPost({
        title: 'Published Post',
        content: 'Content',
        authorId: 'user-1',
        status: 'published' as const,
      })
      await createPost({
        title: 'Draft Post',
        content: 'Content',
        authorId: 'user-1',
        status: 'draft' as const,
      })

      const published = await listPosts({ status: 'published' })
      const drafts = await listPosts({ status: 'draft' })

      expect(published.items.length).toBe(1)
      expect(drafts.items.length).toBe(1)
    })

    it('filters posts by category slug', async () => {
      await createPost({
        title: 'Category Post',
        content: 'Content',
        authorId: 'user-1',
        categoryId: 'cat-1',
        status: 'published' as const,
      })

      const result = await listPosts({ category: 'test-category' })

      expect(result.items.length).toBe(1)
      expect(result.items[0].category?.slug).toBe('test-category')
    })

    it('filters posts by tag slug', async () => {
      await createPost(
        {
          title: 'Tagged Post',
          content: 'Content',
          authorId: 'user-1',
          status: 'published' as const,
        },
        ['tag-1']
      )

      const result = await listPosts({ tag: 'vue' })

      expect(result.items.length).toBe(1)
    })

    it('searches posts by title', async () => {
      await createPost({
        title: 'Searchable Post',
        content: 'Content',
        authorId: 'user-1',
        status: 'published' as const,
      })

      const result = await listPosts({ search: 'search' })

      expect(result.items.length).toBe(1)
    })

    it('sorts posts', async () => {
      await createPost({
        title: 'First Post',
        content: 'Content',
        authorId: 'user-1',
        status: 'published' as const,
      })
      await createPost({
        title: 'Second Post',
        content: 'Content',
        authorId: 'user-1',
        status: 'published' as const,
      })

      const ascResult = await listPosts({ sort: 'title', order: 'asc' })
      const descResult = await listPosts({ sort: 'title', order: 'desc' })

      expect(ascResult.items[0].title).toBe('First Post')
      expect(descResult.items[0].title).toBe('Second Post')
    })
  })
})
