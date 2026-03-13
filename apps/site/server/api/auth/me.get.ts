/**
 * 获取当前用户信息
 * GET /api/auth/me
 */

import { getCurrentUser } from '../../middleware/auth';
import { db } from '../db';
import { users } from '@my-blog/core/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event);

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: '未登录',
    });
  }

  // 从数据库获取用户完整信息
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: {
      password: false, // 不返回密码
    },
  });

  if (!userProfile) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    });
  }

  return userProfile;
});
