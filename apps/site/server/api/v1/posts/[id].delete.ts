/**
 * DELETE /api/v1/posts/:id
 *
 * Delete a post by ID
 *
 * Returns: { success: true }
 * Requires: Authentication
 * Throws: 404 if post not found
 */

import { defineEventHandler } from 'h3'
import { deletePost } from '../../../services/post.service'
import { requireAuth } from '../../../middleware/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Get post ID from URL
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Post ID is required',
    })
  }

  // Delete the post
  await deletePost(id)

  return { success: true }
})
