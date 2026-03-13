/**
 * 创建文章 API
 * POST /api/articles
 */

import { getCurrentUser } from '../../middleware/auth';
import { db, posts, categories, tags, postCategories, postTags } from '../db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  try {
    const user = getCurrentUser(event);

    if (!user?.id) {
      throw createError({
        statusCode: 401,
        message: '未授权，请先登录',
      });
    }

    const body = await readBody(event);
    const {
      title,
      slug,
      summary,
      content,
      contentFormat = 'markdown',
      coverImage,
      status = 'draft',
      categoryIds = [],
      tagIds = [],
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    // 验证必填字段
    if (!title || !content) {
      throw createError({
        statusCode: 400,
        message: '标题和内容不能为空',
      });
    }

    // 生成 slug（如果没有提供）
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = nanoid(10);
    }

    // 检查 slug 是否已存在
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.slug, finalSlug),
    });

    if (existingPost) {
      throw createError({
        statusCode: 400,
        message: 'Slug 已存在，请使用其他 slug',
      });
    }

    // 创建文章
    const postId = nanoid();
    const now = new Date();

    const newPost = await db.insert(posts).values({
      id: postId,
      title,
      slug: finalSlug,
      summary,
      content,
      contentFormat,
      coverImage,
      status,
      authorId: user.id,
      publishedAt: status === 'published' ? now : null,
      seoTitle,
      seoDescription,
      seoKeywords,
      createdAt: now,
      updatedAt: now,
    }).returning();

    // 关联分类
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map((categoryId: string) => ({
        postId,
        categoryId,
        createdAt: now,
      }));
      await db.insert(postCategories).values(categoryRelations);
    }

    // 关联标签
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId: string) => ({
        postId,
        tagId,
        createdAt: now,
      }));
      await db.insert(postTags).values(tagRelations);
    }

    // 返回创建的文章
    const createdPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
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
    });

    return {
      ...createdPost,
      categories: createdPost?.categories.map((c: any) => c.category),
      tags: createdPost?.tags.map((t: any) => t.tag),
    };
  } catch (error: any) {
    console.error('Create article error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '创建文章失败',
    });
  }
});
