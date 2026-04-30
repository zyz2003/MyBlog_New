import { ArticleService } from '../../services/article.service'
import { successResponse, errorResponse, BusinessErrors } from '../../utils/response'

/**
 * GET /api/articles/:id
 * Public endpoint — get single article by ID
 */
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2002, '无效的文章 ID'),
    })
  }

  const article = await ArticleService.getById(id)

  if (!article) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.ARTICLE_NOT_FOUND.code, BusinessErrors.ARTICLE_NOT_FOUND.message),
    })
  }

  return successResponse(article)
})
