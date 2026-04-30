import { getUserFromToken, getTokenPayload } from '../services/auth'
import { errorResponse, AuthErrors } from '../utils/response'

/**
 * Auth middleware — protects /api/admin/** routes (AUTH-05)
 *
 * Runs on ALL server requests. Only enforces auth on /api/admin/** paths.
 * For authenticated requests, injects user into event.context.user.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Only protect /api/admin/** routes
  if (!path.startsWith('/api/admin/')) {
    return // Pass through — no auth required
  }

  // Extract Bearer token
  const authHeader = getRequestHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const token = authHeader.slice(7)

  // Verify token and get user (AUTH-05)
  const user = await getUserFromToken(token)
  if (!user) {
    // Check if token is expired vs invalid for better error messages
    const payload = await getTokenPayload(token)
    const errorCode = payload ? AuthErrors.UNAUTHENTICATED : AuthErrors.TOKEN_EXPIRED

    throw createError({
      statusCode: 401,
      data: errorResponse(errorCode.code, errorCode.message),
    })
  }

  // Inject user into event context — available in route handlers as event.context.user
  event.context.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    role: user.role,
  }
})
