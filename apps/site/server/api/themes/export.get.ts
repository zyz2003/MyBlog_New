import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const name = query.name as string

  if (!name) {
    throw createError({ statusCode: 400, message: 'Theme name is required' })
  }

  // Validate theme name to prevent path traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw createError({ statusCode: 400, message: 'Invalid theme name' })
  }

  // Get themes directory
  const themesDir = resolve(process.cwd(), 'apps/site/themes')
  const themeDir = resolve(themesDir, name)

  if (!existsSync(themeDir)) {
    throw createError({ statusCode: 404, message: `Theme "${name}" not found` })
  }

  // Read config.json
  const configPath = resolve(themeDir, 'config.json')
  if (!existsSync(configPath)) {
    throw createError({ statusCode: 404, message: 'Theme config not found' })
  }

  try {
    const content = await readFile(configPath, 'utf-8')
    const config = JSON.parse(content)

    return {
      code: 0,
      message: 'Theme exported successfully',
      data: {
        name,
        version: config.meta?.version || '1.0.0',
        config: {
          colors: config.colors || {},
          fonts: config.fonts || {},
          spacing: config.spacing || {},
          borderRadius: config.borderRadius || {},
          layout: config.layout || {},
        },
      },
    }
  }
  catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to read theme config' })
  }
})
