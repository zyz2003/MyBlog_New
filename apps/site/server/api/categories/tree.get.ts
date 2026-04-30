import { CategoryService } from '../../services/category.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/categories/tree
 * Public endpoint — category tree with nested children
 */
export default defineEventHandler(async () => {
  const tree = await CategoryService.tree()
  return successResponse(tree)
})
