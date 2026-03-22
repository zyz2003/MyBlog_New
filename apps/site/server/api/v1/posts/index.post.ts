/**
 * POST /api/v1/posts
 *
 * Create a new post
 *
 * Request body:
 * - title: string (required, 1-200 chars)
 * - content: string (required, markdown)
 * - excerpt?: string (optional, auto-generated if not provided)
 * - coverImage?: string (optional, URL)
 * - seoTitle?: string (optional)
 * - seoDescription?: string (optional)
 * - categoryId?: string (optional, UUID)
 * - tagIds?: string[] (optional, array of tag UUIDs)
 * - status?: 'draft' | 'reviewing' | 'published' | 'archived' (default: 'draft')
 *
 * Returns: Created post with relations
 * Requires: Authentication
 */

import { defineEventHandler } from 'h3'
import { createPost } from '../../../services/post.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { createPostSchema } from '../../../schemas/posts'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse and validate request body
  const body = await validateRequestBody(event, createPostSchema)

  // Extract tagIds from body (not part of NewPost)
  const { tagIds = [], ...postData } = body

  // Create the post
  const createdPost = await createPost(
    {
      ...postData,
      authorId: event.context.user!.id,
    },
    tagIds
  )

  // Return 201 Created with post data
  return createSuccessResponse(createdPost, 'Post created successfully')
})
