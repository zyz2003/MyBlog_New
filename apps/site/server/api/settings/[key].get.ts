import { SettingsService } from '../../services/settings.service'
import { successResponse, errorResponse, BusinessErrors } from '../../utils/response'

/**
 * GET /api/settings/:key
 * Public endpoint — returns a single setting by key
 */
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({
      statusCode: 400,
      message: '请提供设置 key',
    })
  }

  const setting = await SettingsService.getByKey(key)
  if (!setting) {
    throw createError({
      statusCode: 404,
      data: errorResponse(
        BusinessErrors.SETTING_NOT_FOUND.code,
        BusinessErrors.SETTING_NOT_FOUND.message,
      ),
    })
  }

  return successResponse(setting)
})
