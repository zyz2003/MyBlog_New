/**
 * Plugin Service
 *
 * Provides plugin management functionality.
 * In-memory storage for plugin configurations.
 *
 * @module server/services/plugin
 */

/**
 * Plugin configuration type
 */
export interface PluginConfig {
  id: string
  name: string
  version: string
  description?: string
  enabled: boolean
  config: Record<string, unknown>
}

/**
 * In-memory plugin registry
 * In a real implementation, this would be backed by a database
 */
const pluginRegistry: Map<string, PluginConfig> = new Map([
  [
    'sitemap',
    {
      id: 'sitemap',
      name: 'Sitemap Generator',
      version: '1.0.0',
      description: 'Automatically generates XML sitemap for SEO',
      enabled: false,
      config: {
        updateFrequency: 'daily',
        includeImages: true,
      },
    },
  ],
  [
    'seo',
    {
      id: 'seo',
      name: 'SEO Tools',
      version: '1.2.0',
      description: 'Advanced SEO meta tags and analytics',
      enabled: false,
      config: {
        autoGenerateMeta: true,
        socialMediaPreview: true,
      },
    },
  ],
  [
    'analytics',
    {
      id: 'analytics',
      name: 'Analytics',
      version: '2.0.0',
      description: 'Track page views and user behavior',
      enabled: false,
      config: {
        trackPageViews: true,
        trackClicks: false,
        anonymizeIp: true,
      },
    },
  ],
])

/**
 * List all installed plugins
 *
 * @returns Array of plugin configurations
 */
export async function listPlugins(): Promise<PluginConfig[]> {
  // Return a copy to prevent external mutations
  return Array.from(pluginRegistry.values()).map((plugin) => ({
    ...plugin,
    config: { ...plugin.config },
  }))
}

/**
 * Get a plugin by ID
 *
 * @param id - Plugin ID
 * @returns Plugin configuration or null if not found
 */
export async function getPluginById(id: string): Promise<PluginConfig | null> {
  const plugin = pluginRegistry.get(id)
  if (!plugin) {
    return null
  }
  // Return a copy to prevent external mutations
  return { ...plugin, config: { ...plugin.config } }
}

/**
 * Update plugin configuration
 *
 * @param id - Plugin ID
 * @param config - New configuration values
 * @returns Updated plugin configuration or null if not found
 */
export async function updatePluginConfig(
  id: string,
  config: Partial<PluginConfig>
): Promise<PluginConfig | null> {
  const plugin = pluginRegistry.get(id)
  if (!plugin) {
    return null
  }

  // Merge the new config with existing config
  const updatedPlugin: PluginConfig = {
    ...plugin,
    ...config,
    config: {
      ...plugin.config,
      ...(config.config || {}),
    },
  }

  pluginRegistry.set(id, updatedPlugin)

  // Return a copy to prevent external mutations
  return { ...updatedPlugin, config: { ...updatedPlugin.config } }
}
