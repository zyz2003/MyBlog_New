import { eq, and, or, like, sql, desc } from 'drizzle-orm'
import { db } from '../utils/db'
import { posts } from '../db/schema'
import { successResponse, errorResponse, ValidationErrors } from '../utils/response'
import { cache } from '../services/cache.service'

/**
 * GET /api/search?q=keyword[&page=1][&pageSize=10]
 *
 * Public endpoint for article keyword search. Matches against
 * title and content of published articles. Results are cached
 * for 2 minutes.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim()
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10))

  if (!q) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, '搜索关键词不能为空'),
    })
  }

  // Check cache first
  const cacheKey = `search:${q}:${page}:${pageSize}`
  const cached = cache.get(cacheKey)
  if (cached) return successResponse(cached)

  const offset = (page - 1) * pageSize
  const pattern = `%${q}%`

  // Drizzle ORM parameterized LIKE queries (safe from SQL injection)
  const conditions = and(
    eq(posts.status, 'published'),
    sql`${posts.deletedAt} IS NULL`,
    or(
      like(posts.title, pattern),
      like(posts.content, pattern),
    ),
  )

  const [items, countResult] = await Promise.all([
    db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      publishedAt: posts.publishedAt,
    })
      .from(posts)
      .where(conditions)
      .orderBy(desc(posts.publishedAt))
      .limit(pageSize)
      .offset(offset),

    db.select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(conditions),
  ])

  const total = countResult[0]?.count ?? 0
  const result = { items, total, page, pageSize }

  // Cache for 2 minutes
  cache.set(cacheKey, result, 120)

  return successResponse(result)
})
