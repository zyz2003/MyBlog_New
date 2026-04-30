import { ArticleService } from '../../services/article.service'
import { successResponse, errorResponse, AuthErrors, BusinessErrors } from '../../utils/response'

/**
 * PUT /api/articles/:id
 * Protected endpoint — update an article
 */
export default defineEventHandler(async (event) => {
  // Auth check
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      data: errorResponse(AuthErrors.UNAUTHENTICATED.code, AuthErrors.UNAUTHENTICATED.message),
    })
  }

  const id = Number(event.context.params?.id)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      data: errorResponse(2002, '无效的文章 ID'),
    })
  }

  const body = await readBody(event)

  const article = await ArticleService.update(id, {
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt,
    coverImage: body.coverImage,
    status: body.status,
    publishedAt: body.publishedAt !== undefined ? (body.publishedAt ? new Date(body.publishedAt) : null) : undefined,
    scheduledAt: body.scheduledAt !== undefined ? (body.scheduledAt ? new Date(body.scheduledAt) : null) : undefined,
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    isTop: body.isTop,
    allowComment: body.allowComment,
    password: body.password,
    categoryIds: body.categoryIds,
    tagIds: body.tagIds,
    primaryCategoryId: body.primaryCategoryId,
  })

  if (!article) {
    throw createError({
      statusCode: 404,
      data: errorResponse(BusinessErrors.ARTICLE_NOT_FOUND.code, BusinessErrors.ARTICLE_NOT_FOUND.message),
    })
  }

  return successResponse(article)
})
