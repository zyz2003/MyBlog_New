import { pluginManager } from '../../core/plugin'
import { successResponse } from '../../utils/response'

/**
 * GET /api/plugins/enabled
 * Public endpoint - returns enabled plugins for rendering
 */
export default defineEventHandler(() => {
  const enabled = pluginManager.getEnabled()

  const data = enabled.map((plugin) => ({
    name: plugin.meta.name,
    mountPoints: plugin.mountPoints,
    config: pluginManager.getConfig(plugin.meta.name) ?? {},
    scriptUrl: `/plugins/${plugin.meta.name}.js`,
  }))

  return successResponse(data)
})
