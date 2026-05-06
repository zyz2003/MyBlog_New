import { count, and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '../../utils/db'
import { posts, pages, media, categories, tags } from '../../db/schema'
import { successResponse } from '../../utils/response'

/**
 * GET /api/admin/stats
 * Protected endpoint — dashboard statistics
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const [
    articlesTotal,
    publishedArticles,
    draftArticles,
    pagesTotal,
    mediaTotal,
    categoriesTotal,
    tagsTotal,
    totalViews,
  ] = await Promise.all([
    db.select({ total: count() }).from(posts).where(isNull(posts.deletedAt)),
    db.select({ total: count() }).from(posts).where(and(isNull(posts.deletedAt), eq(posts.status, 'published'))),
    db.select({ total: count() }).from(posts).where(and(isNull(posts.deletedAt), eq(posts.status, 'draft'))),
    db.select({ total: count() }).from(pages).where(isNull(pages.deletedAt)),
    db.select({ total: count() }).from(media),
    db.select({ total: count() }).from(categories),
    db.select({ total: count() }).from(tags),
    db.select({ total: sql<number>`COALESCE(SUM(${posts.viewCount}), 0)` }).from(posts).where(isNull(posts.deletedAt)),
  ])

  return successResponse({
    articles: articlesTotal[0]?.total ?? 0,
    publishedArticles: publishedArticles[0]?.total ?? 0,
    draftArticles: draftArticles[0]?.total ?? 0,
    pages: pagesTotal[0]?.total ?? 0,
    media: mediaTotal[0]?.total ?? 0,
    categories: categoriesTotal[0]?.total ?? 0,
    tags: tagsTotal[0]?.total ?? 0,
    totalViews: totalViews[0]?.total ?? 0,
  })
})
