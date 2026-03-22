/**
 * Tags API schemas
 * Validation schemas for tag create/update operations
 */

import { z } from 'zod'

/**
 * Create tag schema
 * - name: 1-100 characters, required
 * - slug: 1-200 characters, required (should be unique)
 * - description: optional, max 500 characters
 * - color: optional, color value for display
 */
export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  color: z.string().optional().nullable(),
})

export type CreateTagInput = z.infer<typeof createTagSchema>

/**
 * Update tag schema
 * All fields optional (partial update)
 */
export const updateTagSchema = createTagSchema.partial()

export type UpdateTagInput = z.infer<typeof updateTagSchema>

/**
 * Tag ID params schema for route params
 */
export const tagIdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type TagIdParams = z.infer<typeof tagIdSchema>
