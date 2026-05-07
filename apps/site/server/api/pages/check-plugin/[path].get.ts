import { pluginManager } from '../../../core/plugin/manager'
import type { PluginAdapterExtended } from '../../../core/plugin/types'

/**
 * GET /api/pages/check-plugin?path=/xxx
 * Check if a path is registered by an enabled plugin
 * Used to prioritize plugin routes over database pages
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = String(query.path || '')

  if (!path) {
    return {
      code: 0,
      data: { registered: false, pluginName: null },
    }
  }

  // Get plugin pages from manager
  const pluginPages = pluginManager.getPluginPages()

  // Check if this path is registered by a plugin
  const registeredPath = Object.keys(pluginPages).find((p) => {
    return path === p || path.startsWith(p + '/')
  })

  if (registeredPath) {
    // Find which plugin owns this route
    let pluginName = 'unknown'
    const enabledPlugins = pluginManager.getEnabled()

    for (const plugin of enabledPlugins) {
      if (plugin && 'pages' in plugin && typeof plugin.pages === 'object' && plugin.pages !== null && registeredPath in plugin.pages) {
        pluginName = plugin.meta.name
        break
      }
    }

    return {
      code: 0,
      data: {
        registered: true,
        pluginName,
        path: registeredPath,
      },
    }
  }

  return {
    code: 0,
    data: {
      registered: false,
      pluginName: null,
    },
  }
})