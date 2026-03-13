/**
 * API: 获取单篇文章
 * GET /api/posts/:slug
 */

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Missing slug parameter',
    });
  }

  // TODO: 从数据库获取数据
  return {
    id: '1',
    title: '示例文章',
    slug: 'example-post',
    content: '这是示例内容',
    authorId: '1',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});
