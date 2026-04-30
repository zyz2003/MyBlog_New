import { TagService } from '../../services/tag.service'
import { successResponse } from '../../utils/response'

/**
 * GET /api/tags
 * Public endpoint — list all tags
 */
export default defineEventHandler(async () => {
  const tagList = await TagService.list()
  return successResponse(tagList)
})
