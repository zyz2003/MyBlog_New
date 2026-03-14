/**
 * 认证中间件
 * 验证 JWT token，保护需要认证的路由
 */

import { jwtVerify, SignJWT } from 'jose';
import type { H3Event } from 'h3';

// JWT 密钥 - 生产环境必须设置 JWT_SECRET 环境变量
const JWT_SECRET_ENV = process.env.JWT_SECRET;

if (!JWT_SECRET_ENV) {
  console.warn('WARNING: JWT_SECRET environment variable is not set!');
  console.warn('Using a temporary secret for development only.');
  console.warn('Set JWT_SECRET in your .env file before deploying to production.');
}

const JWT_SECRET = new TextEncoder().encode(
  JWT_SECRET_ENV || 'dev-secret-key-must-change-in-production'
);

// 不需要认证的路由
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/auth/login',
  '/api/posts',
  '/api/posts/',
  '/api/categories',
  '/api/tags',
];

export default defineEventHandler(async (event) => {
  const path = event.node.req.url || '';

  // 跳过不需要认证的路由
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return;
  }

  // 获取 token
  const authHeader = getHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    // 对于 API 请求，返回 401
    if (path.startsWith('/api/')) {
      throw createError({
        statusCode: 401,
        message: '未授权，请先登录',
      });
    }
    return;
  }

  try {
    // 验证 token
    const verified = await jwtVerify(token, JWT_SECRET);
    // 将用户信息添加到上下文中
    setContext(event, 'user', verified.payload);
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Token 无效或已过期',
    });
  }
});

/**
 * 获取当前用户
 */
export function getCurrentUser(event: H3Event) {
  return getContext(event, 'user');
}

/**
 * 生成 JWT token
 */
export async function createToken(payload: { id: string; username: string; role: string }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}
