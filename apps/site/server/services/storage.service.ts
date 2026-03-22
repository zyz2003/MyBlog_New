/**
 * Storage Service
 *
 * Provides storage provider abstraction for file uploads.
 * Supports local storage and S3-compatible object storage.
 *
 * @module server/services/storage
 */

import { promises as fs } from 'fs'
import { join, dirname } from 'path'

/**
 * Storage provider interface - abstracts file storage operations
 */
export interface StorageProvider {
  /**
   * Save a file buffer to storage
   * @param buffer - File content buffer
   * @param filename - Filename (may include path separators for directories)
   * @returns Relative path to saved file
   */
  save(buffer: Buffer, filename: string): Promise<string>

  /**
   * Delete a file from storage
   * @param path - Relative path to file
   */
  delete(path: string): Promise<void>

  /**
   * Get URL for accessing the file
   * @param path - Relative path to file
   * @returns Public URL or path to access the file
   */
  getUrl(path: string): Promise<string>
}

/**
 * Local file system storage provider
 * Saves files to a local directory
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string
  private baseUrl: string

  constructor(uploadDir: string, baseUrl: string = '/uploads') {
    this.uploadDir = uploadDir
    this.baseUrl = baseUrl
  }

  /**
   * Save a file to local disk
   * @param buffer - File content buffer
   * @param filename - Filename (may include path separators)
   * @returns Relative path to saved file
   */
  async save(buffer: Buffer, filename: string): Promise<string> {
    const fullPath = join(this.uploadDir, filename)

    // Create directory if it doesn't exist
    await fs.mkdir(dirname(fullPath), { recursive: true })

    // Write file
    await fs.writeFile(fullPath, buffer)

    return filename
  }

  /**
   * Delete a file from local disk
   * @param path - Relative path to file
   */
  async delete(path: string): Promise<void> {
    const fullPath = join(this.uploadDir, path)

    try {
      await fs.unlink(fullPath)
    } catch (error: unknown) {
      // Ignore if file doesn't exist
      const err = error as NodeJS.ErrnoException
      if (err.code !== 'ENOENT') {
        throw error
      }
    }
  }

  /**
   * Get URL for local file
   * @param path - Relative path to file
   * @returns URL path for accessing the file
   */
  async getUrl(path: string): Promise<string> {
    // Normalize path separators to URL format
    const normalizedPath = path.replace(/\\/g, '/')
    return `${this.baseUrl}/${normalizedPath}`
  }
}

/**
 * S3-compatible object storage provider
 * For production deployments with S3, OSS, COS, etc.
 */
export class S3StorageProvider implements StorageProvider {
  private bucket: string
  private region: string
  private endpoint?: string

  constructor(bucket: string, region: string, options: { endpoint?: string } = {}) {
    this.bucket = bucket
    this.region = region
    this.endpoint = options.endpoint
  }

  /**
   * Save a file to S3
   * Note: Requires AWS SDK or S3-compatible client
   * This is a placeholder - implement with actual S3 SDK when needed
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(buffer: Buffer, filename: string): Promise<string> {
    // Placeholder implementation
    // In production, use @aws-sdk/client-s3 or similar
    throw new Error('S3StorageProvider.save() not implemented - requires S3 SDK integration')
  }

  /**
   * Delete a file from S3
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(path: string): Promise<void> {
    // Placeholder implementation
    throw new Error('S3StorageProvider.delete() not implemented - requires S3 SDK integration')
  }

  /**
   * Get S3 URL for file
   */
  async getUrl(path: string): Promise<string> {
    const normalizedPath = path.replace(/\\/g, '/')
    if (this.endpoint) {
      return `https://${this.endpoint}/${this.bucket}/${normalizedPath}`
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${normalizedPath}`
  }
}

/**
 * Get configured storage provider based on environment variables
 *
 * Environment variables:
 * - STORAGE_TYPE: 'local' (default) or 's3'
 * - STORAGE_PATH: Path for local storage (default: './uploads')
 * - STORAGE_S3_BUCKET: S3 bucket name (required for S3)
 * - STORAGE_S3_REGION: S3 region (required for S3)
 * - STORAGE_S3_ENDPOINT: S3 endpoint (optional, for S3-compatible services)
 *
 * @returns Configured storage provider
 */
export function getStorageProvider(): StorageProvider {
  const storageType = process.env.STORAGE_TYPE || 'local'

  if (storageType === 's3') {
    const bucket = process.env.STORAGE_S3_BUCKET
    const region = process.env.STORAGE_S3_REGION
    const endpoint = process.env.STORAGE_S3_ENDPOINT

    // Fall back to local if S3 config is missing
    if (!bucket || !region) {
      console.warn('[Storage] S3 configuration incomplete, falling back to local storage')
      return getLocalStorageProvider()
    }

    return new S3StorageProvider(bucket, region, { endpoint })
  }

  return getLocalStorageProvider()
}

/**
 * Get local storage provider
 */
function getLocalStorageProvider(): StorageProvider {
  const storagePath = process.env.STORAGE_PATH || './uploads'
  return new LocalStorageProvider(storagePath)
}

// Export default provider
export default getStorageProvider()
