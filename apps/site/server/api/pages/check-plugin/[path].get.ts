import { pluginManager } from '../../../core/plugin/manager'

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
    for (const name of Array.from(pluginManager.getEnabled())) {
      const plugin = pluginManager.getPlugin(name)
      if (plugin && 'pages' in plugin && plugin.pages && registeredPath in plugin.pages) {
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