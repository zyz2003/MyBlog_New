import { pluginManager } from '../../core/plugin'
import { successResponse } from '../../utils/response'

/**
 * GET /api/plugins/enabled
 * Public endpoint - returns enabled plugins for rendering
 * Used by PluginRenderer component
 */
export default defineEventHandler(() => {
  const enabled = pluginManager.getEnabled()

  const data = enabled.map((plugin) => ({
    name: plugin.meta.name,
    mountPoints: plugin.mountPoints,
    config: pluginManager.getConfig(plugin.meta.name) ?? {},
    componentPath: plugin.component ? `~/plugins/${plugin.meta.name}.vue` : undefined,
  }))

  return successResponse(data)
})
