/**
 * POST /api/v1/categories
 *
 * Create a new category
 *
 * Request body:
 * - name: string (required, 1-100 chars)
 * - slug: string (required, 1-200 chars)
 * - description?: string (optional, max 500 chars)
 * - parentId?: string (optional, UUID - must reference existing category)
 *
 * Returns: Created category
 * Requires: Authentication
 */

import { defineEventHandler } from 'h3'
import { createCategory } from '../../../services/category.service'
import { createSuccessResponse } from '../../../utils/response'
import { requireAuth } from '../../../middleware/auth'
import { validateRequestBody } from '../../../utils/validate'
import { createCategorySchema } from '../../../schemas/categories'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse and validate request body
  const body = await validateRequestBody(event, createCategorySchema)

  // Create the category
  const createdCategory = await createCategory(body)

  // Return 201 Created with category data
  return createSuccessResponse(createdCategory, 'Category created successfully')
})
