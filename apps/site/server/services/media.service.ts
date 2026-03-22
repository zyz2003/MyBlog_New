/**
 * Media Service
 *
 * Provides media CRUD operations for file uploads.
 * Handles file metadata storage and integration with storage providers.
 *
 * @module server/services/media
 */

import type { LibSQLDatabase } from 'drizzle-orm'
import { eq, desc, asc, sql, like, or, and } from 'drizzle-orm'
import { media, type NewMedia, type Media } from '@my-blog/database/schema'
import { getStorageProvider } from './storage.service'

/**
 * Media upload metadata
 */
export interface UploadMediaMetadata {
  filename: string
  originalName?: string
  mimeType: string
  size: number
  altText?: string
  folderId?: string
}

/**
 * Media list query parameters
 */
export interface ListMediaQuery {
  limit?: number
  offset?: number
  mimeType?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Pagination response type
 */
export interface PaginationResponse<T> {
  data: T[]
  meta: {
    total: number
    limit: number
    offset: number
    totalPages: number
    currentPage: number
  }
}

/**
 * Upload a file and create media record
 *
 * @param db - Database instance
 * @param buffer - File buffer
 * @param metadata - File metadata
 * @param userId - Optional user ID of uploader
 * @returns Created media record
 */
export async function uploadMedia(
  db: LibSQLDatabase,
  buffer: Buffer,
  metadata: UploadMediaMetadata,
  userId?: string
): Promise<Media> {
  // Get storage provider
  const storageProvider = getStorageProvider()

  // Save file to storage
  const relativePath = await storageProvider.save(buffer, metadata.filename)

  // Get URL for the file
  const url = await storageProvider.getUrl(relativePath)

  // Extract image dimensions if it's an image
  let width: number | undefined
  let height: number | undefined
  let thumbnailPath: string | undefined

  if (metadata.mimeType.startsWith('image/')) {
    try {
      // Use sharp to get image dimensions and generate thumbnail
      const { default: sharp } = await import('sharp')
      const imageMetadata = await sharp(buffer).metadata()
      width = imageMetadata.width
      height = imageMetadata.height

      // Generate thumbnail (resize to 200px width)
      const thumbnailFilename = `thumbnails/${metadata.filename.replace(/\.[^.]+$/, '-thumb.png')}`
      await sharp(buffer).resize({ width: 200 }).png().toFile(`./uploads/${thumbnailFilename}`)
      thumbnailPath = thumbnailFilename
    } catch {
      // If sharp fails or is not available, continue without dimensions
      // This can happen with non-standard image formats
    }
  }

  // Create media record
  const newMedia: NewMedia = {
    id: crypto.randomUUID(),
    filename: metadata.filename,
    originalName: metadata.originalName || metadata.filename,
    path: relativePath,
    url,
    mimeType: metadata.mimeType,
    size: metadata.size,
    width,
    height,
    altText: metadata.altText,
    thumbnailPath,
    folderId: metadata.folderId,
    uploadedBy: userId || null,
    uploadedAt: new Date(),
  }

  // Insert into database
  await db.insert(media).values(newMedia).run()

  return newMedia as Media
}

/**
 * List media with pagination and filtering
 *
 * @param db - Database instance
 * @param query - Query parameters
 * @returns Paginated list of media records
 */
export async function listMedia(
  db: LibSQLDatabase,
  query: ListMediaQuery = {}
): Promise<PaginationResponse<Media>> {
  const { limit = 10, offset = 0, mimeType, search, sort = 'uploadedAt', order = 'desc' } = query

  // Build WHERE conditions
  const conditions: (typeof media | ReturnType<typeof like>)[] = []

  if (mimeType) {
    conditions.push(eq(media.mimeType, mimeType))
  }

  if (search) {
    const searchTerm = `%${search}%`
    conditions.push(
      or(
        like(media.originalName, searchTerm),
        like(media.filename, searchTerm),
        like(media.altText, searchTerm)
      )
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(media)
    .where(whereClause)
    .get()

  const total = countResult?.count || 0

  // Get paginated results
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const orderBy: any =
    order === 'desc'
      ? desc((media as Record<string, unknown>)[sort as keyof typeof media] as any)
      : asc((media as Record<string, unknown>)[sort as keyof typeof media] as any)
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const records = await db
    .select()
    .from(media)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .all()

  return {
    data: records as unknown as Media[],
    meta: {
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
    },
  }
}

/**
 * Get media record by ID
 *
 * @param db - Database instance
 * @param id - Media ID
 * @returns Media record or null if not found
 */
export async function getMediaById(db: LibSQLDatabase, id: string): Promise<Media | null> {
  const record = await db.select().from(media).where(eq(media.id, id)).get()

  return (record as Media) || null
}

/**
 * Delete media record and associated file
 *
 * @param db - Database instance
 * @param id - Media ID
 */
export async function deleteMedia(db: LibSQLDatabase, id: string): Promise<void> {
  // Get media record
  const record = await getMediaById(db, id)

  if (!record) {
    // Already deleted or never existed
    return
  }

  // Delete file from storage
  const storageProvider = getStorageProvider()
  await storageProvider.delete(record.path)

  // Delete thumbnail if exists
  if (record.thumbnailPath) {
    try {
      await storageProvider.delete(record.thumbnailPath)
    } catch {
      // Ignore thumbnail deletion errors
    }
  }

  // Delete database record
  await db.delete(media).where(eq(media.id, id)).run()
}
