/**
 * GET /api/v1/tags
 *
 * Get list of all tags
 *
 * Returns: Array of all tags
 */

import { defineEventHandler } from 'h3'
import { listTags } from '../../../services/tag.service'
import { createSuccessResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  // Fetch all tags
  const tags = await listTags()

  // Return success response
  return createSuccessResponse(tags, 'Tags retrieved successfully')
})
