import { themeManager } from '../../../core/theme'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../../utils/response'

/**
 * POST /api/themes/:name/activate
 * Protected endpoint - activates a theme
 */
export default defineEventHandler(async (event) => {
  // Check auth - admin only
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Theme name is required'),
    })
  }

  try {
    await themeManager.activate(name)
    return successResponse({ activated: name }, `Theme "${name}" activated`)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to activate theme'
    throw createError({
      statusCode: 404,
      data: errorResponse(3001, message),
    })
  }
})
