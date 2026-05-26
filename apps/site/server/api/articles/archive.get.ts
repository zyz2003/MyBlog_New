import { eq, desc, and, isNull } from 'drizzle-orm'
import { posts, postCategories, categories } from '../../db/schema'
import { db } from '../../utils/db'

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      coverImage: posts.coverImage,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(posts)
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
    .leftJoin(postCategories, eq(posts.id, postCategories.postId))
    .leftJoin(categories, eq(postCategories.categoryId, categories.id))
    .orderBy(desc(posts.publishedAt))

  // Deduplicate articles and group categories
  const articleMap = new Map<number, {
    id: number
    title: string
    publishedAt: Date | null
    createdAt: Date
    coverImage: string | null
    categories: Array<{ name: string; slug: string }>
  }>()

  for (const row of rows) {
    if (!articleMap.has(row.id)) {
      articleMap.set(row.id, {
        id: row.id,
        title: row.title,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        coverImage: row.coverImage,
        categories: [],
      })
    }
    if (row.categoryId && row.categoryName && row.categorySlug) {
      articleMap.get(row.id)!.categories.push({
        name: row.categoryName,
        slug: row.categorySlug,
      })
    }
  }

  // Group by year
  const yearMap = new Map<number, Array<typeof articleMap extends Map<number, infer V> ? V : never>>()

  for (const article of articleMap.values()) {
    const date = article.publishedAt ?? article.createdAt
    const year = new Date(date).getFullYear()
    if (!yearMap.has(year)) yearMap.set(year, [])
    yearMap.get(year)!.push(article)
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
        coverImage: a.coverImage,
        categories: a.categories,
      })),
    }))

  return { code: 200, data: { years } }
})