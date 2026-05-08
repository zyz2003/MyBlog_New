import { PageService } from '../../../services/page.service'
import { successResponse } from '../../../utils/response'

/**
 * GET /api/admin/pages
 * Protected endpoint — list all pages for admin (no status filter by default)
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const query = getQuery(event)

  const result = await PageService.list({
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    status: query.status as string | undefined,
  })

  return successResponse(result)
})