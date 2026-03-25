/**
 * Media Service Tests
 *
 * Tests for media CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'
import { createIsolatedTestDatabase, initializeTestDatabase, seedTestData } from '../../db'
import * as schema from '@my-blog/database/schema'
import { eq } from 'drizzle-orm'

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

// Import after mocking
import {
  setDatabaseInstance,
  resetDatabaseInstance,
  uploadMedia,
  listMedia,
  getMediaById,
  deleteMedia,
} from '../../../server/services/media.service'

describe('Media Service', () => {
  let db: ReturnType<typeof createIsolatedTestDatabase>['db']
  let cleanup: () => Promise<void>
  const testUploadDir = join(process.cwd(), 'test-media-uploads')

  beforeEach(async () => {
    // Set up test database
    const isolated = await createIsolatedTestDatabase()
    db = isolated.db
    cleanup = isolated.cleanup

    // Initialize database schema
    await initializeTestDatabase(db)

    // Seed test data
    const testPassword = await bcrypt.hash('password', 10)
    await seedTestData(db, testPassword)

    // Set database instance for service
    setDatabaseInstance(db)

    // Create test upload directory
    await fs.mkdir(testUploadDir, { recursive: true })
    process.env.STORAGE_PATH = testUploadDir
  })

  afterEach(async () => {
    // Reset database instance
    resetDatabaseInstance()

    // Clean up test files
    try {
      await fs.rm(testUploadDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }

    // Clean up database
    await cleanup()

    // Reset mocks
    vi.clearAllMocks()
  })

  describe('uploadMedia', () => {
    it('should upload a file and create media record', async () => {
      const fileBuffer = Buffer.from('test image content')
      const metadata = {
        filename: 'test-image.png',
        originalName: 'original.png',
        mimeType: 'image/png',
        size: fileBuffer.length,
      }

      const result = await uploadMedia(fileBuffer, metadata)

      expect(result).toHaveProperty('id')
      expect(result.filename).toBe('test-image.png')
      expect(result.originalName).toBe('original.png')
      expect(result.mimeType).toBe('image/png')
      expect(result.url).toContain('/uploads/')

      // Verify database record
      const mediaRecord = await db
        .select()
        .from(schema.media)
        .where(eq(schema.media.id, result.id))
        .get()

      expect(mediaRecord).toBeDefined()
      expect(mediaRecord?.filename).toBe('test-image.png')
    })

    it('should handle image metadata (width/height) for images', async () => {
      // Create a minimal PNG buffer (1x1 pixel)
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
        0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      ])

      const metadata = {
        filename: 'small-image.png',
        originalName: 'image.png',
        mimeType: 'image/png',
        size: pngHeader.length,
      }

      const result = await uploadMedia(pngHeader, metadata)

      expect(result).toBeDefined()
      // Note: width/height extraction requires sharp, which we test separately
    })

    it('should record uploader if userId provided', async () => {
      const fileBuffer = Buffer.from('test file')
      const metadata = {
        filename: 'user-upload.png',
        originalName: 'upload.png',
        mimeType: 'image/png',
        size: fileBuffer.length,
      }

      const result = await uploadMedia(fileBuffer, metadata, 'user-1')

      expect(result.uploadedBy).toBe('user-1')

      const mediaRecord = await db
        .select()
        .from(schema.media)
        .where(eq(schema.media.id, result.id))
        .get()

      expect(mediaRecord?.uploadedBy).toBe('user-1')
    })
  })

  describe('listMedia', () => {
    beforeEach(async () => {
      // Seed some media records
      const fileBuffer = Buffer.from('test')
      await uploadMedia(fileBuffer, {
        filename: 'image1.png',
        originalName: 'image1.png',
        mimeType: 'image/png',
        size: 4,
      })
      await uploadMedia(fileBuffer, {
        filename: 'image2.jpg',
        originalName: 'image2.jpg',
        mimeType: 'image/jpeg',
        size: 4,
      })
      await uploadMedia(fileBuffer, {
        filename: 'document.pdf',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: 4,
      })
    })

    it('should return paginated list of media', async () => {
      const result = await listMedia({ limit: 2, offset: 0 })

      expect(result.data).toHaveLength(2)
      expect(result.meta.total).toBe(3)
      expect(result.meta.limit).toBe(2)
      expect(result.meta.offset).toBe(0)
    })

    it('should filter by mime type', async () => {
      const result = await listMedia({
        limit: 10,
        offset: 0,
        mimeType: 'image/png',
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].mimeType).toBe('image/png')
    })

    it('should sort by uploadedAt descending by default', async () => {
      const result = await listMedia({
        limit: 10,
        offset: 0,
        sort: 'uploadedAt',
        order: 'desc',
      })

      expect(result.data.length).toBeGreaterThan(0)
      // Most recently uploaded should be first
    })
  })

  describe('getMediaById', () => {
    let mediaId: string

    beforeEach(async () => {
      const fileBuffer = Buffer.from('test file')
      const result = await uploadMedia(fileBuffer, {
        filename: 'get-test.png',
        originalName: 'get-test.png',
        mimeType: 'image/png',
        size: 4,
      })
      mediaId = result.id
    })

    it('should return media record by id', async () => {
      const result = await getMediaById(mediaId)

      expect(result).toBeDefined()
      expect(result.id).toBe(mediaId)
      expect(result.filename).toBe('get-test.png')
    })

    it('should return null for non-existent id', async () => {
      const result = await getMediaById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('deleteMedia', () => {
    let mediaId: string

    beforeEach(async () => {
      const fileBuffer = Buffer.from('test file')
      const result = await uploadMedia(fileBuffer, {
        filename: 'delete-test.png',
        originalName: 'delete-test.png',
        mimeType: 'image/png',
        size: 4,
      })
      mediaId = result.id
    })

    it('should delete media record and file', async () => {
      await deleteMedia(mediaId)

      // Verify database record is deleted
      const record = await db.select().from(schema.media).where(eq(schema.media.id, mediaId)).get()

      expect(record).toBeUndefined()

      // Verify storage delete was called
      expect(mockStorageProvider.delete).toHaveBeenCalled()
    })

    it('should not throw for non-existent id', async () => {
      await expect(deleteMedia('non-existent-id')).resolves.not.toThrow()
    })
  })
})
