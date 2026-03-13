/**
 * 创建分类 API
 * POST /api/categories
 */

import { getCurrentUser } from '../../middleware/auth';
import { db, categories } from '#db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  try {
    const user = getCurrentUser(event);

    if (!user?.id || user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '只有管理员可以创建分类',
      });
    }

    const body = await readBody(event);
    const { name, slug, description, parentId, sortOrder = 0 } = body;

    if (!name) {
      throw createError({
        statusCode: 400,
        message: '分类名称不能为空',
      });
    }

    // 生成 slug
    let finalSlug = slug || nanoid(8);

    // 检查 slug 是否已存在
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, finalSlug),
    });

    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'Slug 已存在',
      });
    }

    const newCategory = await db.insert(categories).values({
      id: nanoid(),
      name,
      slug: finalSlug,
      description,
      parentId,
      sortOrder,
      postCount: 0,
    }).returning();

    return newCategory;
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '创建分类失败',
    });
  }
});
