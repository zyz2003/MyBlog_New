/**
 * 健康检查
 * GET /api/health
 */

export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.0.1',
  };
});
