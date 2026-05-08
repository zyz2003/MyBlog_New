import { readBody } from 'h3'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve } from 'path'

interface ThemeConfig {
  name: string
  version?: string
  config: {
    colors: Record<string, string>
    fonts: Record<string, string>
    spacing: Record<string, string>
    borderRadius: Record<string, string>
    layout: Record<string, string>
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ThemeConfig>(event)
  if (!body || !body.name || !body.config) {
    throw createError({ statusCode: 400, message: 'Invalid theme config data' })
  }

  const themesDir = resolve(process.cwd(), 'apps/site/themes')
  const themeDir = resolve(themesDir, body.name)

  // Create theme directory if it doesn't exist
  if (!existsSync(themeDir)) {
    await mkdir(themeDir, { recursive: true })
  }

  // Read existing config.json to preserve meta
  const configPath = resolve(themeDir, 'config.json')
  let existingMeta: Record<string, unknown> = {
    meta: {
      name: body.name,
      label: body.name,
      version: body.version || '1.0.0',
    },
  }

  if (existsSync(configPath)) {
    try {
      const content = await readFile(configPath, 'utf-8')
      const existing = JSON.parse(content)
      existingMeta = {
        meta: existing.meta || existingMeta.meta,
      }
    }
    catch {
      // Ignore parse errors
    }
  }

  // Merge config
  const newConfig = {
    ...existingMeta,
    ...body.config,
  }

  // Write config
  await writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8')

  return {
    code: 0,
    message: 'Theme config imported successfully',
    data: newConfig,
  }
})
