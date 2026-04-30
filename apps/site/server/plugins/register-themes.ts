import { themeManager } from '../core/theme'

/**
 * Server plugin: registers and loads themes on startup
 * Scans themes/ directory and loads active theme from database
 */
export default defineNitroPlugin(async () => {
  // Scan themes directory
  themeManager.scanThemes()

  // Load active theme from database
  await themeManager.loadFromDb()

  console.log(`[ThemeSystem] Loaded ${themeManager.getAll().length} theme(s), active: ${themeManager.getActive()?.meta.name ?? 'none'}`)
})
