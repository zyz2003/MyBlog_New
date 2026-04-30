import { themeManager } from '../../core/theme'
import { successResponse } from '../../utils/response'

/**
 * GET /api/themes/active
 * Public endpoint - returns active theme with CSS Variables
 * Used by front-end for rendering
 */
export default defineEventHandler(() => {
  const active = themeManager.getActive()

  if (!active) {
    return successResponse({
      theme: null,
      css: '',
    })
  }

  return successResponse({
    theme: active,
    css: themeManager.getActiveCSS(),
  })
})
