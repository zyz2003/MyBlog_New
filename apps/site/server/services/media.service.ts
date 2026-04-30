import { eq, desc, sql } from 'drizzle-orm'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { db } from '../utils/db'
import { media } from '../db/schema'
import { createStorageAdapter } from '../storage'
import type { StorageConfig } from '../storage'

/** Allowed MIME types for upload */
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
] as const

/** Maximum file size: 10MB */
const MAX_SIZE = 10 * 1024 * 1024

/** Default storage config — local filesystem */
const defaultStorageConfig: StorageConfig = {
  type: 'local',
  basePath: join(process.cwd(), 'uploads'),
  baseUrl: '/uploads',
}

/** Media service — CRUD operations with storage integration */
export class MediaService {
  /** Upload a file: validate, store, and create DB record */
  static async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    size: number,
    userId: number,
  ) {
    // Validate MIME type
    if (!ALLOWED_MIMES.includes(mimeType as (typeof ALLOWED_MIMES)[number])) {
      throw createError({
        statusCode: 400,
        message: `不支持的文件类型: ${mimeType}。允许的类型: ${ALLOWED_MIMES.join(', ')}`,
      })
    }

    // Validate file size
    if (size > MAX_SIZE) {
      throw createError({
        statusCode: 400,
        message: `文件大小超过限制。最大允许: ${MAX_SIZE / 1024 / 1024}MB`,
      })
    }

    // Generate unique filename
    const ext = originalName.split('.').pop() || ''
    const filename = `${randomUUID()}.${ext}`
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const storagePath = `images/${year}/${month}/${filename}`

    // Upload via storage adapter
    const storage = createStorageAdapter(defaultStorageConfig)
    const url = await storage.upload(buffer, storagePath, mimeType)

    // Insert DB record
    const [record] = await db
      .insert(media)
      .values({
        userId,
        filename,
        originalName,
        mimeType,
        size,
        extension: ext,
        storageType: 'local',
        storagePath,
        url,
      })
      .returning()

    return record
  }

  /** List media with pagination, ordered by createdAt DESC */
  static async list(query: { page?: number; pageSize?: number } = {}) {
    const page = Math.max(1, query.page || 1)
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20))
    const offset = (page - 1) * pageSize

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(media)
        .orderBy(desc(media.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(media),
    ])

    const total = countResult[0]?.count || 0
    const totalPages = Math.ceil(total / pageSize)

    return { items, total, page, pageSize, totalPages }
  }

  /** Get single media record by ID */
  static async getById(id: number) {
    const [record] = await db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1)

    return record || null
  }

  /** Delete media: remove file from storage + DB record */
  static async delete(id: number) {
    const record = await MediaService.getById(id)
    if (!record) {
      throw createError({
        statusCode: 404,
        message: '媒体文件不存在',
      })
    }

    // Remove file from storage
    const storage = createStorageAdapter(defaultStorageConfig)
    await storage.delete(record.storagePath)

    // Remove DB record
    await db.delete(media).where(eq(media.id, id))

    return true
  }
}
