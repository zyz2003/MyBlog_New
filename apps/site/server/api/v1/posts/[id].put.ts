/**
 * PUT /api/v1/posts/:id
 *
 * Update an existing post
 *
 * Route params:
 * - id: Post ID (UUID)
 *
 * Request body (all optional - partial update):
 * - title?: string
 * - content?: string
 * - excerpt?: string
 * - coverImage?: string
 * - seoTitle?: string
 * - seoDescription?: string
 * - categoryId?: string
 * - tagIds?: string[]
 * - status?: 'draft' | 'reviewing' | 'published' | 'archived'
 *
 * Returns: Updated post with relations
 * Requires: Authentication
 * Throws: 404 if post not found
 */

import { defineEventHandler, getRouterParams } from 'h3'
import { updatePost } from '../../../services/post.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { updatePostSchema } from '../../../schemas/posts'
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

  // Parse and validate request body
  const body = await validateRequestBody(event, updatePostSchema)

  // Extract tagIds from body if provided
  const { tagIds, ...updateData } = body

  // Update the post
  const updatedPost = await updatePost(postId, updateData, tagIds)

  // Return updated post
  return createSuccessResponse(updatedPost, 'Post updated successfully')
})
