import { and, eq, isNull, desc } from 'drizzle-orm'
import { db } from '../../utils/db'
import { posts, pages } from '../../db/schema'
import { successResponse } from '../../utils/response'

/**
 * GET /api/admin/drafts
 * Protected endpoint — list all draft articles and pages
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const [draftArticles, draftPages] = await Promise.all([
    db.select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      updatedAt: posts.updatedAt,
    }).from(posts)
      .where(and(isNull(posts.deletedAt), eq(posts.status, 'draft')))
      .orderBy(desc(posts.updatedAt)),
    db.select({
      id: pages.id,
      title: pages.title,
      status: pages.status,
      updatedAt: pages.updatedAt,
    }).from(pages)
      .where(and(isNull(pages.deletedAt), eq(pages.status, 'draft')))
      .orderBy(desc(pages.updatedAt)),
  ])

  const items = [
    ...draftArticles.map(a => ({ ...a, type: 'article' as const })),
    ...draftPages.map(p => ({ ...p, type: 'page' as const })),
  ].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return bTime - aTime
  })

  return successResponse(items)
})
