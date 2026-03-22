/**
 * DELETE /api/v1/posts/:id
 *
 * Delete a post by ID
 *
 * Route params:
 * - id: Post ID (UUID)
 *
 * Returns: Deleted post data
 * Requires: Authentication
 * Throws: 404 if post not found
 */

import { defineEventHandler, getRouterParams } from 'h3'
import { deletePost } from '../../../services/post.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Get post ID from route params
  const params = getRouterParams(event) as { id?: string }
  const postId = params.id

  if (!postId) {
    throw HTTPError.BAD_REQUEST('Post ID is required')
  }

  // Delete the post
  const deletedPost = await deletePost(postId)

  // Return deleted post data
  return createSuccessResponse(deletedPost, 'Post deleted successfully')
})
