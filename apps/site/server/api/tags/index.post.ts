import { TagService } from '../../services/tag.service'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../utils/response'

/**
 * POST /api/tags
 * Protected endpoint — create a new tag
 */
export default defineEventHandler(async (event) => {
  // Auth check
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const body = await readBody(event)

  // Validate required fields
  if (!body?.name) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, '标签名称不能为空'),
    })
  }

  if (!body?.slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Slug 不能为空'),
    })
  }

  const tag = await TagService.create({
    name: body.name,
    slug: body.slug,
    color: body.color,
  })

  setResponseStatus(event, 201)
  return successResponse(tag)
})
