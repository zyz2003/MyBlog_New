/**
 * Categories API schemas
 * Validation schemas for category create/update operations
 */

import { z } from 'zod'

/**
 * Create category schema
 * - name: 1-100 characters, required
 * - slug: 1-200 characters, required (should be unique)
 * - description: optional, max 500 characters
 * - parentId: optional (UUID format, must reference existing category)
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  parentId: z.string().min(1, 'Parent ID must be a non-empty string').optional().nullable(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

/**
 * Update category schema
 * All fields optional (partial update)
 */
export const updateCategorySchema = createCategorySchema.partial()

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

/**
 * Category ID params schema for route params
 */
export const categoryIdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type CategoryIdParams = z.infer<typeof categoryIdSchema>
