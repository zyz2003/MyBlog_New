import { eq, and, or, like, sql, desc } from 'drizzle-orm'
import { db } from '../utils/db'
import { posts } from '../db/schema'
import { successResponse, errorResponse, ValidationErrors } from '../utils/response'
import { cache } from '../services/cache.service'
import { SettingsService } from '../services/settings.service'

interface AlgoliaHit {
  objectID?: string
  id?: number | string
  title?: string
  slug?: string
  excerpt?: string
  description?: string
  summary?: string
  content?: string
  coverImage?: string
  cover?: string
  publishedAt?: string
  createdAt?: string
}

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
  const requestedProvider = typeof query.provider === 'string' ? query.provider : ''

  if (!q) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, '搜索关键词不能为空'),
    })
  }

  const [searchSetting, localSearchSetting, algoliaSearchSetting] = await Promise.all([
    SettingsService.getByKey('search'),
    SettingsService.getByKey('localSearch'),
    SettingsService.getByKey('algoliaSearch'),
  ])

  const provider = requestedProvider
    || String((searchSetting?.value as Record<string, unknown> | undefined)?.provider || '')

  const localSearchConfig = (localSearchSetting?.value as Record<string, unknown> | undefined) ?? {}
  const algoliaConfig = (algoliaSearchSetting?.value as Record<string, unknown> | undefined) ?? {}

  const cacheKey = `search:${provider || 'local'}:${q}:${page}:${pageSize}`
  const cached = cache.get(cacheKey)
  if (cached) {
    return successResponse(cached)
  }

  if (provider === 'algolia') {
    if (!Boolean(algoliaConfig.enable) || !algoliaConfig.appId || !algoliaConfig.apiKey || !algoliaConfig.indexName) {
      throw createError({
        statusCode: 400,
        data: errorResponse(ValidationErrors.INVALID_FORMAT.code, 'Algolia 搜索尚未配置完整，请在后台页面配置中补全 App ID、API Key 与 Index Name。'),
      })
    }

    const algoliaPageSize = Math.min(50, Math.max(1, Number(algoliaConfig.perPage || pageSize)))
    const tags = Array.isArray(algoliaConfig.tags) ? algoliaConfig.tags.map(item => String(item)).filter(Boolean) : []

    const response = await $fetch<{
      hits: AlgoliaHit[]
      nbHits: number
      page: number
      hitsPerPage: number
    }>(
      `https://${String(algoliaConfig.appId)}-dsn.algolia.net/1/indexes/${encodeURIComponent(String(algoliaConfig.indexName))}/query`,
      {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': String(algoliaConfig.apiKey),
          'X-Algolia-Application-Id': String(algoliaConfig.appId),
        },
        body: {
          query: q,
          page: page - 1,
          hitsPerPage: algoliaPageSize,
          ...(tags.length > 0 ? { tagFilters: tags } : {}),
        },
      },
    )

    const result = {
      items: (response.hits || []).map(hit => ({
        id: Number(hit.id || hit.objectID || 0),
        title: String(hit.title || '未命名文章'),
        slug: hit.slug || null,
        excerpt: hit.excerpt || hit.description || hit.summary || hit.content || '',
        coverImage: hit.coverImage || hit.cover || null,
        publishedAt: hit.publishedAt || null,
        createdAt: hit.createdAt || null,
      })),
      total: response.nbHits || 0,
      page,
      pageSize: response.hitsPerPage || algoliaPageSize,
    }

    cache.set(cacheKey, result, 120)
    return successResponse(result)
  }

  if (provider === 'docsearch') {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.INVALID_FORMAT.code, 'DocSearch 需要前端接入专用 UI，本地文章搜索接口暂不支持该提供商。'),
    })
  }

  if (provider && provider !== 'local') {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.INVALID_FORMAT.code, '当前搜索提供商不可用。'),
    })
  }

  if (localSearchConfig.enable === false && provider === 'local') {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.INVALID_FORMAT.code, '本地搜索未启用，请在后台页面配置中开启。'),
    })
  }

  const offset = (page - 1) * pageSize
  const pattern = `%${q}%`
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
      createdAt: posts.createdAt,
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

  cache.set(cacheKey, result, 120)

  return successResponse(result)
})
