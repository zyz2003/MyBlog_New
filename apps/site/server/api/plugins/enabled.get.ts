import { pluginManager } from '../../core/plugin'
import { successResponse } from '../../utils/response'

/**
 * GET /api/plugins/enabled
 * Public endpoint - returns enabled plugins for rendering
 */
export default defineEventHandler(() => {
  const enabled = pluginManager.getEnabled()

  const data = enabled.map((plugin) => {
    const base = {
      name: plugin.meta.name,
      mountPoints: plugin.mountPoints,
      config: pluginManager.getConfig(plugin.meta.name) ?? {},
    }

    // For plugins with clientScript, return the script content directly
    if ('clientScript' in plugin && plugin.clientScript) {
      return {
        ...base,
        scriptContent: plugin.clientScript,
      }
    }

    // For plugins with onMount, also return as script content (for backward compat)
    if ('onMount' in plugin) {
      return {
        ...base,
        hasOnMount: true,
      }
    }

    // Default: return script URL for external scripts
    return {
      ...base,
      scriptUrl: `/plugins/${plugin.meta.name}.js`,
    }
  })

  return successResponse(data)
})
