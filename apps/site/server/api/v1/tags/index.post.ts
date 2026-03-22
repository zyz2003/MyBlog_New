/**
 * POST /api/v1/tags
 *
 * Create a new tag
 *
 * Request body:
 * - name: string (required, 1-100 chars)
 * - slug: string (required, 1-200 chars)
 * - description?: string (optional, max 500 chars)
 * - color?: string (optional, color value)
 *
 * Returns: Created tag
 * Requires: Authentication
 */

import { defineEventHandler } from 'h3'
import { createTag } from '../../../services/tag.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { createTagSchema } from '../../../schemas/tags'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse and validate request body
  const body = await validateRequestBody(event, createTagSchema)

  // Create the tag
  const createdTag = await createTag(body)

  // Return 201 Created with tag data
  return createSuccessResponse(createdTag, 'Tag created successfully')
})
