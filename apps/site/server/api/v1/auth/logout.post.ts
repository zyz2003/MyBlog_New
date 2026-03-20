/**
 * POST /api/v1/auth/logout
 *
 * Logout user by blacklisting their JWT token
 * Requires authentication (valid JWT token in Authorization header)
 */

import { defineEventHandler } from 'h3'
import { requireAuth } from '../../middleware/auth'
import { logout } from '../../services/auth.service'
import { createSuccessResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Extract token from Authorization header
  const authHeader = event.node.req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : ''

  if (!token) {
    // This shouldn't happen since requireAuth would have thrown
    throw new Error('No token found')
  }

  // Blacklist the token
  await logout(token)

  // Return success response
  return createSuccessResponse(null, 'Logged out successfully')
})
