import { readBody } from 'h3'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve } from 'path'

interface ThemeConfig {
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  layout: Record<string, string>
}

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, message: 'Theme name is required' })
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

  // Update config
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
    message: 'Theme config saved successfully',
    data: newConfig,
  }
})
