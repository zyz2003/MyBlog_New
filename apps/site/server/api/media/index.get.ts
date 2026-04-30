import { MediaService } from '../../services/media.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/media?page=1&pageSize=20
 * Protected endpoint — returns paginated media list
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

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20

  const result = await MediaService.list({ page, pageSize })
  return successResponse(result)
})
