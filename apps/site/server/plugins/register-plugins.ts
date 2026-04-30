import { pluginManager } from '../core/plugin'
import testPlugin from '../core/plugin/test-plugin'

/**
 * Server plugin: registers all plugins on startup
 * Add your plugin imports here
 */
export default defineNitroPlugin(async () => {
  // Register plugins
  pluginManager.register(testPlugin)

  // Load enabled state from database
  await pluginManager.loadFromDb()

  console.log(`[PluginSystem] Registered ${pluginManager.getAll().length} plugin(s)`)
})
