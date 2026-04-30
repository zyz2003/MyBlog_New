import { CategoryService } from '../../services/category.service'
import { successResponse, errorResponse, AuthErrors, BusinessErrors } from '../../utils/response'

/**
 * PUT /api/categories/:id
 * Protected endpoint — update a category
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

  const body = await readBody(event)

  const category = await CategoryService.update(id, {
    name: body.name,
    slug: body.slug,
    description: body.description,
    parentId: body.parentId,
    sortOrder: body.sortOrder,
  })

  if (!category) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.CATEGORY_NOT_FOUND.code, BusinessErrors.CATEGORY_NOT_FOUND.message),
    })
  }

  return successResponse(category)
})
