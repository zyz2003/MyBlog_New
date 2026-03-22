/**
 * PUT /api/v1/plugins/:id/config
 *
 * Update plugin configuration
 * Requires authentication (admin role)
 *
 * Body:
 * - enabled: boolean (optional) - Enable/disable the plugin
 * - config: object (optional) - Plugin configuration values
 *
 * Returns: Updated plugin configuration
 */

import { defineEventHandler, getRouterParam } from 'h3'
import { requireAuth } from '../../../middleware/auth'
import { updatePluginConfig } from '../../../services/plugin.service'
import { createSuccessResponse } from '../../../utils/response'
import { HTTPError } from '../../../utils/error'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse request body - read from node.req.body for test compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (event as any).node?.req?.body || (event as any)._body || {}
  const { enabled, config } = body || {}

  // Get plugin ID from URL params
  // For [id]/config routes, the param is 'id' but we need to extract it differently
  // In Nitro, dynamic routes like [id].ts use getRouterParam
  const pluginId =
    getRouterParam(event, 'id') ||
    (() => {
      // Fallback: extract from URL path for test mock events
      const url = event.node.req.url || ''
      const match = url.match(/\/plugins\/([^/]+)\/config/)
      return match ? match[1] : null
    })()

  if (!pluginId) {
    throw HTTPError.BAD_REQUEST('Plugin ID is required')
  }

  // Build update object
  const updateData: { enabled?: boolean; config?: Record<string, unknown> } = {}
  if (enabled !== undefined) {
    updateData.enabled = enabled
  }
  if (config !== undefined) {
    updateData.config = config
  }

  // Update plugin configuration
  const plugin = await updatePluginConfig(pluginId, updateData)

  if (!plugin) {
    throw HTTPError.NOT_FOUND(`Plugin '${pluginId}' not found`)
  }

  // Return success response
  return createSuccessResponse(plugin, 'Plugin config updated successfully')
})
