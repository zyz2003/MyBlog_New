/**
 * 获取文章列表 API
 * GET /api/articles
 */

import { db, posts, users, categories, tags, postCategories, postTags } from '@/server/db';
import { eq, and, desc, sql, like, or } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const status = query.status || 'published';
    const categorySlug = query.category;
    const tagSlug = query.tag;
    const search = query.search;

    // 构建查询条件
    let whereCondition = and(eq(posts.status, status));

    // 按分类过滤
    if (categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug as string),
      });

      if (category) {
        const postIdsInCategory = await db.select({ postId: postCategories.postId })
          .from(postCategories)
          .where(eq(postCategories.categoryId, category.id));

        whereCondition = and(
          whereCondition,
          sql`${posts.id} IN (${sql.join(postIdsInCategory.map(p => sql.literal(`'${p.postId}'`)), sql`, `)})`
        );
      }
    }

    // 按标签过滤
    if (tagSlug) {
      const tag = await db.query.tags.findFirst({
        where: eq(tags.slug, tagSlug as string),
      });

      if (tag) {
        const postIdsWithTag = await db.select({ postId: postTags.postId })
          .from(postTags)
          .where(eq(postTags.tagId, tag.id));

        whereCondition = and(
          whereCondition,
          sql`${posts.id} IN (${sql.join(postIdsWithTag.map(p => sql.literal(`'${p.postId}'`)), sql`, `)})`
        );
      }
    }

    // 搜索
    if (search) {
      whereCondition = and(
        whereCondition,
        or(
          like(posts.title, `%${search}%`),
          like(posts.summary, `%${search}%`),
          like(posts.content, `%${search}%`)
        )
      );
    }

    // 获取总数
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(whereCondition);
    const total = Number(totalResult[0].count);

    // 获取文章列表
    const postsList = await db.query.posts.findMany({
      where: whereCondition,
      with: {
        author: {
          columns: { id: true, username: true, avatar: true },
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
      orderBy: [
        desc(posts.isTop),
        desc(posts.publishedAt),
        desc(posts.createdAt),
      ],
      limit,
      offset: (page - 1) * limit,
    });

    // 格式化返回数据
    const formattedPosts = postsList.map(post => ({
      ...post,
      categories: post.categories.map(c => c.category),
      tags: post.tags.map(t => t.tag),
    }));

    return {
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('Get articles error:', error);
    throw createError({
      statusCode: 500,
      message: '获取文章列表失败',
    });
  }
});
