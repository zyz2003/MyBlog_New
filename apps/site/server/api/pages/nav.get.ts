import { PageService } from '../../services/page.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/pages/nav
 * Public endpoint — list pages that should appear in navigation
 */
export default defineEventHandler(async (_event) => {
  const pages = await PageService.getNavPages()
  return successResponse(pages)
})
