import RSS from 'rss'
import { db } from '../utils/db'
import { posts } from '../db/schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

/**
 * GET /rss.xml — RSS 2.0 feed of published articles
 * Returns XML with proper Content-Type for feed readers
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl
  const siteName = config.public.siteName

  const feed = new RSS({
    title: siteName,
    description: `${siteName} - Blog Feed`,
    feed_url: `${siteUrl}/rss.xml`,
    site_url: siteUrl,
    language: 'zh-CN',
  })

  const items = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(20)

  for (const item of items) {
    // Generate date+ID URL format
    const date = item.publishedAt || new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const url = `${siteUrl}/articles/${year}/${month}/${item.id}`

    feed.item({
      title: item.title,
      description: item.excerpt || '',
      url,
      date,
    })
  }

  setResponseHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return feed.xml({ indent: true })
})
