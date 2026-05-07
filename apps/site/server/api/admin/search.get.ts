import { and, like, isNull, or, sql } from 'drizzle-orm'
import { db } from '../../utils/db'
import { posts, pages, media } from '../../db/schema'
import { successResponse } from '../../utils/response'

/**
 * GET /api/admin/search
 * Protected endpoint — global search across articles, pages, and media
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const query = getQuery(event)
  const keyword = (query.q as string || '').trim()
  const type = query.type as string | undefined
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))

  if (!keyword || keyword.length < 1) {
    return successResponse({ items: [] })
  }

  const searchPattern = `%${keyword}%`
  const items: Array<{
    type: 'article' | 'page' | 'media'
    id: number
    title: string
    subtitle?: string
    url: string
  }> = []

  // Search articles
  if (!type || type === 'article') {
    const articles = await db.select({
      id: posts.id,
      title: posts.title,
    }).from(posts)
      .where(and(
        isNull(posts.deletedAt),
        or(like(posts.title, searchPattern), like(posts.content || '', searchPattern)),
      ))
      .limit(limit)

    items.push(...articles.map(a => ({
      type: 'article' as const,
      id: a.id,
      title: a.title,
      url: `/admin/articles/${a.id}`,
    })))
  }

  // Search pages
  if (!type || type === 'page') {
    const pageResults = await db.select({
      id: pages.id,
      title: pages.title,
    }).from(pages)
      .where(and(
        isNull(pages.deletedAt),
        like(pages.title, searchPattern),
      ))
      .limit(limit)

    items.push(...pageResults.map(p => ({
      type: 'page' as const,
      id: p.id,
      title: p.title,
      url: `/admin/pages/${p.id}`,
    })))
  }

  // Search media
  if (!type || type === 'media') {
    const mediaResults = await db.select({
      id: media.id,
      originalName: media.originalName,
      url: media.url,
    }).from(media)
      .where(like(media.originalName, searchPattern))
      .limit(limit)

    items.push(...mediaResults.map(m => ({
      type: 'media' as const,
      id: m.id,
      title: m.originalName,
      subtitle: m.url,
      url: `/admin/media`,
    })))
  }

  return successResponse({ items })
})