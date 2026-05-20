import type { ThemeConfig } from '../../../core/theme/types'
import { themeManager } from '../../../core/theme'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../../utils/response'

/**
 * POST /api/themes/:name/config
 * Protected endpoint - saves config through ThemeManager to keep theme state in sync
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Theme name is required'),
    })
  }

  const existingTheme = themeManager.loadTheme(name)
  if (!existingTheme) {
    throw createError({
      statusCode: 404,
      data: errorResponse(3001, `Theme "${name}" not found`),
    })
  }

  const config = await readBody<ThemeConfig>(event)
  if (!config) {
    throw createError({
      statusCode: 400,
      data: errorResponse(3002, 'Theme config is required'),
    })
  }

  await themeManager.saveConfig(name, config)

  return successResponse({
    theme: name,
    config,
  }, `Theme "${name}" config saved`)
})
