import { TagService } from '../../services/tag.service'
import { successResponse, errorResponse, AuthErrors, BusinessErrors } from '../../utils/response'

/**
 * DELETE /api/tags/:id
 * Protected endpoint — delete a tag
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
      data: errorResponse(2002, '无效的标签 ID'),
    })
  }

  const deleted = await TagService.delete(id)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.TAG_NOT_FOUND.code, BusinessErrors.TAG_NOT_FOUND.message),
    })
  }

  return successResponse({ id })
})
