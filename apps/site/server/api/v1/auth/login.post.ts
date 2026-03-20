/**
 * POST /api/v1/auth/login
 *
 * Authenticate user with username and password
 * Returns JWT token and user info on success
 */

import { defineEventHandler, readBody } from 'h3'
import { loginSchema } from '../../schemas/auth'
import { validateBodySync } from '../../utils/validate'
import { login } from '../../services/auth.service'
import { createSuccessResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  // Parse and validate request body
  const body = await readBody(event)
  const { username, password } = validateBodySync(body, loginSchema)

  // Authenticate user
  const { token, user } = await login(username, password)

  // Return success response
  return createSuccessResponse(
    {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
    'Login successful'
  )
})
