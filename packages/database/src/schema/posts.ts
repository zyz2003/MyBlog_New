import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { categories } from './categories'
import { postTags } from './post_tags'

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    // Full fields per CONTEXT.md
    coverImage: text('cover_image'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: text('status', {
      enum: ['draft', 'reviewing', 'published', 'archived'],
    })
      .default('draft')
      .notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade', // Per CONTEXT.md: delete user → cascade delete posts
      }),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    // Statistics fields
    viewCount: integer('view_count').default(0),
    likeCount: integer('like_count').default(0),
    // Timestamps
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index('posts_slug_idx').on(table.slug),
    authorIdIdx: index('posts_author_idx').on(table.authorId),
    statusIdx: index('posts_status_idx').on(table.status),
    categoryIdIdx: index('posts_category_idx').on(table.categoryId),
    createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
  })
)

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postTags: many(postTags),
}))

// Type exports
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
