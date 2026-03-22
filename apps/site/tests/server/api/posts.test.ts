/**
 * Posts API Contract Tests
 *
 * Tests for GET /api/v1/posts endpoints:
 * - GET /api/v1/posts - List posts with pagination and filters
 * - GET /api/v1/posts/:id - Get single post by ID or slug
 *
 * These are contract tests that verify the API behavior matches the specification.
 * Focus on response format, status codes, and data structure.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import {
  createIsolatedTestDatabase,
  initializeTestDatabase,
  clearAllData,
  seedTestData,
} from '../../db'
import { hashPassword } from '../../../server/services/auth.service'
import {
  createPost,
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../../server/services/post.service'

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

describe('Posts API Contract', () => {
  /**
   * Create test posts for list testing
   */
  async function createTestPosts(count: number = 5): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await createPost(
        {
          title: `Test Post ${i}`,
          content: `Content for post ${i}`,
          excerpt: `Excerpt ${i}`,
          authorId: 'user-1',
          categoryId: 'cat-1',
          status: 'published',
        },
        ['tag-1', 'tag-2']
      )
    }
  }

  describe('GET /api/v1/posts - List Posts', () => {
    it('returns paginated list of published posts', async () => {
      await createTestPosts(5)

      // Import and call the handler directly
      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/posts' } },
        query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.meta.total).toBe(5) // All 5 posts
      expect(result.meta.limit).toBe(10)
      expect(result.meta.offset).toBe(0)
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('returns posts with category and tags relations', async () => {
      await createTestPosts(2)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/posts' } },
        query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.data[0]).toBeDefined()
      expect(result.data[0].category).toBeDefined()
      expect(result.data[0].tags).toBeDefined()
      expect(Array.isArray(result.data[0].tags)).toBe(true)
    })

    it('filters posts by category slug', async () => {
      await createTestPosts(5)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default

      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/posts?category=test-category' } },
        query: { category: 'test-category' },
      } as any

      const result = await handler(mockEvent)

      expect(result.meta.total).toBeGreaterThanOrEqual(1)
      expect(
        result.data.every(
          (post: { category?: { slug: string } }) => post.category?.slug === 'test-category'
        )
      ).toBe(true)
    })

    it('filters posts by tag slug', async () => {
      await createTestPosts(5)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default

      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/posts?tag=vue' } },
        query: { tag: 'vue' },
      } as any

      const result = await handler(mockEvent)

      // All posts have tag-1 and tag-2, tag-1 has slug 'vue'
      expect(result.data.length).toBe(5)
      expect(
        result.data.every((post: { tags?: { slug: string }[] }) =>
          post.tags?.some((tag: { slug: string }) => tag.slug === 'vue')
        )
      ).toBe(true)
    })

    it('filters posts by status', async () => {
      await createTestPosts(5)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default

      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/posts?status=published' } },
        query: { status: 'published' },
      } as any

      const result = await handler(mockEvent)

      expect(result.meta.total).toBe(5) // All posts are published now
      expect(result.data.every((post: { status: string }) => post.status === 'published')).toBe(
        true
      )
    })

    it('searches posts by keyword in title or content', async () => {
      await createTestPosts(5)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default

      const mockEvent = {
        context: {},
        path: '/api/v1/posts?search=Content%20for%20post%203',
        node: { req: { headers: {}, url: '/api/v1/posts?search=Content%20for%20post%203' } },
        query: { search: 'Content for post 3' },
      } as any

      const result = await handler(mockEvent)

      // Only post 3 contains "Content for post 3"
      expect(result.meta.total).toBe(1)
      expect(result.data[0].title).toContain('Test Post 3')
    })

    it('respects pagination parameters', async () => {
      await createTestPosts(10)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default

      const mockEvent = {
        context: {},
        path: '/api/v1/posts?limit=3&offset=0',
        node: { req: { headers: {}, url: '/api/v1/posts?limit=3&offset=0' } },
        query: { limit: '3', offset: '0' },
      } as any

      const result = await handler(mockEvent)

      expect(result.data.length).toBe(3)
      expect(result.meta.limit).toBe(3)
      expect(result.meta.offset).toBe(0)
    })

    it('returns correct response structure', async () => {
      await createTestPosts(2)

      const handler = (await import('../../../server/api/v1/posts/index.get.ts')).default

      const mockEvent = {
        context: { $fetch: () => ({}) },
        node: { req: { headers: {} } },
      } as any

      const result = await handler(mockEvent)

      // Verify response structure
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('meta')
      expect(result.meta).toHaveProperty('total')
      expect(result.meta).toHaveProperty('limit')
      expect(result.meta).toHaveProperty('offset')
    })
  })

  describe('GET /api/v1/posts/:id - Get Single Post', () => {
    let createdPostId: string

    beforeEach(async () => {
      await createTestPosts(1)
      const posts = await import('../../../server/services/post.service').then((m) =>
        m.listPosts({ status: 'published' })
      )
      createdPostId = posts.items[0].id
    })

    it('returns a single post by ID with category and tags', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].get.ts')).default

      const mockEvent = {
        context: { params: { id: createdPostId } },
        node: { req: { headers: {} } },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(createdPostId)
      expect(result.data.category).toBeDefined()
      expect(result.data.tags).toBeDefined()
      expect(Array.isArray(result.data.tags)).toBe(true)
    })

    it('returns post by slug', async () => {
      const posts = await import('../../../server/services/post.service').then((m) =>
        m.listPosts({ status: 'published' })
      )
      const slug = posts.items[0].slug

      const handler = (await import('../../../server/api/v1/posts/[id].get.ts')).default

      const mockEvent = {
        context: { params: { id: slug } },
        node: { req: { headers: {} } },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data.slug).toBe(slug)
    })

    it('returns 404 for non-existent post ID', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].get.ts')).default

      const mockEvent = {
        context: { params: { id: 'non-existent-id' } },
        node: { req: { headers: {} } },
      } as any

      await expect(handler(mockEvent)).rejects.toThrow('Post not found')
    })

    it('returns post with author information', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].get.ts')).default

      const mockEvent = {
        context: { params: { id: createdPostId } },
        node: { req: { headers: {} } },
      } as any

      const result = await handler(mockEvent)

      expect(result.data.author).toBeDefined()
      expect(result.data.author?.username).toBe('testuser')
    })
  })
})
