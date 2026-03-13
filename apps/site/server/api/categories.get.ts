/**
 * API: 获取分类列表
 * GET /api/categories
 */

export default defineEventHandler(async (event) => {
  // TODO: 从数据库获取数据
  return [
    { id: '1', name: '技术', slug: 'tech', postCount: 10 },
    { id: '2', name: '生活', slug: 'life', postCount: 5 },
  ];
});
