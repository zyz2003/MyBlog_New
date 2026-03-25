/**
 * PUT /api/v1/posts/:id
 *
 * Update a post by ID
 *
 * Request body:
 * - title?: string
 * - slug?: string
 * - content?: string
 * - excerpt?: string
 * - coverImage?: string
 * - seoTitle?: string
 * - seoDescription?: string
 * - status?: 'draft' | 'published' | 'archived' | 'reviewing'
 * - categoryId?: string | null
 * - tagIds?: string[]
 *
 * Returns: Updated post
 * Requires: Authentication
 * Throws: 404 if post not found
 */

import { defineEventHandler, readBody } from 'h3'
import { updatePost } from '../../../services/post.service'
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

  // Parse request body
  const body = await readBody(event)

  // Extract tagIds from body (for tag association)
  const { tagIds, ...postData } = body

  // Update the post
  const updatedPost = await updatePost(id, postData, tagIds || [])

  return updatedPost
})
