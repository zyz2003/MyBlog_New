import { ArticleService } from '../../services/article.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/articles
 * Public endpoint — paginated article list with filters
 * Supports: page, pageSize, status, categoryId, tagId, keyword
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const result = await ArticleService.list({
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    status: query.status as string | undefined,
    categoryId: query.categoryId ? Number(query.categoryId) : undefined,
    tagId: query.tagId ? Number(query.tagId) : undefined,
    keyword: query.keyword as string | undefined,
  })

  return successResponse(result)
})
