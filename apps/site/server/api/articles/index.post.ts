import { ArticleService } from '../../services/article.service'
import { successResponse, errorResponse, AuthErrors, ValidationErrors } from '../../utils/response'

/**
 * POST /api/articles
 * Protected endpoint — create a new article
 */
export default defineEventHandler(async (event) => {
  // Auth check
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const body = await readBody(event)

  // Validate required fields
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

  const article = await ArticleService.create(
    {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      status: body.status,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      isTop: body.isTop,
      allowComment: body.allowComment,
      password: body.password,
      categoryIds: body.categoryIds,
      tagIds: body.tagIds,
      primaryCategoryId: body.primaryCategoryId,
    },
    event.context.user.id,
  )

  setResponseStatus(event, 201)
  return successResponse(article)
})
