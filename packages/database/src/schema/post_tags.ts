import { sqliteTable, text, primaryKey, index, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { posts } from './posts'
import { tags } from './tags'

export const postTags = sqliteTable(
  'post_tags',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, {
        onDelete: 'cascade', // Per CONTEXT.md
      }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, {
        onDelete: 'cascade', // Per CONTEXT.md
      }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    postIdIdx: index('post_tags_post_idx').on(table.postId),
    tagIdIdx: index('post_tags_tag_idx').on(table.tagId),
  })
)

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

// Type exports
export type PostTag = typeof postTags.$inferSelect
export type NewPostTag = typeof postTags.$inferInsert
