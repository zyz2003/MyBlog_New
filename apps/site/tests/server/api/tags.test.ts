/**
 * Tags API Contract Tests
 *
 * Tests for tags API endpoints:
 * - GET /api/v1/tags - List all tags
 * - POST /api/v1/tags - Create new tag (auth required)
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
import { setDatabaseInstance, resetDatabaseInstance } from '../../../server/services/tag.service'
import { generateToken } from '../../../server/middleware/auth'
import { tags } from '@my-blog/database'

// Isolated database for this test file
let testDb: ReturnType<typeof createIsolatedTestDatabase>['db']
let cleanup: () => Promise<void>

/**
 * Initialize isolated test database before all tests
 */
beforeAll(async () => {
  const isolated = await createIsolatedTestDatabase()
  testDb = isolated.db
  cleanup = isolated.cleanup
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

describe('Tags API Contract', () => {
  /**
   * Create test tags for list testing
   */
  async function createTestTags(): Promise<void> {
    await testDb.insert(tags).values([
      { id: 'tag-1', name: 'Tag 1', slug: 'tag-1', description: 'Description 1' },
      { id: 'tag-2', name: 'Tag 2', slug: 'tag-2', description: 'Description 2' },
      { id: 'tag-3', name: 'Tag 3', slug: 'tag-3', description: 'Description 3' },
    ])
  }

  describe('GET /api/v1/tags - List Tags', () => {
    it('returns list of all tags', async () => {
      // Clear seeded tags first
      await clearAllData(testDb)

      await createTestTags()

      // Import and call the handler directly
      const handler = (await import('../../../server/api/v1/tags/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/tags' } },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(3)
      expect(result.message).toBe('Tags retrieved successfully')
    })

    it('returns empty array when no tags exist', async () => {
      // Clear seeded tags
      await clearAllData(testDb)

      const handler = (await import('../../../server/api/v1/tags/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/tags' } },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(result.message).toBe('Tags retrieved successfully')
    })

    it('returns tags sorted by name', async () => {
      // Clear seeded data first
      await clearAllData(testDb)

      // Create tags in non-alphabetical order
      await testDb.insert(tags).values([
        { id: 'tag-zebra', name: 'Zebra', slug: 'zebra' },
        { id: 'tag-apple', name: 'Apple', slug: 'apple' },
        { id: 'tag-mango', name: 'Mango', slug: 'mango' },
      ])

      const handler = (await import('../../../server/api/v1/tags/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/tags' } },
      } as any

      const result = await handler(mockEvent)

      expect(result.data.length).toBe(3)
      expect(result.data[0].name).toBe('Apple')
      expect(result.data[1].name).toBe('Mango')
      expect(result.data[2].name).toBe('Zebra')
    })
  })

  describe('POST /api/v1/tags - Create Tag', () => {
    it('creates a tag successfully with valid data', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/tags',
          },
        },
        _body: {
          name: 'New Tag',
          slug: 'new-tag',
          description: 'Test description',
          color: '#FF0000',
        },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('New Tag')
      expect(result.data.slug).toBe('new-tag')
      expect(result.data.description).toBe('Test description')
      expect(result.data.color).toBe('#FF0000')
      expect(result.message).toBe('Tag created successfully')
    })

    it('creates a tag with only required fields', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/tags',
          },
        },
        _body: {
          name: 'Minimal Tag',
          slug: 'minimal-tag',
        },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('Minimal Tag')
      expect(result.data.slug).toBe('minimal-tag')
      expect(result.data.description).toBeNull()
      expect(result.data.color).toBeNull()
    })

    it('returns 401 when not authenticated', async () => {
      const handler = (await import('../../../server/api/v1/tags/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {},
            url: '/api/v1/tags',
          },
        },
        _body: {
          name: 'Unauthorized Tag',
          slug: 'unauthorized-tag',
        },
      } as any

      try {
        await handler(mockEvent)
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('returns 400 when name is missing', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/tags',
          },
        },
        _body: {
          slug: 'no-name-tag',
        },
      } as any

      try {
        await handler(mockEvent)
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
      }
    })

    it('returns 400 when slug is missing', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/tags',
          },
        },
        _body: {
          name: 'No Slug Tag',
        },
      } as any

      try {
        await handler(mockEvent)
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
      }
    })
  })
})
