/**
 * 数据库 Schema - 关系定义
 */

import { relations } from 'drizzle-orm';
import { users, posts, categories, tags, postCategories, postTags } from './core';

// 用户关系
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// 文章关系
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(postCategories),
  tags: many(postTags),
}));

// 分类关系
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories, {
    relationName: 'categoryHierarchy',
  }),
  postCategories: many(postCategories),
}));

// 标签关系
export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

// 文章 - 分类关联关系
export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

// 文章 - 标签关联关系
export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
