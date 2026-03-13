/**
 * 用户登出 API
 * POST /api/auth/logout
 */

export default defineEventHandler(async (event) => {
  // 在 JWT 模式下，客户端只需丢弃 token
  // 如果需要实现 token 黑名单，可以在这里添加逻辑

  return {
    success: true,
    message: '已退出登录',
  };
});
