/**
 * GET /api/v1/media
 *
 * Get list of media files with pagination and filtering
 * Query parameters:
 * - limit: Number of items per page (default: 10, max: 100)
 * - offset: Number of items to skip (default: 0)
 * - mimeType: Filter by MIME type
 * - search: Search in filename and originalName
 * - sort: Field to sort by (default: uploadedAt)
 * - order: Sort order asc/desc (default: desc)
 *
 * Returns: Paginated list of media files with meta information
 */

import { defineEventHandler, getValidatedQuery } from 'h3'
import { z } from 'zod'
import { listMedia } from '../../../services/media.service'
import { createPaginationResponse } from '../../../utils/response'

const mediaListQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10))
    .pipe(z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100')),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 0))
    .pipe(z.number().min(0, 'Offset must be 0 or greater')),
  mimeType: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('uploadedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export default defineEventHandler(async (event) => {
  // Parse and validate query parameters (support mock data for testing)
  const queryToValidate =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event as any)._query !== undefined
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event as any)._query
      : await getValidatedQuery(event, mediaListQuerySchema)

  // Fetch media files with pagination and filters
  const result = await listMedia(queryToValidate)

  // Return paginated response
  return createPaginationResponse(result.data, {
    total: result.meta.total,
    limit: result.meta.limit,
    offset: result.meta.offset,
  })
})
