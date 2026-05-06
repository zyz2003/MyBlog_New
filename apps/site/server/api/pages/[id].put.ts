import { PageService } from '../../services/page.service'
import { successResponse, errorResponse, AuthErrors } from '../../utils/response'

/**
 * PUT /api/pages/:id
 * Protected endpoint — update a page
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

  const body = await readBody(event)

  const page = await PageService.update(id, {
    title: body?.title,
    slug: body?.slug,
    componentCode: body?.componentCode,
    template: body?.template,
    seoTitle: body?.seoTitle,
    seoDescription: body?.seoDescription,
    showInNav: body?.showInNav,
    navLabel: body?.navLabel,
    navOrder: body?.navOrder,
    status: body?.status,
  })

  return successResponse(page)
})
