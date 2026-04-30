import { themeManager } from '../../core/theme'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

/**
 * GET /api/themes
 * Protected endpoint - returns all registered themes with metadata
 * Used by admin theme management UI
 */
export default defineEventHandler((event) => {
  // Check auth - admin only
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const themes = themeManager.getAll()

  const data = themes.map((theme) => ({
    meta: theme.meta,
    config: theme.config,
    isActive: themeManager.getActive()?.meta.name === theme.meta.name,
  }))

  return successResponse(data)
})
