/**
 * GET /api/v1/categories
 *
 * Get list of all categories with hierarchy tree structure
 *
 * Returns: Array of root categories with nested children
 */

import { defineEventHandler } from 'h3'
import { listCategories } from '../../../services/category.service'
import { createSuccessResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  // Fetch categories with hierarchy
  const categories = await listCategories()

  // Return success response
  return createSuccessResponse(categories, 'Categories retrieved successfully')
})
