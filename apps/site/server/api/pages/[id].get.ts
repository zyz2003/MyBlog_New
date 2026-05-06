import { PageService } from '../../services/page.service'
import { successResponse, errorResponse, BusinessErrors } from '../../utils/response'

/**
 * GET /api/pages/:id
 * Get a single page by ID
 */
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      data: errorResponse(BusinessErrors.MISSING_PARAM.code, '无效的页面 ID'),
    })
  }

  const page = await PageService.getById(id)

  if (!page) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.PAGE_NOT_FOUND.code, BusinessErrors.PAGE_NOT_FOUND.message),
    })
  }

  return successResponse(page)
})
