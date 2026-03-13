/**
 * API: 获取文章列表
 * GET /api/posts
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const status = query.status || 'published';

  // TODO: 从数据库获取数据
  return {
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  };
});
