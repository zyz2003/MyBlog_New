/**
 * API: 获取标签列表
 * GET /api/tags
 */

export default defineEventHandler(async (event) => {
  // TODO: 从数据库获取数据
  return [
    { id: '1', name: 'Vue3', slug: 'vue3', postCount: 5 },
    { id: '2', name: 'TypeScript', slug: 'typescript', postCount: 3 },
  ];
});
