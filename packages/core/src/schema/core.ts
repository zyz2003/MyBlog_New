/**
 * 数据库 Schema - 核心表 (P0)
 *
 * 包含博客系统最基础的表：
 * - users: 用户表
 * - posts: 文章表
 * - categories: 分类表
 * - tags: 标签表
 * - post_categories: 文章 - 分类关联
 * - post_tags: 文章 - 标签关联
 */

import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ==================== 用户系统 ====================

/**
 * 用户表
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  role: text('role', {
    enum: ['admin', 'editor', 'author', 'subscriber']
  }).default('subscriber').notNull(),
  status: text('status', {
    enum: ['active', 'inactive', 'banned']
  }).default('active').notNull(),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==================== 内容系统 ====================

/**
 * 文章表
 */
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary'),
  content: text('content').notNull(),
  contentFormat: text('content_format', {
    enum: ['markdown', 'html', 'rich-text']
  }).default('markdown').notNull(),
  coverImage: text('cover_image'),
  status: text('status', {
    enum: ['draft', 'published', 'scheduled', 'archived']
  }).default('draft').notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  isTop: integer('is_top', { mode: 'boolean' }).default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  allowComments: integer('allow_comments', { mode: 'boolean' }).default(true),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
  idx_status: index('idx_posts_status').on(t.status),
  idx_author: index('idx_posts_author').on(t.authorId),
  idx_publishedAt: index('idx_posts_published_at').on(t.publishedAt),
}));

/**
 * 分类表
 */
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: text('parent_id').references(() => categories.id, { onDelete: 'set-null' }),
  sortOrder: integer('sort_order').default(0),
  postCount: integer('post_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * 标签表
 */
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color'),
  postCount: integer('post_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * 文章 - 分类关联表
 */
export const postCategories = sqliteTable('post_categories', {
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
  pk: uniqueIndex('pk_post_categories').on(t.postId, t.categoryId),
}));

/**
 * 文章 - 标签关联表
 */
export const postTags = sqliteTable('post_tags', {
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (t) => ({
  pk: uniqueIndex('pk_post_tags').on(t.postId, t.tagId),
}));
