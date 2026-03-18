import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { postTags } from './post_tags'

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    // Extended fields per CONTEXT.md (optional for frontend display)
    description: text('description'),
    color: text('color'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index('tags_slug_idx').on(table.slug),
  })
)

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}))

// Type exports
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
