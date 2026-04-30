import { SettingsService } from '../../services/settings.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/settings
 * Public endpoint — returns all system settings grouped by category
 * Needed for SSR site configuration rendering
 */
export default defineEventHandler(async () => {
  const settings = await SettingsService.getAll()
  return successResponse(settings)
})
