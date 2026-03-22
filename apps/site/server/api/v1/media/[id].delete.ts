/**
 * DELETE /api/v1/media/:id
 *
 * Delete a media file by ID
 * Requires authentication
 *
 * Route parameters:
 * - id: Media file UUID (required)
 *
 * Returns: 204 No Content on success
 * Requires: Authentication
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'
import { requireAuth } from '../../../middleware/auth'
import { deleteMedia } from '../../../services/media.service'
import { validateParams } from '../../../utils/validate'
import { HTTPError } from '../../../utils/error'

const mediaIdSchema = z.object({
  id: z.string().uuid('Invalid media ID format'),
})

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse and validate route parameters
  const params = validateParams({ id: getRouterParam(event, 'id') || '' }, mediaIdSchema)

  // Check if media exists before deleting
  const mediaRecord = await deleteMedia(params.id)

  if (!mediaRecord) {
    throw HTTPError.NOT_FOUND('Media file not found')
  }

  // Return 204 No Content
  event.node.res.statusCode = 204
  return null
})
