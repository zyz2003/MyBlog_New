import { PageService } from '../../services/page.service'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../utils/response'

/**
 * POST /api/pages
 * Protected endpoint — create a new page
 */
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const body = await readBody(event)

  if (!body?.title) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, '标题不能为空'),
    })
  }

  if (!body?.slug) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, 'Slug 不能为空'),
    })
  }

  if (!body?.componentCode) {
    throw createError({
      statusCode: 400,
      data: errorResponse(ValidationErrors.MISSING_PARAM.code, '组件代码不能为空'),
    })
  }

  const page = await PageService.create(
    {
      title: body.title,
      slug: body.slug,
      componentCode: body.componentCode,
      template: body.template,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      showInNav: body.showInNav,
      navLabel: body.navLabel,
      navOrder: body.navOrder,
      status: body.status,
    },
    event.context.user.id,
  )

  setResponseStatus(event, 201)
  return successResponse(page)
})
