import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text, primaryKey, index } from 'drizzle-orm/sqlite-core'

// ========== Posts Table ==========
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content'),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  status: text('status', { enum: ['draft', 'published', 'scheduled'] }).notNull().default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  viewCount: integer('view_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  isTop: integer('is_top', { mode: 'boolean' }).notNull().default(false),
  allowComment: integer('allow_comment', { mode: 'boolean' }).notNull().default(true),
  password: text('password'),
  authorId: integer('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (t) => ({
  slugIdx: index('idx_posts_slug_unique').on(t.slug).where(sql`deleted_at IS NULL`),
  statusIdx: index('idx_posts_status').on(t.status),
  deletedAtIdx: index('idx_posts_deleted_at').on(t.deletedAt),
  createdAtIdx: index('idx_posts_created_at').on(t.createdAt),
  authorIdIdx: index('idx_posts_author_id').on(t.authorId),
}))

// ========== Categories Table ==========
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references((): any => categories.id),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ========== Tags Table ==========
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// ========== Post-Categories Junction Table ==========
export const postCategories = sqliteTable('post_categories', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.categoryId] }),
  categoryIdIdx: index('idx_post_categories_category_id').on(t.categoryId),
}))

// ========== Post-Tags Junction Table ==========
export const postTags = sqliteTable('post_tags', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.tagId] }),
  tagIdIdx: index('idx_post_tags_tag_id').on(t.tagId),
}))

// ========== Relations ==========

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(postCategories),
  tags: many(postTags),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parentChild',
  }),
  children: many(categories, { relationName: 'parentChild' }),
  posts: many(postCategories),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}))

// Need to import users for the posts relation
import { users } from './users'
