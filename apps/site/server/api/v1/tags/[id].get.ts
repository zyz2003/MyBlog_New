/**
 * GET /api/v1/tags/:id
 *
 * Get a single tag by ID
 *
 * Returns: Tag details
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { getTagById } from '../../../services/tag.service'
import { createSuccessResponse } from '../../../utils/response'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Get id from route params
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw HTTPError.BAD_REQUEST('Tag ID is required')
  }

  // Fetch the tag
  const tag = await getTagById(id)

  if (!tag) {
    throw HTTPError.NOT_FOUND('Tag not found')
  }

  // Return success response with tag data
  return createSuccessResponse(tag, 'Tag retrieved successfully')
})
