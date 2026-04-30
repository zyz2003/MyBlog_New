import { pluginManager } from '../../../core/plugin'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../../utils/response'

/**
 * POST /api/plugins/:name/disable
 * Protected endpoint - disables a plugin
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
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Plugin name is required'),
    })
  }

  try {
    await pluginManager.disable(name)
    return successResponse(null, `Plugin "${name}" disabled successfully`)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to disable plugin'
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.INVALID_FORMAT.code, message),
    })
  }
})
