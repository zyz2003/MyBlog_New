/**
 * GET /api/v1/posts/:id
 *
 * Get a single post by ID or slug
 * Route params:
 * - id: Post ID (UUID) or slug
 *
 * Returns: Post with category, tags, and author relations
 * Throws: 404 if post not found
 */

import { defineEventHandler, getRouterParams } from 'h3'
import { getPostById } from '../../../services/post.service'
import { createSuccessResponse } from '../../../utils/response'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Get id/slug from route params - try multiple sources for test compatibility
  const routerParams = getRouterParams(event) as { id?: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contextParams = (event.context as any)?.params as { id?: string }
  const id = routerParams?.id || contextParams?.id

  if (!id) {
    throw HTTPError.BAD_REQUEST('Post ID is required')
  }

  // Determine if id is a UUID or slug and fetch accordingly
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let post
  if (isUuid) {
    // Fetch by UUID
    post = await getPostById(id, {
      includeCategory: true,
      includeTags: true,
      includeAuthor: true,
    })
  } else {
    // Fetch by slug - need to query by slug instead of id
    post = await getPostBySlug(id)
  }

  if (!post) {
    throw HTTPError.NOT_FOUND('Post not found')
  }

  // Return success response with post data
  return createSuccessResponse(post)
})

/**
 * Get post by slug - helper function since getPostById only supports ID
 */
async function getPostBySlug(slug: string) {
  // Use the database from post.service to ensure consistency with test setup
  const { getPostBySlug: getPostBySlugService } = await import('../../../services/post.service')
  return getPostBySlugService(slug)
}
