/**
 * 创建标签 API
 * POST /api/tags
 */

import { getCurrentUser } from '../../middleware/auth';
import { db, tags } from '../db.ts';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  try {
    const user = getCurrentUser(event);

    if (!user?.id || user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '只有管理员可以创建标签',
      });
    }

    const body = await readBody(event);
    const { name, slug, description, color } = body;

    if (!name) {
      throw createError({
        statusCode: 400,
        message: '标签名称不能为空',
      });
    }

    // 生成 slug
    let finalSlug = slug || nanoid(8);

    // 检查 slug 是否已存在
    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, finalSlug),
    });

    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'Slug 已存在',
      });
    }

    const newTag = await db.insert(tags).values({
      id: nanoid(),
      name,
      slug: finalSlug,
      description,
      color,
      postCount: 0,
    }).returning();

    return newTag;
  } catch (error: any) {
    console.error('Create tag error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '创建标签失败',
    });
  }
});
