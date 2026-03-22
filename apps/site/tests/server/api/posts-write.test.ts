/**
 * Posts Write API Contract Tests
 *
 * Tests for POST/PUT/DELETE /api/v1/posts endpoints:
 * - POST /api/v1/posts - Create post
 * - PUT /api/v1/posts/:id - Update post
 * - DELETE /api/v1/posts/:id - Delete post
 * - DELETE /api/v1/posts/bulk - Bulk delete posts
 *
 * These are contract tests that verify the API behavior matches the specification.
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
  listPosts,
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../../server/services/post.service'
import { generateToken } from '../../../server/middleware/auth'

// Isolated database for this test file
const { db: testDb, cleanup } = createIsolatedTestDatabase()

// Auth token for protected routes
let authToken: string

/**
 * Initialize isolated test database before all tests
 */
beforeAll(async () => {
  await initializeTestDatabase(testDb)
  setDatabaseInstance(testDb)

  // Generate auth token for protected routes
  authToken = await generateToken({
    id: 'user-1',
    username: 'testuser',
    role: 'admin',
    email: 'test@example.com',
  })
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

describe('Posts Write API Contract', () => {
  // UUIDs for test data (must match seed data format in db.ts)
  const testCategoryId = 'cat-00000000-0000-0000-0000-000000000001'
  const testTagId1 = 'tag-00000000-0000-0000-0000-000000000001'
  const testTagId2 = 'tag-00000000-0000-0000-0000-000000000002'

  /**
   * Helper to create a mock event with body and auth
   * Note: readBody from h3 reads from event.node.req.body directly
   */
  function createMockEvent(body: any, params?: { id?: string }, user?: any) {
    return {
      context: {
        params,
        user: user || undefined,
      },
      node: {
        req: {
          headers: user ? { authorization: `Bearer ${authToken}` } : {},
          method: 'POST',
          body: body || {},
        },
      },
      _body: body || {}, // For readBody compatibility
    } as any
  }

  describe('POST /api/v1/posts - Create Post', () => {
    it('creates a new post with valid data', async () => {
      const handler = (await import('../../../server/api/v1/posts/index.post.ts')).default

      const mockEvent = createMockEvent(
        {
          title: 'New Test Post',
          content: 'Content for new post',
          excerpt: 'Test excerpt',
          categoryId: testCategoryId,
          tagIds: [testTagId1, testTagId2],
          status: 'published',
        },
        undefined,
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.title).toBe('New Test Post')
      expect(result.data.content).toBe('Content for new post')
      expect(result.data.status).toBe('published')
      expect(result.data.id).toBeDefined()
    })

    it('returns 401 without authentication', async () => {
      const handler = (await import('../../../server/api/v1/posts/index.post.ts')).default

      const mockEvent = createMockEvent(
        {
          title: 'New Test Post',
          content: 'Content for new post',
        },
        undefined,
        undefined
      )

      await expect(handler(mockEvent)).rejects.toThrow('Authentication required')
    })

    it('returns 400 with invalid data (missing title)', async () => {
      const handler = (await import('../../../server/api/v1/posts/index.post.ts')).default

      const mockEvent = createMockEvent(
        {
          content: 'Content for new post',
        },
        undefined,
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      await expect(handler(mockEvent)).rejects.toThrow('Invalid request body')
    })

    it('returns 400 with invalid data (missing content)', async () => {
      const handler = (await import('../../../server/api/v1/posts/index.post.ts')).default

      const mockEvent = createMockEvent(
        {
          title: 'New Test Post',
        },
        undefined,
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      await expect(handler(mockEvent)).rejects.toThrow('Invalid request body')
    })

    it('creates post with draft status by default', async () => {
      const handler = (await import('../../../server/api/v1/posts/index.post.ts')).default

      const mockEvent = createMockEvent(
        {
          title: 'Draft Post',
          content: 'Draft content',
        },
        undefined,
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.data.status).toBe('draft')
    })

    it('creates post and associates with category and tags', async () => {
      const handler = (await import('../../../server/api/v1/posts/index.post.ts')).default

      const mockEvent = createMockEvent(
        {
          title: 'Post with relations',
          content: 'Content',
          categoryId: testCategoryId,
          tagIds: [testTagId1],
        },
        undefined,
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.data.categoryId).toBe(testCategoryId)
    })
  })

  describe('PUT /api/v1/posts/:id - Update Post', () => {
    let createdPostId: string

    beforeEach(async () => {
      // Create a post to update
      const post = await createPost(
        {
          title: 'Original Title',
          content: 'Original content',
          authorId: 'user-1',
          categoryId: testCategoryId,
          status: 'draft',
        },
        [testTagId1]
      )
      createdPostId = post.id
    })

    it('updates a post with valid data', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].put.ts')).default

      const mockEvent = createMockEvent(
        {
          title: 'Updated Title',
          content: 'Updated content',
        },
        { id: createdPostId },
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data.title).toBe('Updated Title')
      expect(result.data.content).toBe('Updated content')
      expect(result.data.id).toBe(createdPostId)
    })

    it('returns 401 without authentication', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].put.ts')).default

      const mockEvent = createMockEvent({ title: 'Updated' }, { id: createdPostId }, undefined)

      await expect(handler(mockEvent)).rejects.toThrow('Authentication required')
    })

    it('returns 404 for non-existent post', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].put.ts')).default

      const mockEvent = createMockEvent(
        { title: 'Updated' },
        { id: 'non-existent-id' },
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      await expect(handler(mockEvent)).rejects.toThrow('Post not found')
    })

    it('updates partial fields (title only)', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].put.ts')).default

      const mockEvent = createMockEvent(
        { title: 'Only Title Updated' },
        { id: createdPostId },
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.data.title).toBe('Only Title Updated')
    })

    it('updates post status', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].put.ts')).default

      const mockEvent = createMockEvent(
        { status: 'published' },
        { id: createdPostId },
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.data.status).toBe('published')
    })
  })

  describe('DELETE /api/v1/posts/:id - Delete Post', () => {
    let createdPostId: string

    beforeEach(async () => {
      const post = await createPost(
        {
          title: 'Post to Delete',
          content: 'Content to delete',
          authorId: 'user-1',
          categoryId: testCategoryId,
          status: 'draft',
        },
        [testTagId1]
      )
      createdPostId = post.id
    })

    it('deletes a post successfully', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].delete.ts')).default

      const mockEvent = createMockEvent(
        {},
        { id: createdPostId },
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(createdPostId)

      // Verify post is deleted
      const posts = await listPosts({ status: 'draft' })
      expect(posts.items.find((p) => p.id === createdPostId)).toBeUndefined()
    })

    it('returns 401 without authentication', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].delete.ts')).default

      const mockEvent = createMockEvent({}, { id: createdPostId }, undefined)

      await expect(handler(mockEvent)).rejects.toThrow('Authentication required')
    })

    it('returns 404 for non-existent post', async () => {
      const handler = (await import('../../../server/api/v1/posts/[id].delete.ts')).default

      const mockEvent = createMockEvent(
        {},
        { id: 'non-existent-id' },
        { id: 'user-1', username: 'testuser', role: 'admin' }
      )

      await expect(handler(mockEvent)).rejects.toThrow('Post not found')
    })
  })

  describe('DELETE /api/v1/posts/bulk - Bulk Delete Posts', () => {
    let postIds: string[] = []

    beforeEach(async () => {
      postIds = []
      // Create multiple posts
      for (let i = 1; i <= 3; i++) {
        const post = await createPost(
          {
            title: `Post ${i} to Delete`,
            content: `Content ${i}`,
            authorId: 'user-1',
            categoryId: testCategoryId,
            status: 'draft',
          },
          [testTagId1]
        )
        postIds.push(post.id)
      }
    })

    it('deletes multiple posts by IDs', async () => {
      const handler = (await import('../../../server/api/v1/posts/bulk.delete.ts')).default

      const mockEvent = createMockEvent({ ids: postIds }, undefined, {
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data.deleted).toBe(3)

      // Verify all posts are deleted
      const posts = await listPosts({ status: 'draft' })
      expect(posts.items.length).toBe(0)
    })

    it('returns 401 without authentication', async () => {
      const handler = (await import('../../../server/api/v1/posts/bulk.delete.ts')).default

      const mockEvent = createMockEvent({ ids: postIds }, undefined, undefined)

      await expect(handler(mockEvent)).rejects.toThrow('Authentication required')
    })

    it('returns 400 with empty IDs array', async () => {
      const handler = (await import('../../../server/api/v1/posts/bulk.delete.ts')).default

      const mockEvent = createMockEvent({ ids: [] }, undefined, {
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      await expect(handler(mockEvent)).rejects.toThrow('Invalid request body')
    })

    it('deletes only specified posts', async () => {
      // Create one more post that won't be deleted
      const keepPost = await createPost(
        {
          title: 'Post to Keep',
          content: 'Keep content',
          authorId: 'user-1',
          categoryId: testCategoryId,
          status: 'draft',
        },
        [testTagId1]
      )

      const handler = (await import('../../../server/api/v1/posts/bulk.delete.ts')).default

      const mockEvent = createMockEvent({ ids: postIds }, undefined, {
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const result = await handler(mockEvent)

      expect(result.data.deleted).toBe(3)

      // Verify only specified posts are deleted
      const posts = await listPosts({ status: 'draft' })
      expect(posts.items.length).toBe(1)
      expect(posts.items[0].id).toBe(keepPost.id)
    })
  })
})
