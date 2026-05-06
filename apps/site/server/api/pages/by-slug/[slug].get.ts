import { PageService } from '../../../services/page.service'
import { successResponse, errorResponse, BusinessErrors } from '../../../utils/response'

/**
 * GET /api/pages/by-slug/:slug
 * Public endpoint — get a published page by slug
 */
export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(BusinessErrors.MISSING_PARAM.code, 'Slug 不能为空'),
    })
  }

  const page = await PageService.getBySlug(slug)

  if (!page) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.PAGE_NOT_FOUND.code, BusinessErrors.PAGE_NOT_FOUND.message),
    })
  }

  return successResponse(page)
})
