import { PageService } from '../../services/page.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/pages
 * Public endpoint — list published pages
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const result = await PageService.list({
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    status: 'published',
  })

  return successResponse(result)
})
