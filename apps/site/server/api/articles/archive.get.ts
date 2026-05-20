import { eq, desc, and, isNull } from 'drizzle-orm'
import { posts } from '../../db/schema/posts'
import { db } from '../../utils/db'

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
    .orderBy(desc(posts.publishedAt))

  // Group by year
  const yearMap = new Map<number, Array<{ id: number; title: string; publishedAt: Date | null; createdAt: Date }>>()

  for (const row of rows) {
    const date = row.publishedAt ?? row.createdAt
    const year = new Date(date).getFullYear()
    if (!yearMap.has(year)) yearMap.set(year, [])
    yearMap.get(year)!.push(row)
  }

  const years = Array.from(yearMap.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, articles]) => ({
      year,
      count: articles.length,
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
      })),
    }))

  return { code: 200, data: { years } }
})
