/**
 * 删除文章 API
 * DELETE /api/articles/:id
 */

import { getCurrentUser } from '../../middleware/auth';
import { db, posts, postCategories, postTags } from '../db';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const user = getCurrentUser(event);

    if (!user?.id) {
      throw createError({
        statusCode: 401,
        message: '未授权，请先登录',
      });
    }

    const id = getRouterParam(event, 'id');
    if (!id) {
      throw createError({
        statusCode: 400,
        message: '缺少文章 ID',
      });
    }

    // 检查文章是否存在
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        message: '文章不存在',
      });
    }

    // 只有作者或管理员可以删除
    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '无权限删除此文章',
      });
    }

    // 删除关联数据（外键级联删除）
    await db.delete(postCategories).where(eq(postCategories.postId, id));
    await db.delete(postTags).where(eq(postTags.postId, id));

    // 删除文章
    await db.delete(posts).where(eq(posts.id, id));

    return {
      success: true,
      message: '文章已删除',
    };
  } catch (error: any) {
    console.error('Delete article error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '删除文章失败',
    });
  }
});
