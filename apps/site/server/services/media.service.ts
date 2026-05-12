import { eq, desc, sql, like, or, and } from 'drizzle-orm'
import { db } from '../utils/db'
import { media } from '../db/schema'

/** Allowed MIME types for upload */
const ALLOWED_MIMES = [
  // 图片
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/x-icon',
  'image/tiff',
  // 文档
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  // 音视频
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'video/x-msvideo',
  // 压缩包
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
] as const

/** Maximum file size: 10MB */
const MAX_SIZE = 10 * 1024 * 1024

/** Media service — CRUD operations with database storage */
export class MediaService {
  /** Upload a file: validate, store in DB */
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

    // Generate filename
    const ext = originalName.split('.').pop() || ''
    const filename = `${crypto.randomUUID()}.${ext}`

    // Store in database
    const [record] = await db
      .insert(media)
      .values({
        userId,
        filename,
        originalName,
        mimeType,
        size,
        extension: ext,
        storageType: 'database',
        url: `/api/media/${filename}`, // URL will be served by file endpoint
        data: buffer,
      })
      .returning()

    return record
  }

  /** List media with pagination, optional search and type filter, ordered by createdAt DESC */
  static async list(query: { page?: number; pageSize?: number; keyword?: string; type?: string } = {}) {
    const page = Math.max(1, query.page || 1)
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20))
    const offset = (page - 1) * pageSize

    // Build where conditions
    const conditions = []
    if (query.keyword) {
      const kw = `%${query.keyword}%`
      conditions.push(or(
        like(media.filename, kw),
        like(media.originalName, kw),
      ))
    }
    if (query.type === 'image') {
      conditions.push(like(media.mimeType, 'image/%'))
    } else if (query.type === 'document') {
      conditions.push(sql`${media.mimeType} NOT LIKE 'image/%'`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: media.id,
          userId: media.userId,
          filename: media.filename,
          originalName: media.originalName,
          title: media.title,
          alt: media.alt,
          caption: media.caption,
          mimeType: media.mimeType,
          size: media.size,
          extension: media.extension,
          storageType: media.storageType,
          url: media.url,
          cdnUrl: media.cdnUrl,
          width: media.width,
          height: media.height,
          createdAt: media.createdAt,
        })
        .from(media)
        .where(whereClause)
        .orderBy(desc(media.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(media)
        .where(whereClause),
    ])

    const total = countResult[0]?.count || 0
    const totalPages = Math.ceil(total / pageSize)

    return { items, total, page, pageSize, totalPages }
  }

  /** Get single media record by ID (without data buffer) */
  static async getById(id: number) {
    const [record] = await db
      .select({
        id: media.id,
        userId: media.userId,
        filename: media.filename,
        originalName: media.originalName,
        title: media.title,
        alt: media.alt,
        caption: media.caption,
        mimeType: media.mimeType,
        size: media.size,
        extension: media.extension,
        storageType: media.storageType,
        url: media.url,
        cdnUrl: media.cdnUrl,
        width: media.width,
        height: media.height,
        createdAt: media.createdAt,
      })
      .from(media)
      .where(eq(media.id, id))
      .limit(1)

    return record || null
  }

  /** Get file data by filename (for serving files) */
  static async getFileByFilename(filename: string) {
    const [record] = await db
      .select({
        data: media.data,
        mimeType: media.mimeType,
        filename: media.filename,
        originalName: media.originalName,
        size: media.size,
      })
      .from(media)
      .where(eq(media.filename, filename))
      .limit(1)

    return record || null
  }

  /** Delete media: remove from DB */
  static async delete(id: number) {
    const record = await MediaService.getById(id)
    if (!record) {
      throw createError({
        statusCode: 404,
        message: '媒体文件不存在',
      })
    }

    await db.delete(media).where(eq(media.id, id))
    return true
  }
}
