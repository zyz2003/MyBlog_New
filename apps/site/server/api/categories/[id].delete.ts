import { CategoryService } from '../../services/category.service'
import { successResponse, errorResponse, AuthErrors, BusinessErrors } from '../../utils/response'

/**
 * DELETE /api/categories/:id
 * Protected endpoint — delete a category (fails if has children)
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
      data: errorResponse(2002, '无效的分类 ID'),
    })
  }

  const deleted = await CategoryService.delete(id)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.CATEGORY_NOT_FOUND.code, BusinessErrors.CATEGORY_NOT_FOUND.message),
    })
  }

  return successResponse({ id })
})
