import { CategoryService } from '../../services/category.service'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../utils/response'

/**
 * POST /api/categories
 * Protected endpoint — create a new category
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
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, '分类名称不能为空'),
    })
  }

  if (!body?.slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Slug 不能为空'),
    })
  }

  const category = await CategoryService.create({
    name: body.name,
    slug: body.slug,
    description: body.description,
    parentId: body.parentId,
    sortOrder: body.sortOrder,
  })

  setResponseStatus(event, 201)
  return successResponse(category)
})
