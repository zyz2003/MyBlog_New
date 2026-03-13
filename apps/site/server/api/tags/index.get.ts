/**
 * 获取标签列表 API
 * GET /api/tags
 */

import { db, tags } from '@/server/db';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const allTags = await db.query.tags.findMany({
      orderBy: [asc(tags.name)],
    });

    return {
      data: allTags,
    };
  } catch (error: any) {
    console.error('Get tags error:', error);
    throw createError({
      statusCode: 500,
      message: '获取标签失败',
    });
  }
});
