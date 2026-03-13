/**
 * 获取单篇文章 API
 * GET /api/articles/:slug
 */

import { db, posts, users } from '@/server/db';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug');

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: '缺少文章 slug 参数',
      });
    }

    // 获取文章详情
    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.slug, slug),
        // 如果不是管理员，只显示已发布的文章
        eq(posts.status, 'published')
      ),
      with: {
        author: {
          columns: { id: true, username: true, avatar: true, bio: true },
        },
        categories: {
          with: {
            category: {
              columns: { id: true, name: true, slug: true },
            },
          },
        },
        tags: {
          with: {
            tag: {
              columns: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '文章不存在',
      });
    }

    // 增加浏览量
    await db.update(posts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(posts.id, post.id));

    return {
      ...post,
      categories: post.categories.map((c: any) => c.category),
      tags: post.tags.map((t: any) => t.tag),
    };
  } catch (error: any) {
    console.error('Get article error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '获取文章失败',
    });
  }
});
