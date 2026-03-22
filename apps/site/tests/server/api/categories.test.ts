/**
 * Categories API Contract Tests
 *
 * Tests for categories API endpoints:
 * - GET /api/v1/categories - List categories with hierarchy
 * - POST /api/v1/categories - Create new category (auth required)
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
  setDatabaseInstance,
  resetDatabaseInstance,
} from '../../../server/services/category.service'
import { generateToken } from '../../../server/middleware/auth'
import { categories } from '@my-blog/database'

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

describe('Categories API Contract', () => {
  /**
   * Create test categories for list testing
   */
  async function createTestCategories(): Promise<void> {
    await testDb.insert(categories).values([
      { id: 'cat-1', name: 'Category 1', slug: 'category-1', description: 'Description 1' },
      { id: 'cat-2', name: 'Category 2', slug: 'category-2', description: 'Description 2' },
      { id: 'cat-3', name: 'Category 3', slug: 'category-3', description: 'Description 3' },
    ])
  }

  describe('GET /api/v1/categories - List Categories', () => {
    it('returns list of categories with hierarchy', async () => {
      // Clear seeded category first
      await clearAllData(testDb)

      await createTestCategories()

      // Import and call the handler directly
      const handler = (await import('../../../server/api/v1/categories/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/categories' } },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(3)
      expect(result.message).toBe('Categories retrieved successfully')
    })

    it('returns empty array when no categories exist', async () => {
      // Clear seeded category
      await clearAllData(testDb)

      const handler = (await import('../../../server/api/v1/categories/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/categories' } },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(result.message).toBe('Categories retrieved successfully')
    })

    it('returns categories with tree structure (children array)', async () => {
      // Clear seeded data first
      await clearAllData(testDb)

      // Create parent category
      await testDb.insert(categories).values({
        id: 'cat-parent',
        name: 'Parent Category',
        slug: 'parent-category',
      })

      // Create child categories
      await testDb.insert(categories).values([
        { id: 'cat-child-1', name: 'Child 1', slug: 'child-1', parentId: 'cat-parent' },
        { id: 'cat-child-2', name: 'Child 2', slug: 'child-2', parentId: 'cat-parent' },
      ])

      const handler = (await import('../../../server/api/v1/categories/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/categories' } },
      } as any

      const result = await handler(mockEvent)

      expect(result.data.length).toBe(1) // One root category
      const parent = result.data[0]
      expect(parent.name).toBe('Parent Category')
      expect(parent.children).toBeDefined()
      expect(Array.isArray(parent.children)).toBe(true)
      expect(parent.children.length).toBe(2)
    })
  })

  describe('POST /api/v1/categories - Create Category', () => {
    it('creates a category successfully with valid data', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/categories',
          },
        },
        _body: {
          name: 'New Category',
          slug: 'new-category',
          description: 'Test description',
        },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('New Category')
      expect(result.data.slug).toBe('new-category')
      expect(result.data.description).toBe('Test description')
      expect(result.data.parentId).toBeNull()
      expect(result.message).toBe('Category created successfully')
    })

    it('creates a category with parent reference', async () => {
      // Create parent category first
      await testDb.insert(categories).values({
        id: 'cat-parent-post',
        name: 'Parent',
        slug: 'parent-post',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/categories',
          },
        },
        _body: {
          name: 'Child Category',
          slug: 'child-category',
          parentId: 'cat-parent-post',
        },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('Child Category')
      expect(result.data.parentId).toBe('cat-parent-post')
    })

    it('returns 400 when creating category with invalid parent', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/categories',
          },
        },
        _body: {
          name: 'Invalid Child',
          slug: 'invalid-child',
          parentId: 'non-existent-parent',
        },
      } as any

      await expect(handler(mockEvent)).rejects.toThrow()
    })

    it('returns 401 when not authenticated', async () => {
      const handler = (await import('../../../server/api/v1/categories/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {},
            url: '/api/v1/categories',
          },
        },
        _body: {
          name: 'Unauthorized Category',
          slug: 'unauthorized-category',
        },
      } as any

      try {
        await handler(mockEvent)
        // Should not reach here
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

      const handler = (await import('../../../server/api/v1/categories/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/categories',
          },
        },
        _body: {
          slug: 'no-name-category',
        },
      } as any

      try {
        await handler(mockEvent)
        // Should not reach here
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

      const handler = (await import('../../../server/api/v1/categories/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
            url: '/api/v1/categories',
          },
        },
        _body: {
          name: 'No Slug Category',
        },
      } as any

      try {
        await handler(mockEvent)
        // Should not reach here
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
      }
    })
  })
})
