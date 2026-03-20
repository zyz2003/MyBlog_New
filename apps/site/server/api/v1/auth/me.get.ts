/**
 * GET /api/v1/auth/me
 *
 * Get current logged-in user information
 * Requires authentication (valid JWT token in Authorization header)
 * Returns user profile data on success
 */

import { defineEventHandler } from 'h3'
import { requireAuth } from '../../../middleware/auth'
import { createSuccessResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  // Require authentication - throws 401 if no valid token
  const user = await requireAuth(event)

  // Return success response with user data
  return createSuccessResponse({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  })
})
