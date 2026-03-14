/**
 * 更新文章 API
 * PUT /api/articles/:id
 */

import { getCurrentUser } from '../../middleware/auth';
import { db, posts, categories, tags, postCategories, postTags } from '#db';
import { eq, and } from 'drizzle-orm';

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

    // 检查文章是否存在，以及是否是作者
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        message: '文章不存在',
      });
    }

    // 只有作者或管理员可以编辑
    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '无权限编辑此文章',
      });
    }

    const body = await readBody(event);
    const {
      title,
      slug,
      summary,
      content,
      contentFormat,
      coverImage,
      status,
      categoryIds = [],
      tagIds = [],
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    // 如果修改了 slug，检查是否与其他文章冲突
    if (slug && slug !== existingPost.slug) {
      const conflictPost = await db.query.posts.findFirst({
        where: and(
          eq(posts.slug, slug),
          eq(posts.status, 'published')
        ),
      });

      if (conflictPost && conflictPost.id !== id) {
        throw createError({
          statusCode: 400,
          message: 'Slug 已被使用',
        });
      }
    }

    // 更新文章 (MySQL 不支持 .returning()，先 update 再 query)
    await db.update(posts)
      .set({
        title: title || existingPost.title,
        slug: slug || existingPost.slug,
        summary: summary !== undefined ? summary : existingPost.summary,
        content: content || existingPost.content,
        contentFormat: contentFormat || existingPost.contentFormat,
        coverImage: coverImage !== undefined ? coverImage : existingPost.coverImage,
        status: status || existingPost.status,
        seoTitle: seoTitle !== undefined ? seoTitle : existingPost.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existingPost.seoDescription,
        seoKeywords: seoKeywords !== undefined ? seoKeywords : existingPost.seoKeywords,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    // 更新分类关联（先删除旧的，再添加新的）
    if (categoryIds) {
      await db.delete(postCategories).where(eq(postCategories.postId, id));
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map((categoryId: string) => ({
          postId: id,
          categoryId,
          createdAt: new Date(),
        }));
        await db.insert(postCategories).values(categoryRelations);
      }
    }

    // 更新标签关联
    if (tagIds) {
      await db.delete(postTags).where(eq(postTags.postId, id));
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId: string) => ({
          postId: id,
          tagId,
          createdAt: new Date(),
        }));
        await db.insert(postTags).values(tagRelations);
      }
    }

    // 返回更新后的文章
    const result = await db.query.posts.findFirst({
      where: eq(posts.id, id),
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
      ...result,
      categories: result?.categories.map((c: any) => c.category),
      tags: result?.tags.map((t: any) => t.tag),
    };
  } catch (error: any) {
    console.error('Update article error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: '更新文章失败',
    });
  }
});
