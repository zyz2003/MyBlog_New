import { refreshTokenIfNeeded, getUserFromToken } from '../../services/auth'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

export default defineEventHandler(async (event) => {
  // Extract token from Authorization header
  const authHeader = getRequestHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const token = authHeader.slice(7)

  // Verify token is valid first
  const user = await getUserFromToken(token)
  if (!user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.TOKEN_EXPIRED.code, AuthErrors.TOKEN_EXPIRED.message),
    })
  }

  // Try to refresh (AUTH-03: returns new token if < 1 day remaining)
  const newToken = await refreshTokenIfNeeded(token)

  return successResponse({ token: newToken })
})
