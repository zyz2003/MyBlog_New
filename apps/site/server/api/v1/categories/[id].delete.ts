/**
 * DELETE /api/v1/categories/:id
 *
 * Delete a category (children become top-level)
 *
 * Returns: 204 No Content
 * Requires: Authentication
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { deleteCategory } from '../../../services/category.service'
import { requireAuth } from '../../../middleware/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Get id from route params
  const id = getRouterParam(event, 'id')

  if (!id) {
    const { HTTPError } = await import('../../../utils/error')
    throw HTTPError.BAD_REQUEST('Category ID is required')
  }

  // Delete the category (children become top-level)
  await deleteCategory(id)

  // Return 204 No Content (undefined response)
  // Nitro automatically converts undefined to 204
})
