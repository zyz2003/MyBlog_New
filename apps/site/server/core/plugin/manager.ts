import { eq } from 'drizzle-orm'
import { pluginSettings } from '../../db/schema/settings'
import { db } from '../../utils/db'
import type {
  PluginAdapter,
  PluginAdapterExtended,
  PluginType,
  MountPoint,
  ConfigSchema,
} from './types'

/**
 * Type guard to check if a plugin implements the extended interface
 */
function isExtended(plugin: PluginAdapter): plugin is PluginAdapterExtended {
  return (
    'onInit' in plugin ||
    'onUnmount' in plugin ||
    'onConfigChange' in plugin ||
    'serverRoutes' in plugin ||
    'dependencies' in plugin ||
    'conflicts' in plugin
  )
}

/**
 * PluginManager — singleton that handles plugin lifecycle
 *
 * Responsibilities:
 * - Register/unregister plugins
 * - Enable/disable with config validation
 * - Filter plugins by mount point or type
 * - Persist plugin settings to database
 */
export class PluginManager {
  private plugins = new Map<string, PluginAdapter>()
  private enabledPlugins = new Set<string>()
  private configs = new Map<string, Record<string, unknown>>()

  /**
   * Register a plugin in the manager
   * Warns if a plugin with the same name already exists
   */
  register(plugin: PluginAdapter): void {
    const { name } = plugin.meta
    if (this.plugins.has(name)) {
      console.warn(`[PluginManager] Plugin "${name}" is already registered. Overwriting.`)
    }
    this.plugins.set(name, plugin)
  }

  /**
   * Enable a plugin with configuration
   * Validates config, checks dependencies/conflicts, calls onInit for extended plugins
   * Persists to database
   */
  async enable(pluginName: string, config: Record<string, unknown> = {}): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found. Did you forget to register it?`)
    }

    // Validate config against schema
    this.validateConfig(plugin.configSchema, config)

    // Check dependencies and conflicts for extended plugins
    if (isExtended(plugin)) {
      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.enabledPlugins.has(dep)) {
            throw new Error(`Plugin "${pluginName}" requires "${dep}" to be enabled first.`)
          }
        }
      }

      // Check conflicts
      if (plugin.conflicts) {
        for (const conflict of plugin.conflicts) {
          if (this.enabledPlugins.has(conflict)) {
            throw new Error(`Plugin "${pluginName}" conflicts with enabled plugin "${conflict}".`)
          }
        }
      }

      // Call onInit lifecycle hook
      if (plugin.onInit) {
        await plugin.onInit(config)
      }
    }

    // Store in memory
    this.enabledPlugins.add(pluginName)
    this.configs.set(pluginName, config)

    // Persist to database
    await this.persistToDb(pluginName, config, plugin.meta.version)
  }

  /**
   * Disable a plugin
   * Calls onUnmount for extended plugins, removes from enabled set
   * Updates database
   */
  async disable(pluginName: string): Promise<void> {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin "${pluginName}" not found.`)
    }

    if (!this.enabledPlugins.has(pluginName)) {
      return // Already disabled, no-op
    }

    const plugin = this.plugins.get(pluginName)!

    // Call onUnmount for extended plugins
    if (isExtended(plugin) && plugin.onUnmount) {
      await plugin.onUnmount()
    }

    // Remove from memory
    this.enabledPlugins.delete(pluginName)
    this.configs.delete(pluginName)

    // Update database
    await db
      .update(pluginSettings)
      .set({ enabled: false, updatedAt: new Date() })
      .where(eq(pluginSettings.pluginName, pluginName))
  }

  /**
   * Get all enabled plugins, optionally filtered by type
   */
  getEnabled(type?: PluginType): PluginAdapter[] {
    const result: PluginAdapter[] = []
    for (const name of Array.from(this.enabledPlugins)) {
      const plugin = this.plugins.get(name)
      if (plugin && (!type || plugin.meta.type === type)) {
        result.push(plugin)
      }
    }
    return result
  }

  /**
   * Get enabled plugins that declare a specific mount point
   */
  getPluginsForMountPoint(mountPoint: MountPoint): PluginAdapter[] {
    return this.getEnabled().filter((plugin) =>
      plugin.mountPoints.includes(mountPoint),
    )
  }

  /**
   * Get stored config for a plugin
   */
  getConfig(pluginName: string): Record<string, unknown> | undefined {
    return this.configs.get(pluginName)
  }

  /**
   * Update plugin configuration
   * Validates new config, calls onConfigChange for extended plugins
   * Persists to database
   */
  async updateConfig(pluginName: string, newConfig: Record<string, unknown>): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`)
    }

    if (!this.enabledPlugins.has(pluginName)) {
      throw new Error(`Plugin "${pluginName}" is not enabled. Enable it first.`)
    }

    // Validate new config
    this.validateConfig(plugin.configSchema, newConfig)

    const oldConfig = this.configs.get(pluginName) ?? {}

    // Call onConfigChange for extended plugins
    if (isExtended(plugin) && plugin.onConfigChange) {
      await plugin.onConfigChange(newConfig, oldConfig)
    }

    // Update in memory
    this.configs.set(pluginName, newConfig)

    // Persist to database
    await this.persistToDb(pluginName, newConfig, plugin.meta.version)
  }

  /**
   * Get a registered plugin by name
   */
  getPlugin(pluginName: string): PluginAdapter | undefined {
    return this.plugins.get(pluginName)
  }

  /**
   * Get all registered plugins (not just enabled)
   */
  getAll(): PluginAdapter[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginName: string): boolean {
    return this.enabledPlugins.has(pluginName)
  }

  /**
   * Load enabled plugins from database on startup
   * Call this during server initialization
   */
  async loadFromDb(): Promise<void> {
    try {
      const rows = await db
        .select()
        .from(pluginSettings)
        .where(eq(pluginSettings.enabled, true))

      for (const row of rows) {
        const plugin = this.plugins.get(row.pluginName)
        if (plugin) {
          this.enabledPlugins.add(row.pluginName)
          if (row.config) {
            this.configs.set(row.pluginName, row.config as Record<string, unknown>)
          }
        }
      }
    }
    catch (error) {
      // Database might not be initialized yet during first run
      console.warn('[PluginManager] Could not load plugin settings from database:', error)
    }
  }

  /**
   * Validate config against schema
   * Checks required fields and runs validators
   */
  private validateConfig(schema: ConfigSchema, config: Record<string, unknown>): void {
    for (const [key, field] of Object.entries(schema)) {
      const value = config[key]

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Missing required config field: "${field.label}" (${key})`)
      }

      // Run validator if present and value is provided
      if (field.validator && value !== undefined && value !== null) {
        const result = field.validator(value)
        if (result !== true) {
          const message = typeof result === 'string' ? result : `Invalid value for "${field.label}" (${key})`
          throw new Error(message)
        }
      }
    }
  }

  /**
   * Persist plugin settings to database (upsert)
   */
  private async persistToDb(
    pluginName: string,
    config: Record<string, unknown>,
    version: string,
  ): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(pluginSettings)
        .where(eq(pluginSettings.pluginName, pluginName))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(pluginSettings)
          .set({
            config,
            enabled: true,
            version,
            updatedAt: new Date(),
          })
          .where(eq(pluginSettings.pluginName, pluginName))
      }
      else {
        await db.insert(pluginSettings).values({
          pluginName,
          config,
          enabled: true,
          version,
        })
      }
    }
    catch (error) {
      console.error(`[PluginManager] Failed to persist settings for "${pluginName}":`, error)
      throw error
    }
  }
}

/** Singleton instance */
export const pluginManager = new PluginManager()
