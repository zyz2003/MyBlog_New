import { ArticleService } from '../../services/article.service'
import { successResponse, errorResponse, AuthErrors, BusinessErrors } from '../../utils/response'

/**
 * DELETE /api/articles/:id
 * Protected endpoint — soft-delete an article
 */
export default defineEventHandler(async (event) => {
  // Auth check
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const id = Number(event.context.params?.id)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2002, '无效的文章 ID'),
    })
  }

  const deleted = await ArticleService.softDelete(id)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.ARTICLE_NOT_FOUND.code, BusinessErrors.ARTICLE_NOT_FOUND.message),
    })
  }

  return successResponse({ id })
})
