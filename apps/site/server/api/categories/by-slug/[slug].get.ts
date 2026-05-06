import { CategoryService } from '../../../services/category.service'
import { successResponse, errorResponse } from '../../../utils/response'

/**
 * GET /api/categories/by-slug/:slug
 * Public endpoint — get single category by slug
 */
export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2002, '缺少分类 slug'),
    })
  }

  const category = await CategoryService.getBySlug(slug)

  if (!category) {
    throw createError({
      statusCode: 404,
      data: errorResponse(3001, '分类不存在'),
    })
  }

  return successResponse(category)
})
