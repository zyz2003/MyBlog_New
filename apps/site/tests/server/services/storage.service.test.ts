/**
 * Storage Service Tests
 *
 * Tests for the storage provider abstraction layer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import {
  StorageProvider,
  LocalStorageProvider,
  getStorageProvider,
} from '../../../server/services/storage.service'

describe('LocalStorageProvider', () => {
  let provider: StorageProvider
  const testUploadDir = join(process.cwd(), 'test-uploads')

  beforeEach(async () => {
    // Set test upload directory
    process.env.STORAGE_PATH = testUploadDir
    process.env.STORAGE_TYPE = 'local'

    // Create test upload directory
    await fs.mkdir(testUploadDir, { recursive: true })

    provider = new LocalStorageProvider(testUploadDir)
  })

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testUploadDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('save', () => {
    it('should save file to disk and return relative path', async () => {
      const testContent = Buffer.from('test file content')
      const filename = 'test-file.txt'

      const result = await provider.save(testContent, filename)

      expect(result).toBe(`test-file.txt`)
      expect(await fs.readFile(join(testUploadDir, filename))).toEqual(testContent)
    })

    it('should save file in subdirectory if path contains separator', async () => {
      const testContent = Buffer.from('nested file content')
      const filename = '2024/01/nested-file.txt'

      const result = await provider.save(testContent, filename)

      expect(result).toBe(`2024/01/nested-file.txt`)
      const fullPath = join(testUploadDir, '2024', '01', 'nested-file.txt')
      expect(await fs.readFile(fullPath)).toEqual(testContent)
    })
  })

  describe('delete', () => {
    it('should delete file from disk', async () => {
      const testContent = Buffer.from('to be deleted')
      const filename = 'delete-me.txt'

      // First save the file
      await provider.save(testContent, filename)
      const fullPath = join(testUploadDir, filename)
      expect(
        await fs
          .access(fullPath)
          .then(() => true)
          .catch(() => false)
      ).toBe(true)

      // Then delete it
      await provider.delete(filename)

      expect(
        await fs
          .access(fullPath)
          .then(() => true)
          .catch(() => false)
      ).toBe(false)
    })

    it('should not throw if file does not exist', async () => {
      await expect(provider.delete('non-existent-file.txt')).resolves.not.toThrow()
    })
  })

  describe('getUrl', () => {
    it('should return URL for local file', async () => {
      const filename = 'image.png'
      const url = await provider.getUrl(filename)

      expect(url).toBe(`/uploads/${filename}`)
    })

    it('should handle subdirectories in path', async () => {
      const filename = '2024/01/image.png'
      const url = await provider.getUrl(filename)

      expect(url).toBe(`/uploads/2024/01/image.png`)
    })
  })
})

describe('getStorageProvider', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    delete process.env.STORAGE_TYPE
    delete process.env.STORAGE_PATH
  })

  it('should return LocalStorageProvider when STORAGE_TYPE is local', async () => {
    process.env.STORAGE_TYPE = 'local'
    process.env.STORAGE_PATH = './uploads'

    const provider = getStorageProvider()

    expect(provider).toBeInstanceOf(LocalStorageProvider)
  })

  it('should return LocalStorageProvider by default when STORAGE_TYPE is not set', async () => {
    const provider = getStorageProvider()

    expect(provider).toBeInstanceOf(LocalStorageProvider)
  })

  it('should return LocalStorageProvider when STORAGE_TYPE is s3 but S3 config is missing', async () => {
    process.env.STORAGE_TYPE = 's3'
    // Don't set S3 credentials - should fall back to local

    const provider = getStorageProvider()

    expect(provider).toBeInstanceOf(LocalStorageProvider)
  })
})
