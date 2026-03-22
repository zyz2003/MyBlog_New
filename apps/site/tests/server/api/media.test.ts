/**
 * Media API Contract Tests
 *
 * Tests for media API endpoints:
 * - GET /api/v1/media - List media files with pagination
 * - POST /api/v1/media - Upload file (auth required)
 * - GET /api/v1/media/:id - Get single media
 * - DELETE /api/v1/media/:id - Delete media (auth required)
 *
 * These are contract tests that verify the API behavior matches the specification.
 * Focus on response format, status codes, and data structure.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import crypto from 'node:crypto'
import {
  createIsolatedTestDatabase,
  initializeTestDatabase,
  clearAllData,
  seedTestData,
} from '../../db'
import { hashPassword } from '../../../server/services/auth.service'
import { setDatabaseInstance, resetDatabaseInstance } from '../../../server/services/media.service'
import { generateToken } from '../../../server/middleware/auth'
import { media } from '@my-blog/database'
import { eq } from 'drizzle-orm'

// Isolated database for this test file
const { db: testDb, cleanup } = createIsolatedTestDatabase()

// Mock storage provider
const mockStorageProvider = {
  save: vi.fn().mockImplementation(async (buffer: Buffer, filename: string) => {
    return filename
  }),
  delete: vi.fn().mockImplementation(async () => {
    // Do nothing
  }),
  getUrl: vi.fn().mockImplementation(async (path: string) => {
    return `/uploads/${path}`
  }),
}

// Mock getStorageProvider
vi.mock('../../../server/services/storage.service', () => ({
  getStorageProvider: () => mockStorageProvider,
}))

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

  // Reset mocks
  vi.clearAllMocks()
})

describe('Media API Contract', () => {
  /**
   * Create test media records for list testing
   */
  async function createTestMediaRecords(): Promise<void> {
    await testDb.insert(media).values([
      {
        id: crypto.randomUUID(),
        filename: 'image1.png',
        originalName: 'Image 1.png',
        path: 'image1.png',
        url: '/uploads/image1.png',
        mimeType: 'image/png',
        size: 1024,
        uploadedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        filename: 'image2.jpg',
        originalName: 'Image 2.jpg',
        path: 'image2.jpg',
        url: '/uploads/image2.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        uploadedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        filename: 'document.pdf',
        originalName: 'Document.pdf',
        path: 'document.pdf',
        url: '/uploads/document.pdf',
        mimeType: 'application/pdf',
        size: 4096,
        uploadedAt: new Date(),
      },
    ])
  }

  describe('GET /api/v1/media - List Media', () => {
    it('returns paginated list of media', async () => {
      await createTestMediaRecords()

      const handler = (await import('../../../server/api/v1/media/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/media' } },
        _query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(3)
      expect(result.meta).toBeDefined()
      expect(result.meta.total).toBe(3)
      expect(result.message).toBeUndefined()
    })

    it('returns empty array when no media exist', async () => {
      const handler = (await import('../../../server/api/v1/media/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: { req: { headers: {}, url: '/api/v1/media' } },
        _query: {},
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })

    it('supports pagination with limit and offset', async () => {
      await createTestMediaRecords()

      const handler = (await import('../../../server/api/v1/media/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {},
            url: '/api/v1/media?limit=2&offset=0',
          },
        },
        _query: { limit: 2, offset: 0 },
      } as any

      const result = await handler(mockEvent)

      expect(result.data).toHaveLength(2)
      expect(result.meta.limit).toBe(2)
      expect(result.meta.offset).toBe(0)
      expect(result.meta.total).toBe(3)
    })

    it('filters by mime type', async () => {
      await createTestMediaRecords()

      const handler = (await import('../../../server/api/v1/media/index.get.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {},
            url: '/api/v1/media?mimeType=image/png',
          },
        },
        _query: { mimeType: 'image/png' },
      } as any

      const result = await handler(mockEvent)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].mimeType).toBe('image/png')
    })
  })

  describe('POST /api/v1/media - Upload Media', () => {
    it('requires authentication', async () => {
      const handler = (await import('../../../server/api/v1/media/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {},
            url: '/api/v1/media',
            method: 'POST',
          },
        },
        _body: null,
      } as any

      await expect(handler(mockEvent)).rejects.toThrow()
    })

    it('uploads a file with multipart/form-data and returns media object', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const fileBuffer = Buffer.from('test image content')
      const mockParts = [
        {
          name: 'file',
          filename: 'test-image.png',
          type: 'image/png',
          data: fileBuffer,
        },
      ]

      const handler = (await import('../../../server/api/v1/media/index.post.ts')).default
      const mockEvent = {
        context: {},
        node: {
          req: {
            headers: {
              authorization: `Bearer ${authToken}`,
              'content-type': 'multipart/form-data',
            },
            url: '/api/v1/media',
            method: 'POST',
          },
        },
        _parts: mockParts,
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.filename).toBe('test-image.png')
      expect(result.data.mimeType).toBe('image/png')
      expect(result.message).toBe('File uploaded successfully')
    })

    it('rejects file without file field', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/media/index.post.ts')).default
      const mockEvent = {
        context: { user: { id: 'user-1' } },
        node: {
          req: {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
            url: '/api/v1/media',
            method: 'POST',
          },
        },
        _body: {},
      } as any

      await expect(handler(mockEvent)).rejects.toThrow()
    })
  })

  describe('GET /api/v1/media/:id - Get Media by ID', () => {
    let mediaId: string

    beforeEach(async () => {
      mediaId = crypto.randomUUID()
      await testDb
        .insert(media)
        .values({
          id: mediaId,
          filename: 'single-image.png',
          originalName: 'Single Image.png',
          path: 'single-image.png',
          url: '/uploads/single-image.png',
          mimeType: 'image/png',
          size: 1024,
          uploadedAt: new Date(),
        })
        .returning()
    })

    it('returns media record by id', async () => {
      const handler = (await import('../../../server/api/v1/media/[id].get.ts')).default
      const mockEvent = {
        context: {
          params: { id: mediaId },
        },
        node: {
          req: { headers: {}, url: `/api/v1/media/${mediaId}` },
        },
      } as any

      const result = await handler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(mediaId)
      expect(result.data.filename).toBe('single-image.png')
      expect(result.message).toBe('Media file retrieved successfully')
    })

    it('returns 404 for non-existent media', async () => {
      const handler = (await import('../../../server/api/v1/media/[id].get.ts')).default
      const nonExistentId = crypto.randomUUID()
      const mockEvent = {
        context: {
          params: { id: nonExistentId },
        },
        node: {
          req: { headers: {}, url: `/api/v1/media/${nonExistentId}` },
        },
        query: {},
      } as any

      try {
        await handler(mockEvent)
        // Should not reach here
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })

  describe('DELETE /api/v1/media/:id - Delete Media', () => {
    let mediaId: string

    beforeEach(async () => {
      mediaId = crypto.randomUUID()
      await testDb
        .insert(media)
        .values({
          id: mediaId,
          filename: 'delete-me.png',
          originalName: 'Delete Me.png',
          path: 'delete-me.png',
          url: '/uploads/delete-me.png',
          mimeType: 'image/png',
          size: 1024,
          uploadedAt: new Date(),
        })
        .returning()
    })

    it('requires authentication', async () => {
      const handler = (await import('../../../server/api/v1/media/[id].delete.ts')).default
      const mockEvent = {
        context: {
          params: { id: mediaId },
        },
        node: {
          req: {
            headers: {},
            url: `/api/v1/media/${mediaId}`,
            method: 'DELETE',
          },
        },
      } as any

      await expect(handler(mockEvent)).rejects.toThrow()
    })

    it('deletes media record and returns 204', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/media/[id].delete.ts')).default
      const mockEvent = {
        context: {
          params: { id: mediaId },
          user: { id: 'user-1' },
        },
        node: {
          req: {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
            url: `/api/v1/media/${mediaId}`,
            method: 'DELETE',
          },
          res: { statusCode: 200 },
        },
      } as any

      await handler(mockEvent)

      // Verify database record is deleted
      const record = await testDb.select().from(media).where(eq(media.id, mediaId)).get()

      expect(record).toBeUndefined()
      expect(mockStorageProvider.delete).toHaveBeenCalled()
    })

    it('returns 404 for non-existent media', async () => {
      const authToken = await generateToken({
        id: 'user-1',
        username: 'testuser',
        role: 'admin',
      })

      const handler = (await import('../../../server/api/v1/media/[id].delete.ts')).default
      const nonExistentId = crypto.randomUUID()
      const mockEvent = {
        context: {
          params: { id: nonExistentId },
        },
        node: {
          req: {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
            url: `/api/v1/media/${nonExistentId}`,
            method: 'DELETE',
          },
          res: { statusCode: 200 },
        },
      } as any

      try {
        await handler(mockEvent)
        // Should throw 404
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })
})
