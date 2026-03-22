/**
 * PUT /api/v1/tags/:id
 *
 * Update an existing tag
 *
 * Request body:
 * - name?: string (1-100 chars)
 * - slug?: string (1-200 chars)
 * - description?: string (max 500 chars)
 * - color?: string (color value)
 *
 * Returns: Updated tag
 * Requires: Authentication
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { updateTag } from '../../../services/tag.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { updateTagSchema } from '../../../schemas/tags'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Get id from route params
  const id = getRouterParam(event, 'id')

  if (!id) {
    const { HTTPError } = await import('../../../utils/error')
    throw HTTPError.BAD_REQUEST('Tag ID is required')
  }

  // Parse and validate request body
  const body = await validateRequestBody(event, updateTagSchema)

  // Update the tag
  const updatedTag = await updateTag(id, body)

  // Return success response with updated tag
  return createSuccessResponse(updatedTag, 'Tag updated successfully')
})
