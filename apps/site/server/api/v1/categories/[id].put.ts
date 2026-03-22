/**
 * PUT /api/v1/categories/:id
 *
 * Update an existing category
 *
 * Request body:
 * - name?: string (1-100 chars)
 * - slug?: string (1-200 chars)
 * - description?: string (max 500 chars)
 * - parentId?: string | null (UUID - must reference existing category)
 *
 * Returns: Updated category
 * Requires: Authentication
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { updateCategory } from '../../../services/category.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { updateCategorySchema } from '../../../schemas/categories'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Get id from route params
  const id = getRouterParam(event, 'id')

  if (!id) {
    const { HTTPError } = await import('../../../utils/error')
    throw HTTPError.BAD_REQUEST('Category ID is required')
  }

  // Parse and validate request body
  const body = await validateRequestBody(event, updateCategorySchema)

  // Update the category
  const updatedCategory = await updateCategory(id, body)

  // Return success response with updated category
  return createSuccessResponse(updatedCategory, 'Category updated successfully')
})
