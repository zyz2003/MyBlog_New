/**
 * DELETE /api/v1/posts/bulk
 *
 * Bulk delete multiple posts by IDs
 *
 * Request body:
 * - ids: string[] (required, array of post UUIDs, min 1)
 *
 * Returns: { deleted: number } - count of deleted posts
 * Requires: Authentication
 * Throws: 400 if IDs array is empty
 */

import { defineEventHandler } from 'h3'
import { deleteMany } from '../../../services/post.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { bulkDeleteSchema } from '../../../schemas/posts'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse and validate request body
  const body = await validateRequestBody(event, bulkDeleteSchema)

  // Delete posts
  const deletedCount = await deleteMany(body.ids)

  // Return deletion count
  return createSuccessResponse(
    { deleted: deletedCount },
    `${deletedCount} post(s) deleted successfully`
  )
})
