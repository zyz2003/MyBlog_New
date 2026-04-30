import { CategoryService } from '../../services/category.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/categories
 * Public endpoint — list all categories flat
 */
export default defineEventHandler(async () => {
  const categoryList = await CategoryService.list()
  return successResponse(categoryList)
})
