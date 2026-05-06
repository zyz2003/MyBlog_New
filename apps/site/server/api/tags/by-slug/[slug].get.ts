import { TagService } from '../../../services/tag.service'
import { successResponse, errorResponse } from '../../../utils/response'

/**
 * GET /api/tags/by-slug/:slug
 * Public endpoint — get single tag by slug
 */
export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2002, '缺少标签 slug'),
    })
  }

  const tag = await TagService.getBySlug(slug)

  if (!tag) {
    throw createError({
      statusCode: 404,
      data: errorResponse(3002, '标签不存在'),
    })
  }

  return successResponse(tag)
})
