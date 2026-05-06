import { PageService } from '../../services/page.service'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

/**
 * DELETE /api/pages/:id
 * Protected endpoint — soft delete a page
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const id = Number(event.context.params?.id)

  if (!id || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2001, '无效的页面 ID'),
    })
  }

  await PageService.delete(id)

  return successResponse(null, '删除成功')
})
