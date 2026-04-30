import { MediaService } from '../../services/media.service'
import { successResponse } from '../../utils/response'

/**
 * DELETE /api/media/:id
 * Protected endpoint — removes file from storage + DB record
 * Auth handled by middleware (/api/media/ is protected)
 */
export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '未登录',
    })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: '无效的媒体 ID',
    })
  }

  await MediaService.delete(id)
  return successResponse({ id }, '媒体文件已删除')
})
