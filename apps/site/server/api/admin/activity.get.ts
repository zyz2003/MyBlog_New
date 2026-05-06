import { ActivityService } from '../../services/activity.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/admin/activity
 * Protected endpoint — recent activity logs
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : 20

  const activities = await ActivityService.getRecent(Math.min(100, Math.max(1, limit)))

  return successResponse(activities)
})
