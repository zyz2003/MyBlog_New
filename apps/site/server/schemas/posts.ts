/**
 * Posts API schemas
 * Validation schemas for post create/update operations
 */

import { z } from 'zod'

/**
 * Create post schema
 * - title: 1-200 characters
 * - content: Markdown content, required
 * - excerpt: optional, auto-generated from content if not provided
 * - coverImage: optional URL
 * - seoTitle: optional, defaults to title if not provided
 * - seoDescription: optional, defaults to excerpt if not provided
 * - categoryId: optional (string ID)
 * - tagIds: array of tag IDs (optional)
 * - status: draft, reviewing, published, archived
 */
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  coverImage: z.string().url('Invalid URL format').optional(),
  seoTitle: z.string().max(100, 'SEO title must be less than 100 characters').optional(),
  seoDescription: z
    .string()
    .max(300, 'SEO description must be less than 300 characters')
    .optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional().nullable(),
  tagIds: z.array(z.string().min(1, 'Tag ID must be a non-empty string')).optional().default([]),
  status: z.enum(['draft', 'reviewing', 'published', 'archived']).optional().default('draft'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

/**
 * Update post schema
 * All fields optional (partial update)
 */
export const updatePostSchema = createPostSchema.partial()

export type UpdatePostInput = z.infer<typeof updatePostSchema>

/**
 * Bulk delete schema
 * - ids: array of post IDs to delete
 */
export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string().min(1, 'ID must be a non-empty string'))
    .min(1, 'At least one ID is required'),
})

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>
