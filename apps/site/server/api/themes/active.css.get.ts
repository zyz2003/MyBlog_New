import { themeManager } from '../../core/theme'

/**
 * GET /api/themes/active.css
 * Public endpoint — returns CSS custom properties for the active theme
 * Used by frontend layout via <link rel="stylesheet">
 * Per D-08/D-09/D-10
 */
export default defineEventHandler((event) => {
  const css = themeManager.getActiveCSS()

  setResponseHeader(event, 'Content-Type', 'text/css; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  return css
})
