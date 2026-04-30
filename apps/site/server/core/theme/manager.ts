import fs from 'node:fs'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { themeSettings } from '../../db/schema/settings'
import { db } from '../../utils/db'
import { hookEmitter } from '../hooks/event-emitter'
import type { ThemeConfig, ThemeManifest, ThemeMeta } from './types'
import { CSSVariablesMap } from './types'

/** Raw shape of config.json (includes both meta and config fields) */
interface RawThemeJson {
  name?: string
  version?: string
  author?: string
  description?: string
  screenshot?: string
  colors: ThemeConfig['colors']
  fonts: ThemeConfig['fonts']
  spacing: ThemeConfig['spacing']
  borderRadius: ThemeConfig['borderRadius']
  layout: ThemeConfig['layout']
}

/**
 * ThemeManager — singleton that handles theme lifecycle
 *
 * Responsibilities:
 * - Scan themes/ directory for available themes
 * - Load and validate theme configs
 * - Activate themes and persist to database
 * - Generate CSS Variables text from theme config
 * - Dispatch hook events on theme lifecycle
 */
export class ThemeManager {
  private themes = new Map<string, ThemeManifest>()
  private activeTheme: string | null = null
  private themesDir: string

  constructor() {
    this.themesDir = path.join(process.cwd(), 'themes')
  }

