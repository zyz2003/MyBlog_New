/**
 * 数据库 Schema - 核心表 (P0) - MySQL 版本
 *
 * 包含博客系统最基础的表：
 * - users: 用户表
 * - posts: 文章表
 * - categories: 分类表
 * - tags: 标签表
 * - post_categories: 文章 - 分类关联
 * - post_tags: 文章 - 标签关联
 */

import { mysqlTable, varchar, text, int, timestamp, index, uniqueIndex, foreignKey } from 'drizzle-orm/mysql-core';

// ==================== 用户系统 ====================

/**
 * 用户表
 */
export const users = mysqlTable('users', {
  id: varchar('id', { length: 32 }).primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 255 }),
  bio: text('bio'),
  role: varchar('role', { length: 20 }).default('subscriber').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== 内容系统 ====================

/**
 * 文章表
 */
export const posts = mysqlTable('posts', {
  id: varchar('id', { length: 32 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: text('summary'),
  content: text('content').notNull(),
  contentFormat: varchar('content_format', { length: 20 }).default('markdown').notNull(),
  coverImage: varchar('cover_image', { length: 255 }),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  authorId: varchar('author_id', { length: 32 }).notNull(),
  publishedAt: timestamp('published_at'),
  scheduledAt: timestamp('scheduled_at'),
  viewCount: int('view_count').default(0),
  likeCount: int('like_count').default(0),
  commentCount: int('comment_count').default(0),
  isTop: int('is_top').default(0),
  isFeatured: int('is_featured').default(0),
  allowComments: int('allow_comments').default(1),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  idx_status: index('idx_posts_status').on(t.status),
  idx_author: index('idx_posts_author').on(t.authorId),
  idx_publishedAt: index('idx_posts_published_at').on(t.publishedAt),
  idx_slug: index('idx_posts_slug').on(t.slug),
  fk_author: foreignKey({
    columns: [t.authorId],
    foreignColumns: [users.id],
    name: 'fk_posts_author'
  }).onDelete('cascade'),
}));

/**
 * 分类表
 */
export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentId: varchar('parent_id', { length: 32 }),
  sortOrder: int('sort_order').default(0),
  postCount: int('post_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 标签表
 */
export const tags = mysqlTable('tags', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 20 }),
  postCount: int('post_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * 文章 - 分类关联表
 */
export const postCategories = mysqlTable('post_categories', {
  postId: varchar('post_id', { length: 32 }).notNull(),
  categoryId: varchar('category_id', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: uniqueIndex('pk_post_categories').on(t.postId, t.categoryId),
  fk_post: foreignKey({
    columns: [t.postId],
    foreignColumns: [posts.id],
    name: 'fk_pc_post'
  }).onDelete('cascade'),
  fk_category: foreignKey({
    columns: [t.categoryId],
    foreignColumns: [categories.id],
    name: 'fk_pc_category'
  }).onDelete('cascade'),
}));

/**
 * 文章 - 标签关联表
 */
export const postTags = mysqlTable('post_tags', {
  postId: varchar('post_id', { length: 32 }).notNull(),
  tagId: varchar('tag_id', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: uniqueIndex('pk_post_tags').on(t.postId, t.tagId),
  fk_post: foreignKey({
    columns: [t.postId],
    foreignColumns: [posts.id],
    name: 'fk_pt_post'
  }).onDelete('cascade'),
  fk_tag: foreignKey({
    columns: [t.tagId],
    foreignColumns: [tags.id],
    name: 'fk_pt_tag'
  }).onDelete('cascade'),
}));
