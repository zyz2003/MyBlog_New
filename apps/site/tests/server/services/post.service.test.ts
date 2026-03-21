/**
 * Post Service Tests
 *
 * Tests for post.service.ts covering:
 * - createPost with transaction support
 * - updatePost with tag relations
 * - deletePost
 * - getPostById with relations
 * - listPosts with pagination and filters
 *
 * Database: Uses isolated test database to avoid cross-file interference
 * Schema: Table structures defined in packages/database/src/schema/*.ts
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import {
  createIsolatedTestDatabase,
  initializeTestDatabase,
  clearAllData,
  seedTestData,
} from '../../../tests/db'
import {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  listPosts,
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../../server/services/post.service'
import { hashPassword } from '../../../server/services/auth.service'

// Isolated database for this test file
const { db: testDb, cleanup } = createIsolatedTestDatabase()

/**
 * Initialize isolated test database before all tests
 */
beforeAll(async () => {
  await initializeTestDatabase(testDb)
  setDatabaseInstance(testDb)
})

/**
 * Clean up isolated database after all tests
 */
afterAll(async () => {
  resetDatabaseInstance()
  await cleanup()
})

/**
 * Clear all data between tests for isolation
 */
beforeEach(async () => {
  await clearAllData(testDb)

  // Insert test user
  const passwordHash = await hashPassword('password123')
  await seedTestData(testDb, passwordHash)
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
