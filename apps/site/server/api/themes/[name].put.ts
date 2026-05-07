import { readBody } from 'h3'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve } from 'path'

interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, string | number>
  borderRadius: Record<string, string | number>
  layout: Record<string, string | string[] | boolean>
}

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, message: 'Theme name is required' })
  }

  // Validate theme name to prevent path traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw createError({ statusCode: 400, message: 'Invalid theme name' })
  }

  const config = await readBody<ThemeConfig>(event)
  if (!config) {
    throw createError({ statusCode: 400, message: 'Config is required' })
  }

  // Get themes directory
  const themesDir = resolve(process.cwd(), 'apps/site/themes')
  const themeDir = resolve(themesDir, name)

  if (!existsSync(themeDir)) {
    throw createError({ statusCode: 404, message: `Theme "${name}" not found` })
  }

  // Read existing config.json
  const configPath = resolve(themeDir, 'config.json')
  let existingConfig: Record<string, unknown> = {}

  if (existsSync(configPath)) {
    try {
      const content = await readFile(configPath, 'utf-8')
      existingConfig = JSON.parse(content)
    }
    catch {
      // Ignore parse errors
    }
  }

  // Update config while preserving meta
  const newConfig = {
    ...existingConfig,
    colors: config.colors,
    fonts: config.fonts,
    spacing: config.spacing,
    borderRadius: config.borderRadius,
    layout: config.layout,
  }

  // Write config
  await writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8')

  return {
    code: 0,
    message: 'Theme config updated successfully',
    data: newConfig,
  }
})
