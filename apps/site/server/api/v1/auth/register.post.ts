/**
 * POST /api/v1/auth/register
 *
 * Register a new user account
 * Creates user with username, password, and email
 * Returns created user info on success
 */

import { defineEventHandler, readBody } from 'h3'
import { registerSchema } from '../../../schemas/auth'
import { validateBodySync } from '../../../utils/validate'
import { register } from '../../../services/auth.service'
import { createSuccessResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  // Parse and validate request body
  const body = await readBody(event)
  const { username, password, email } = validateBodySync(body, registerSchema)

  // Register user
  const user = await register(username, password, email)

  // Return success response
  return createSuccessResponse(
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
    'User registered successfully'
  )
})
