import { pluginManager } from '../../core/plugin'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

/**
 * GET /api/plugins
 * Protected endpoint - returns all registered plugins with status
 * Used by admin plugin management UI
 */
export default defineEventHandler((event) => {
  // Check auth - admin only
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const allPlugins = pluginManager.getAll()

  const data = allPlugins.map((plugin) => ({
    meta: plugin.meta,
    mountPoints: plugin.mountPoints,
    enabled: pluginManager.isEnabled(plugin.meta.name),
    config: pluginManager.getConfig(plugin.meta.name) ?? {},
  }))

  return successResponse(data)
})
