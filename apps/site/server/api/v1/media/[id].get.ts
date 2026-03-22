/**
 * GET /api/v1/media/:id
 *
 * Get a single media file by ID
 *
 * Route parameters:
 * - id: Media file UUID (required)
 *
 * Returns: Media object
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'
import { getMediaById } from '../../../services/media.service'
import { createSuccessResponse } from '../../../utils/response'
import { validateParams } from '../../../utils/validate'
import { HTTPError } from '../../../utils/error'

const mediaIdSchema = z.object({
  id: z.string().uuid('Invalid media ID format'),
})

export default defineEventHandler(async (event) => {
  // Parse and validate route parameters
  const params = validateParams({ id: getRouterParam(event, 'id') || '' }, mediaIdSchema)

  // Fetch media by ID
  const mediaRecord = await getMediaById(params.id)

  if (!mediaRecord) {
    throw HTTPError.NOT_FOUND('Media file not found')
  }

  // Return media data
  return createSuccessResponse(mediaRecord, 'Media file retrieved successfully')
})
