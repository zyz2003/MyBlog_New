import { pluginManager } from '../../core/plugin/manager'

/**
 * GET /api/plugins/page-routes
 * Get all page paths registered by enabled plugins
 */
export default defineEventHandler(async () => {
  const pluginPages = pluginManager.getPluginPages()
  const paths = Object.keys(pluginPages)

  return {
    code: 0,
    data: {
      pages: paths,
    },
  }
})