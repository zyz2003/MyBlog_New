/**
 * Tags API - Detail/Update/Delete Endpoints Contract Tests
 *
 * Tests for individual tag operations:
 * - GET /api/v1/tags/:id - Get tag by ID
 * - PUT /api/v1/tags/:id - Update tag (auth required)
 * - DELETE /api/v1/tags/:id - Delete tag (auth required)
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
import { setDatabaseInstance, resetDatabaseInstance } from '../../../server/services/tag.service'
import { generateToken } from '../../../server/middleware/auth'
import { tags } from '@my-blog/database'

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

describe('Tag Detail API Contract', () => {
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

  describe('GET /api/v1/tags/:id - Get Tag', () => {
    it('returns tag by ID', async () => {
      // Create test tag
      await testDb.insert(tags).values({
        id: 'tag-get-test',
        name: 'Get Test Tag',
        slug: 'get-test-tag',
        description: 'Test description for get',
        color: '#123456',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].get.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'tag-get-test' })

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('tag-get-test')
      expect(result.data.name).toBe('Get Test Tag')
      expect(result.data.description).toBe('Test description for get')
      expect(result.data.color).toBe('#123456')
      expect(result.message).toBe('Tag retrieved successfully')
    })

    it('returns 404 for non-existent tag', async () => {
      const handler = (await import('../../../server/api/v1/tags/[id].get.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'non-existent-id' })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })

  describe('PUT /api/v1/tags/:id - Update Tag', () => {
    it('updates tag name and description successfully', async () => {
      // Create tag to update
      await testDb.insert(tags).values({
        id: 'tag-update-test',
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
        color: '#000000',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].put.ts')).default
      const mockEvent = createMockEvent(
        { name: 'Updated Name', description: 'Updated description', color: '#FFFFFF' },
        { id: 'tag-update-test' },
        { token }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('tag-update-test')
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.description).toBe('Updated description')
      expect(result.data.color).toBe('#FFFFFF')
      expect(result.message).toBe('Tag updated successfully')
    })

    it('updates only provided fields', async () => {
      await testDb.insert(tags).values({
        id: 'tag-partial-update',
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
        color: '#000000',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].put.ts')).default
      const mockEvent = createMockEvent(
        { name: 'Updated Name' },
        { id: 'tag-partial-update' },
        { token }
      )

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.description).toBe('Original description')
      expect(result.data.color).toBe('#000000')
    })

    it('returns 401 when not authenticated', async () => {
      await testDb.insert(tags).values({
        id: 'tag-no-auth',
        name: 'No Auth',
        slug: 'no-auth',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].put.ts')).default
      const mockEvent = createMockEvent({ name: 'Updated' }, { id: 'tag-no-auth' })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('returns 404 for non-existent tag', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].put.ts')).default
      const mockEvent = createMockEvent({ name: 'Updated' }, { id: 'non-existent-id' }, { token })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })

  describe('DELETE /api/v1/tags/:id - Delete Tag', () => {
    it('deletes tag successfully', async () => {
      await testDb.insert(tags).values({
        id: 'tag-delete-test',
        name: 'Delete Test',
        slug: 'delete-test',
      })

      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].delete.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'tag-delete-test' }, { token })

      const result = await handler(mockEvent)

      expect(result).toBeUndefined() // 204 No Content returns undefined
    })

    it('returns 401 when not authenticated', async () => {
      await testDb.insert(tags).values({
        id: 'tag-delete-no-auth',
        name: 'No Auth',
        slug: 'no-auth-delete',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].delete.ts')).default
      const mockEvent = createMockEvent(undefined, { id: 'tag-delete-no-auth' })

      try {
        await handler(mockEvent)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('returns 404 for non-existent tag', async () => {
      const token = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/tags/[id].delete.ts')).default
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
