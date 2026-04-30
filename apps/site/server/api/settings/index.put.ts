import { SettingsService } from '../../services/settings.service'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

/**
 * PUT /api/settings
 * Protected endpoint — update system settings
 * Accepts single { key, value } or array of { key, value } for batch update
 */
export default defineEventHandler(async (event) => {
  // Manual auth check — settings PUT requires admin
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const body = await readBody(event)
  if (!body) {
    throw createError({
      statusCode: 400,
      message: '请提供设置数据',
    })
  }

  // Batch update: body is an array
  if (Array.isArray(body)) {
    if (body.length === 0) {
      throw createError({
        statusCode: 400,
        message: '设置列表不能为空',
      })
    }

    for (const item of body) {
      if (!item.key) {
        throw createError({
          statusCode: 400,
          message: '每个设置项必须包含 key',
        })
      }
    }

    const results = await SettingsService.batchUpdate(body)
    return successResponse(results, '设置已批量更新')
  }

  // Single update: body is { key, value, category?, description? }
  if (!body.key) {
    throw createError({
      statusCode: 400,
      message: '请提供设置 key',
    })
  }

  const record = await SettingsService.upsert(
    body.key,
    body.value,
    body.category,
    body.description,
  )
  return successResponse(record, '设置已更新')
})