  /**
   * Scan themes directory and discover available themes
   * Reads config.json from each subdirectory
   */
  scanThemes(): void {
    try {
      if (!fs.existsSync(this.themesDir)) {
        console.warn(`[ThemeManager] Themes directory not found: ${this.themesDir}`)
        return
      }

      const entries = fs.readdirSync(this.themesDir, { withFileTypes: true })
      let count = 0

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        // Validate theme name is alphanumeric (security: prevent path traversal)
        if (!/^[a-zA-Z0-9_-]+$/.test(entry.name)) {
          console.warn(`[ThemeManager] Skipping invalid theme directory name: ${entry.name}`)
          continue
        }

        const configPath = path.join(this.themesDir, entry.name, 'config.json')
        if (!fs.existsSync(configPath)) continue

        try {
          const fileContent = fs.readFileSync(configPath, 'utf-8')
          const parsed = JSON.parse(fileContent)

          if (this.validateConfig(parsed)) {
            const raw = parsed as RawThemeJson
            const manifest: ThemeManifest = {
              meta: this.extractMeta(raw, entry.name),
              config: this.extractConfig(raw),
            }
            this.themes.set(entry.name, manifest)
            count++
          }
          else {
            console.warn(`[ThemeManager] Invalid config for theme "${entry.name}"`)
          }
        }
        catch (error) {
          console.warn(`[ThemeManager] Failed to load theme "${entry.name}":`, error)
        }
      }

      console.log(`[ThemeManager] Discovered ${count} theme(s)`)
    }
    catch (error) {
      console.error('[ThemeManager] Failed to scan themes directory:', error)
    }
  }

  /**
   * Load a specific theme by name
   * Returns manifest or null if not found
   */
  loadTheme(themeName: string): ThemeManifest | null {
    // Check cache first
    if (this.themes.has(themeName)) {
      return this.themes.get(themeName)!
    }

    // Try to load from disk
    const configPath = path.join(this.themesDir, themeName, 'config.json')
    if (!fs.existsSync(configPath)) {
      return null
    }

    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8')
      const parsed = JSON.parse(fileContent)

      if (!this.validateConfig(parsed)) {
        return null
      }

      const raw = parsed as RawThemeJson
      const manifest: ThemeManifest = {
        meta: this.extractMeta(raw, themeName),
        config: this.extractConfig(raw),
      }

      this.themes.set(themeName, manifest)

      // Dispatch loaded hook
      hookEmitter.dispatch('theme:loaded', {
        themeName,
        config: manifest.config,
        timestamp: Date.now(),
      })

      return manifest
    }
    catch (error) {
      console.warn(`[ThemeManager] Failed to load theme "${themeName}":`, error)
      return null
    }
  }

  /**
   * Activate a theme
   * Persists to database and dispatches hook events
   */
  async activate(themeName: string): Promise<void> {
    const manifest = this.loadTheme(themeName)
    if (!manifest) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    const previousTheme = this.activeTheme

    // Deactivate current active theme in DB
    if (previousTheme) {
      try {
        await db
          .update(themeSettings)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(themeSettings.isActive, true))
      }
      catch (error) {
        console.warn('[ThemeManager] Failed to deactivate previous theme:', error)
      }
    }

    // Persist new active theme to DB
    await this.persistToDb(themeName, manifest.config)

    // Update in-memory state
    this.activeTheme = themeName

    // Dispatch activated hook
    hookEmitter.dispatch('theme:activated', {
      themeName,
      config: manifest.config,
      timestamp: Date.now(),
    })

    // Dispatch changed hook if theme actually changed
    if (previousTheme && previousTheme !== themeName) {
      hookEmitter.dispatch('theme:changed', {
        themeName,
        config: manifest.config,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Get the currently active theme manifest
   */
  getActive(): ThemeManifest | null {
    if (!this.activeTheme) return null
    return this.themes.get(this.activeTheme) ?? null
  }

  /**
   * Generate CSS Variables text for the active theme
   */
  getActiveCSS(): string {
    const active = this.getActive()
    if (!active) return ''
    return this.generateCSS(active.config)
  }

  /**
   * Generate CSS Variables text for a specific theme
   */
  getThemeCSS(themeName: string): string {
    const manifest = this.themes.get(themeName)
    if (!manifest) return ''
    return this.generateCSS(manifest.config)
  }

  /**
   * Get all registered themes
   */
  getAll(): ThemeManifest[] {
    return Array.from(this.themes.values())
  }

  /**
   * Get config for a specific theme
   */
  getConfig(themeName: string): ThemeConfig | undefined {
    return this.themes.get(themeName)?.config
  }

  /**
   * Load active theme from database on startup
   * Falls back to 'default' theme if no active theme in DB
   */
  async loadFromDb(): Promise<void> {
    try {
      const rows = await db
        .select()
        .from(themeSettings)
        .where(eq(themeSettings.isActive, true))
        .limit(1)

      if (rows.length > 0) {
        const row = rows[0]
        this.activeTheme = row.themeName

        // Ensure theme is loaded
        if (!this.themes.has(row.themeName)) {
          this.loadTheme(row.themeName)
        }

        console.log(`[ThemeManager] Active theme: ${row.themeName}`)
      }
      else {
        // No active theme in DB, activate default
        console.log('[ThemeManager] No active theme in DB, activating default')
        await this.activate('default')
      }
    }
    catch (error) {
      // Database might not be initialized yet during first run
      console.warn('[ThemeManager] Could not load theme from database:', error)
      // Try to activate default anyway
      if (this.themes.has('default')) {
        this.activeTheme = 'default'
      }
    }
  }

  /**
   * Validate theme config has required fields
   */
  private validateConfig(config: unknown): boolean {
    if (!config || typeof config !== 'object') return false

    const c = config as Record<string, unknown>

    // Check top-level keys
    const requiredKeys = ['colors', 'fonts', 'spacing', 'borderRadius', 'layout']
    for (const key of requiredKeys) {
      if (!c[key] || typeof c[key] !== 'object') return false
    }

    // Check required color keys
    const colors = c.colors as Record<string, unknown>
    const requiredColors = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textMuted']
    for (const key of requiredColors) {
      if (typeof colors[key] !== 'string') return false
    }

    return true
  }

  /**
   * Extract theme metadata from raw JSON
   */
  private extractMeta(raw: RawThemeJson, fallbackName: string): ThemeMeta {
    return {
      name: raw.name ?? fallbackName,
      version: raw.version ?? '1.0.0',
      author: raw.author,
      description: raw.description,
      screenshot: raw.screenshot,
    }
  }

  /**
   * Extract theme config from raw JSON
   */
  private extractConfig(raw: RawThemeJson): ThemeConfig {
    return {
      colors: raw.colors,
      fonts: raw.fonts,
      spacing: raw.spacing,
      borderRadius: raw.borderRadius,
      layout: raw.layout,
    }
  }

  /**
   * Generate CSS Variables text from ThemeConfig
   */
  private generateCSS(config: ThemeConfig): string {
    const vars = CSSVariablesMap(config)
    const lines = Object.entries(vars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')
    return `:root {\n${lines}\n}`
  }

  /**
   * Persist theme settings to database (upsert)
   */
  private async persistToDb(themeName: string, config: ThemeConfig): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(themeSettings)
        .where(eq(themeSettings.themeName, themeName))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(themeSettings)
          .set({
            config,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(themeSettings.themeName, themeName))
      }
      else {
        await db.insert(themeSettings).values({
          themeName,
          config,
          isActive: true,
        })
      }
    }
    catch (error) {
      console.error(`[ThemeManager] Failed to persist settings for "${themeName}":`, error)
      throw error
    }
  }
}

/** Singleton instance */
export const themeManager = new ThemeManager()
