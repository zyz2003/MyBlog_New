import { ArticleService } from '../../../services/article.service'
import { successResponse, errorResponse, BusinessErrors } from '../../../utils/response'

/**
 * GET /api/articles/by-slug/:slug
 * Public endpoint — get single published article by slug
 */
export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2002, '缺少文章 slug'),
    })
  }

  const article = await ArticleService.getBySlug(slug)

  if (!article) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.ARTICLE_NOT_FOUND.code, BusinessErrors.ARTICLE_NOT_FOUND.message),
    })
  }

  return successResponse(article)
})
