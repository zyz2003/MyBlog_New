/**
 * 获取分类详情 API
 * GET /api/categories/:slug
 */

import { db, categories, posts, postCategories } from '../db.ts';
import { eq, and, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug');

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: '缺少分类 slug',
      });
    }

    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (!category) {
      throw createError({
        statusCode: 404,
        message: '分类不存在',
      });
    }

    // 获取分类下的文章数量
    const postCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(postCategories)
      .where(eq(postCategories.categoryId, category.id));

    const postCount = Number(postCountResult[0].count);

    // 更新分类的文章数
    if (postCount !== category.postCount) {
      await db.update(categories)
        .set({ postCount })
        .where(eq(categories.id, category.id));
    }

    return {
      ...category,
      postCount,
    };
  } catch (error: any) {
    console.error('Get category error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '获取分类详情失败',
    });
  }
});
