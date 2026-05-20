import { SettingsService } from '../../services/settings.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/settings
 * Public endpoint. Returns all settings, or a single category when requested.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category : ''

  const settings = category
    ? { [category]: await SettingsService.getByCategory(category) }
    : await SettingsService.getAll()

  return successResponse(settings)
})
