import { z } from 'zod'

/**
 * Pagination schema
 * - limit: 1-100, default 10
 * - offset: 0 or greater, default 0
 */
export const paginationSchema = z.object({
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
})

export type PaginationInput = z.infer<typeof paginationSchema>

/**
 * Sort order enum
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')

export type SortOrder = z.infer<typeof sortOrderSchema>

/**
 * List query schema - extends pagination with filtering and sorting
 * - category: optional category slug
 * - tag: optional tag slug
 * - status: optional status filter (draft, published, archived)
 * - search: optional search keyword
 * - sort: field to sort by (createdAt, publishedAt, viewCount, etc.)
 * - order: sort order (asc, desc)
 */
export const listQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('createdAt'),
  order: sortOrderSchema,
})

export type ListQueryInput = z.infer<typeof listQuerySchema>

/**
 * ID schema for route params
 */
export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

export type IdParams = z.infer<typeof idSchema>

/**
 * Slug schema for route params
 */
export const slugSchema = z.object({
  slug: z.string().max(200, 'Slug must be less than 200 characters'),
})

export type SlugParams = z.infer<typeof slugSchema>
