/**
 * 获取分类列表 API
 * GET /api/categories
 */

import { db, categories } from '../db';
import { eq, asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const allCategories = await db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });

    return {
      data: allCategories,
    };
  } catch (error: any) {
    console.error('Get categories error:', error);
    throw createError({
      statusCode: 500,
      message: '获取分类失败',
    });
  }
});
