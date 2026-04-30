import { pluginManager } from '../../../core/plugin'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../../utils/response'

/**
 * POST /api/plugins/:name/enable
 * Protected endpoint - enables a plugin with configuration
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

  const body = await readBody<{ config?: Record<string, unknown> }>(event)
  const config = body?.config ?? {}

  try {
    await pluginManager.enable(name, config)
    return successResponse(null, `Plugin "${name}" enabled successfully`)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enable plugin'
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.INVALID_FORMAT.code, message),
    })
  }
})
