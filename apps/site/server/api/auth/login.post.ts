/**
 * 用户登录 API
 * POST /api/auth/login
 */

import { createToken } from '../../middleware/auth';
import { db } from '../db';
import { users } from '@my-blog/core/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: '用户名和密码不能为空',
      });
    }

    // 查找用户
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误',
      });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误',
      });
    }

    // 生成 token
    const token = await createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // 更新最后登录时间
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Login error:', error);
    throw createError({
      statusCode: 500,
      message: '登录失败，请稍后重试',
    });
  }
});
