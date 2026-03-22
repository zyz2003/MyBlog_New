/**
 * GET /api/v1/plugins
 *
 * Get list of installed plugins with their configurations
 * Returns all plugins that are available in the system
 *
 * Returns: List of plugin configurations
 */

import { defineEventHandler } from 'h3'
import { listPlugins } from '../../../services/plugin.service'
import { createSuccessResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  // Fetch list of plugins
  const plugins = await listPlugins()

  // Return success response with plugins list
  return createSuccessResponse(plugins)
})
