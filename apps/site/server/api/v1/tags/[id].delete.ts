/**
 * DELETE /api/v1/tags/:id
 *
 * Delete a tag
 *
 * Returns: 204 No Content
 * Requires: Authentication
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { deleteTag } from '../../../services/tag.service'
import { requireAuth } from '../../../middleware/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Get id from route params
  const id = getRouterParam(event, 'id')

  if (!id) {
    const { HTTPError } = await import('../../../utils/error')
    throw HTTPError.BAD_REQUEST('Tag ID is required')
  }

  // Delete the tag
  await deleteTag(id)

  // Return 204 No Content (undefined response)
  // Nitro automatically converts undefined to 204
})
