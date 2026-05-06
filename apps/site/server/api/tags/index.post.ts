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

  // Auto-generate slug from name if not provided
  let slug = body?.slug
  if (!slug) {
    slug = body.name
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!slug) {
      slug = `tag-${Date.now()}`
    }
  }

  const tag = await TagService.create({
    name: body.name,
    slug,
    color: body.color,
  })

  setResponseStatus(event, 201)
  return successResponse(tag)
})
