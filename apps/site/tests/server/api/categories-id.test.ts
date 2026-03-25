/**
 * Categories API - Detail/Update/Delete Endpoints Contract Tests
 *
 * Tests for individual category operations:
 * - GET /api/v1/categories/:id - Get category by ID
 * - PUT /api/v1/categories/:id - Update category (auth required)
 * - DELETE /api/v1/categories/:id - Delete category (auth required)
 *
 * These are contract tests verifying API behavior matches specification.
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
import { eq } from 'drizzle-orm'

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

describe('Category Detail API Contract', () => {
  // Helper function to create mock events
  function createMockEvent(body?: any, params?: { id?: string }, user?: any) {
    const authToken = user ? user.token : undefined
    return {
      context: {
        params,
        user: user || undefined,
      },
      node: {
        req: {
          headers: authToken ? { authorization: `Bearer ${authToken}` } : {},
          method: body ? 'POST' : 'GET',
        },
      },
      _body: body || {},
    } as any
  }

  describe('GET /api/v1/categories/:id - Get Category', () => {
    it('returns category by ID', async () => {
      // Create test category
      await testDb.insert(categories).values({
        id: 'cat-get-test',
        name: 'Get Test Category',
        slug: 'get-test-category',
        description: 'Test description for get',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].get.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'cat-get-test' })

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('cat-get-test')
      expect(result.data.name).toBe('Get Test Category')
      expect(result.data.description).toBe('Test description for get')
      expect(result.message).toBe('Category retrieved successfully')
    })

    it('returns 404 for non-existent category', async () => {
      const handler = (await import('../../../server/api/v1/categories/[id].get.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'non-existent-id' })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })

    it('returns category with parent reference', async () => {
      // Create parent category
      await testDb.insert(categories).values({
        id: 'cat-parent-get',
        name: 'Parent Category',
        slug: 'parent-category',
      })

      // Create child category
      await testDb.insert(categories).values({
        id: 'cat-child-get',
        name: 'Child Category',
        slug: 'child-category',
        parentId: 'cat-parent-get',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].get.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'cat-child-get' })

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('cat-child-get')
      expect(result.data.parentId).toBe('cat-parent-get')
    })
  })

  describe('PUT /api/v1/categories/:id - Update Category', () => {
    it('updates category name and description successfully', async () => {
      // Create category to update
      await testDb.insert(categories).values({
        id: 'cat-update-test',
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].put.ts')).default
      const mockEvent = createMockEvent(
        { name: 'Updated Name', description: 'Updated description' },
        { id: 'cat-update-test' },
        { token }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('cat-update-test')
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.description).toBe('Updated description')
      expect(result.message).toBe('Category updated successfully')
    })

    it('updates category parent reference', async () => {
      // Create parent and child categories
      await testDb.insert(categories).values([
        { id: 'cat-new-parent', name: 'New Parent', slug: 'new-parent' },
        { id: 'cat-to-update', name: 'To Update', slug: 'to-update' },
      ])

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].put.ts')).default
      const mockEvent = createMockEvent(
        { parentId: 'cat-new-parent' },
        { id: 'cat-to-update' },
        { token }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.parentId).toBe('cat-new-parent')
    })

    it('returns 401 when not authenticated', async () => {
      await testDb.insert(categories).values({
        id: 'cat-no-auth',
        name: 'No Auth',
        slug: 'no-auth',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].put.ts')).default
      const mockEvent = createMockEvent({ name: 'Updated' }, { id: 'cat-no-auth' })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('returns 404 for non-existent category', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].put.ts')).default
      const mockEvent = createMockEvent({ name: 'Updated' }, { id: 'non-existent-id' }, { token })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })

    it('returns 400 when updating to invalid parent', async () => {
      await testDb.insert(categories).values({
        id: 'cat-invalid-parent',
        name: 'Test',
        slug: 'test',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].put.ts')).default
      const mockEvent = createMockEvent(
        { parentId: 'non-existent-parent' },
        { id: 'cat-invalid-parent' },
        { token }
      )

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
      }
    })
  })

  describe('DELETE /api/v1/categories/:id - Delete Category', () => {
    it('deletes category successfully', async () => {
      await testDb.insert(categories).values({
        id: 'cat-delete-test',
        name: 'Delete Test',
        slug: 'delete-test',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].delete.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'cat-delete-test' }, { token })

      const result = await handler(mockEvent)

      expect(result).toBeUndefined() // 204 No Content returns undefined
    })

    it('sets children to top-level (parentId = null) when deleting parent', async () => {
      // Clear seeded data to avoid foreign key issues
      await clearAllData(testDb)

      // Create parent with children
      await testDb.insert(categories).values([
        {
          id: 'cat-delete-parent',
          name: 'Parent To Delete',
          slug: 'parent-delete',
        },
        {
          id: 'cat-child',
          name: 'Child',
          slug: 'child-delete',
          parentId: 'cat-delete-parent',
        },
      ])

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].delete.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'cat-delete-parent' }, { token })

      await handler(mockEvent)

      // Verify parent is deleted
      const parentResult = await testDb
        .select()
        .from(categories)
        .where(eq(categories.id, 'cat-delete-parent'))
      expect(parentResult.length).toBe(0)

      // Verify child still exists with parentId = null
      const childResult = await testDb
        .select()
        .from(categories)
        .where(eq(categories.id, 'cat-child'))
      expect(childResult.length).toBe(1)
      expect(childResult[0].parentId).toBeNull()
    })

    it('returns 401 when not authenticated', async () => {
      await testDb.insert(categories).values({
        id: 'cat-delete-no-auth',
        name: 'No Auth',
        slug: 'no-auth-delete',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].delete.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'cat-delete-no-auth' })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('returns 404 for non-existent category', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/categories/[id].delete.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'non-existent-id' }, { token })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })
})
