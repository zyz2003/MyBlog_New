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

  // Public routes — no auth required
  const publicPaths = ['/api/auth/', '/api/plugins/enabled']
  if (publicPaths.some((p) => path.startsWith(p))) {
    return
  }

  // Protected paths that require auth
  const protectedPaths = ['/api/admin/', '/api/plugins/', '/api/media/']
  const needsAuth = protectedPaths.some((p) => path.startsWith(p))

  // Extract Bearer token if present
  const authHeader = getRequestHeader(event, 'Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    // Verify token and inject user context
    const user = await getUserFromToken(token)
    if (user) {
      event.context.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
      }
    } else if (needsAuth) {
      const payload = await getTokenPayload(token)
      const errorCode = payload ? AuthErrors.UNAUTHENTICATED : AuthErrors.TOKEN_EXPIRED
      throw createError({
        statusCode: 401,
        data: errorResponse(errorCode.code, errorCode.message),
      })
    }
  } else if (needsAuth) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }
})
