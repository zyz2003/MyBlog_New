/**
 * GET /api/v1/themes
 *
 * Get current theme configuration
 * Returns the active theme and its configuration
 *
 * Returns: Theme configuration with active theme and settings
 */

import { defineEventHandler } from 'h3'
import { getThemeConfig } from '../../../services/theme.service'
import { createSuccessResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  // Fetch current theme configuration
  const themeConfig = await getThemeConfig()

  // Return success response
  return createSuccessResponse(themeConfig)
})
