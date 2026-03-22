/**
 * GET /api/v1/categories/:id
 *
 * Get a single category by ID
 *
 * Returns: Category details
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { getCategoryById } from '../../../services/category.service'
import { createSuccessResponse } from '../../../utils/response'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Get id from route params
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw HTTPError.BAD_REQUEST('Category ID is required')
  }

  // Fetch the category
  const category = await getCategoryById(id)

  if (!category) {
    throw HTTPError.NOT_FOUND('Category not found')
  }

  // Return success response with category data
  return createSuccessResponse(category, 'Category retrieved successfully')
})
