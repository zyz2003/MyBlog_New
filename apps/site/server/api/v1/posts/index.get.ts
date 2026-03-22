/**
 * GET /api/v1/posts
 *
 * Get list of posts with pagination, filtering, and sorting
 * Query parameters:
 * - limit: Number of posts per page (default: 10, max: 100)
 * - offset: Number of posts to skip (default: 0)
 * - category: Filter by category slug
 * - tag: Filter by tag slug
 * - status: Filter by status (draft, published, archived)
 * - search: Search in title and content
 * - sort: Field to sort by (default: createdAt)
 * - order: Sort order asc/desc (default: desc)
 *
 * Returns: Paginated list of posts with meta information
 */

import { defineEventHandler, getQuery } from 'h3'
import { listQuerySchema } from '../../../schemas/common'
import { validateQuery } from '../../../utils/validate'
import { listPosts } from '../../../services/post.service'
import { createPaginationResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  // Parse and validate query parameters
  const query = getQuery(event)
  const validatedQuery = validateQuery(query, listQuerySchema)

  // Fetch posts with pagination and filters
  const result = await listPosts(validatedQuery)

  // Return paginated response
  return createPaginationResponse(result.items, {
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  })
})
