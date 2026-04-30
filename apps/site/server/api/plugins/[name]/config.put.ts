import { pluginManager } from '../../../core/plugin'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../../utils/response'

/**
 * PUT /api/plugins/:name/config
 * Protected endpoint - updates plugin configuration
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
  if (!body?.config) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Config object is required'),
    })
  }

  try {
    await pluginManager.updateConfig(name, body.config)
    return successResponse(null, `Plugin "${name}" config updated successfully`)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update plugin config'
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.INVALID_FORMAT.code, message),
    })
  }
})
