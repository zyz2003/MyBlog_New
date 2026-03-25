/**
 * PUT /api/v1/posts/bulk
 *
 * Bulk update posts by IDs
 * Body: { ids: string[]; status?: string }
 *
 * Returns: { updated: number }
 */

import { defineEventHandler, readBody } from 'h3'
import { updatePost } from '../../../services/post.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids, status } = body as { ids: string[]; status?: string }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'IDs array is required',
    })
  }

  // Update each post
  const updates = ids.map((id) => updatePost(id, status ? { status } : {}))
  await Promise.all(updates)

  return { updated: ids.length }
})
